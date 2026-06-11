import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient, readInviteMessageTemplates } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      res.status(200).json(await readInviteMessageTemplates());
      return;
    }

    const lunchTemplate = String(req.body?.lunchTemplate || "").trim();
    const dinnerTemplate = String(req.body?.dinnerTemplate || "").trim();
    if (!lunchTemplate || !dinnerTemplate) {
      res.status(400).json({ error: "Both invite message templates are required." });
      return;
    }

    const rows = [
      { key: "invite_template_lunch", value: lunchTemplate, updated_at: new Date().toISOString() },
      { key: "invite_template_dinner", value: dinnerTemplate, updated_at: new Date().toISOString() },
    ];
    const { error } = await getServiceClient().from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;

    res.status(200).json({ lunchTemplate, dinnerTemplate });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save invite message templates." });
  }
}
