import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["DELETE"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const { error } = await getServiceClient().from("invite_groups").delete().eq("id", req.query.id);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to delete invite." });
  }
}
