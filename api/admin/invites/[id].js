import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient, mapInviteGroup, normalizeName } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["DELETE", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const supabase = getServiceClient();

    if (req.method === "DELETE") {
      const { error } = await supabase.from("invite_groups").delete().eq("id", req.query.id);
      if (error) throw error;
      res.status(200).json({ ok: true });
      return;
    }

    const input = req.body || {};
    const groupName = String(input.groupName || "").trim();
    const guestNames = Array.isArray(input.guestNames) ? input.guestNames.filter(Boolean).map(String) : [];
    const dinnerGuestNames = Array.isArray(input.dinnerGuestNames)
      ? input.dinnerGuestNames.filter(Boolean).map(String)
      : [];

    if (!groupName) {
      res.status(400).json({ error: "Invite group name is required." });
      return;
    }

    const { data, error } = await supabase
      .from("invite_groups")
      .update({
        group_name: groupName,
        normalized_name: normalizeName([groupName, ...guestNames, ...dinnerGuestNames].join(" ")),
        guest_names: guestNames,
        dinner_guest_names: dinnerGuestNames,
        ceremony_allowed_count: guestNames.length,
        dinner_allowed_count: dinnerGuestNames.length,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.query.id)
      .select("*")
      .single();
    if (error) throw error;
    res.status(200).json({ invite: mapInviteGroup(data) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update invite." });
  }
}
