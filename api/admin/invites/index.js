import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient, listAdminInviteRows, mapInviteGroup, normalizeName } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "POST"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      res.status(200).json({ rows: await listAdminInviteRows() });
      return;
    }

    const input = req.body || {};
    const groupName = String(input.groupName || "").trim();
    if (!groupName) {
      res.status(400).json({ error: "Invite group name is required." });
      return;
    }

    const guestNames = Array.isArray(input.guestNames) ? input.guestNames.filter(Boolean).map(String) : [];
    const fallbackGuestNames = Array.from(
      { length: Number(input.ceremonyAllowedCount || guestNames.length || 1) },
      (_, index) => `Guest ${index + 1}`,
    );
    const finalGuestNames = guestNames.length ? guestNames : fallbackGuestNames;
    const providedDinnerGuestNames = Array.isArray(input.dinnerGuestNames)
      ? input.dinnerGuestNames.filter(Boolean).map(String)
      : [];
    const dinnerAllowedCount = Number(input.dinnerAllowedCount || providedDinnerGuestNames.length || 0);
    const dinnerGuestNames = providedDinnerGuestNames.length
      ? providedDinnerGuestNames
      : finalGuestNames.slice(0, dinnerAllowedCount);
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("invite_groups")
      .insert({
        group_name: groupName,
        normalized_name: normalizeName([groupName, ...finalGuestNames, ...dinnerGuestNames].join(" ")),
        guest_names: finalGuestNames,
        dinner_guest_names: dinnerGuestNames,
        ceremony_allowed_count: finalGuestNames.length,
        dinner_allowed_count: dinnerGuestNames.length,
        notes: input.notes || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    res.status(200).json({ invite: mapInviteGroup(data) });
  } catch (error) {
    console.error("Unable to save invite.", error);
    res.status(500).json({ error: "Unable to save invite." });
  }
}
