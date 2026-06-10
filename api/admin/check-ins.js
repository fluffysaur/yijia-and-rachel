import { jsonMethod, requireAdmin } from "./_lib/session.js";
import { getServiceClient } from "./_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const { inviteGroupId, eventType, checkedInNames } = req.body || {};
    const { error } = await getServiceClient().from("check_ins").upsert(
      {
        invite_group_id: inviteGroupId,
        event_type: eventType,
        checked_in_count: Array.isArray(checkedInNames) ? checkedInNames.length : 0,
        checked_in_names: Array.isArray(checkedInNames) ? checkedInNames.map(String) : [],
        checked_in_at: new Date().toISOString(),
      },
      { onConflict: "invite_group_id,event_type" },
    );
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update check-in." });
  }
}
