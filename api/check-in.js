import { jsonMethod, verifySessionToken } from "./admin/_lib/session.js";
import { getServiceClient, mapInviteGroup } from "./admin/_lib/supabase.js";

function getSessionFromReq(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return verifySessionToken(token);
}

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "PUT"])) return;

  try {
    const supabase = getServiceClient();
    const session = getSessionFromReq(req);

    if (req.method === "GET") {
      const invitePassword = typeof req.query?.invitePassword === "string" ? req.query.invitePassword.trim() : "";
      const requestedGroupId = typeof req.query?.inviteGroupId === "string" ? req.query.inviteGroupId.trim() : "";
      const targetGroupId = session?.inviteGroupId || requestedGroupId;

      let inviteGroupRow = null;

      if (invitePassword) {
        const { data, error } = await supabase
          .from("invite_groups")
          .select("*")
          .eq("invite_password", invitePassword)
          .maybeSingle();
        if (error) throw error;
        inviteGroupRow = data;
      } else if (targetGroupId && (session?.role === "admin" || session?.inviteGroupId === targetGroupId)) {
        const { data, error } = await supabase
          .from("invite_groups")
          .select("*")
          .eq("id", targetGroupId)
          .maybeSingle();
        if (error) throw error;
        inviteGroupRow = data;
      }

      if (!inviteGroupRow) {
        res.status(401).json({ error: "Invalid password or session." });
        return;
      }

      // Determine active event
      let eventType = req.query?.eventType === "dinner" || req.query?.eventType === "ceremony"
        ? req.query.eventType
        : null;

      if (!eventType) {
        const { data: settingData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "active_check_in_event")
          .maybeSingle();
        eventType = settingData?.value === "dinner" ? "dinner" : "ceremony";
      }

      // Read RSVP if exists
      const { data: rsvpRow } = await supabase
        .from("rsvp_responses")
        .select("id")
        .eq("invite_group_id", inviteGroupRow.id)
        .maybeSingle();

      let candidateNames = [];
      const hasRsvp = Boolean(rsvpRow);

      if (rsvpRow) {
        if (eventType === "ceremony") {
          const { data: attendees } = await supabase
            .from("ceremony_attendees")
            .select("attendee_label")
            .eq("rsvp_response_id", rsvpRow.id);
          candidateNames = (attendees ?? []).map((a) => String(a.attendee_label).trim()).filter(Boolean);
        } else {
          const { data: attendees } = await supabase
            .from("dinner_attendees")
            .select("attendee_label")
            .eq("rsvp_response_id", rsvpRow.id);
          candidateNames = (attendees ?? []).map((a) => String(a.attendee_label).trim()).filter(Boolean);
        }
      }

      const inviteGroup = mapInviteGroup(inviteGroupRow);
      if (!candidateNames.length) {
        if (eventType === "ceremony") {
          candidateNames = inviteGroup.guestNames;
        } else {
          candidateNames = inviteGroup.dinnerGuestNames.length
            ? inviteGroup.dinnerGuestNames
            : inviteGroup.guestNames;
        }
      }

      // Read existing check-in
      const { data: checkInRow } = await supabase
        .from("check_ins")
        .select("checked_in_names")
        .eq("invite_group_id", inviteGroupRow.id)
        .eq("event_type", eventType)
        .maybeSingle();

      const checkedInNames = Array.isArray(checkInRow?.checked_in_names)
        ? checkInRow.checked_in_names.map(String)
        : [];

      const attendees = candidateNames.map((name) => ({
        name,
        checkedIn: checkedInNames.includes(name),
      }));

      res.status(200).json({
        inviteGroup,
        eventType,
        attendees,
        checkedInNames,
        hasRsvp,
      });
      return;
    }

    if (req.method === "PUT") {
      const { inviteGroupId, eventType, checkedInNames, invitePassword } = req.body || {};

      if (!inviteGroupId || (eventType !== "ceremony" && eventType !== "dinner")) {
        res.status(400).json({ error: "inviteGroupId and valid eventType are required." });
        return;
      }

      // Verify authorization: session matches target group or admin, or valid invite password provided
      let authorized = session?.role === "admin" || session?.inviteGroupId === inviteGroupId;

      if (!authorized && invitePassword) {
        const { data: group } = await supabase
          .from("invite_groups")
          .select("id")
          .eq("id", inviteGroupId)
          .eq("invite_password", invitePassword.trim())
          .maybeSingle();
        if (group) authorized = true;
      }

      if (!authorized) {
        res.status(403).json({ error: "You are not authorized to check in for this group." });
        return;
      }

      const safeNames = Array.isArray(checkedInNames) ? checkedInNames.map(String) : [];

      const { error } = await supabase.from("check_ins").upsert(
        {
          invite_group_id: inviteGroupId,
          event_type: eventType,
          checked_in_count: safeNames.length,
          checked_in_names: safeNames,
          checked_in_at: new Date().toISOString(),
        },
        { onConflict: "invite_group_id,event_type" }
      );

      if (error) throw error;

      res.status(200).json({ ok: true });
      return;
    }
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to process check-in." });
  }
}
