import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient, readGuestPasswords } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      res.status(200).json(await readGuestPasswords());
      return;
    }

    const lunchPassword = String(req.body?.lunchPassword || "").trim();
    const fullPassword = String(req.body?.fullPassword || "").trim();
    if (!lunchPassword || !fullPassword) {
      res.status(400).json({ error: "Lunch and full passwords are required." });
      return;
    }

    const rows = [
      { key: "lunch_password", value: lunchPassword, updated_at: new Date().toISOString() },
      { key: "full_password", value: fullPassword, updated_at: new Date().toISOString() },
    ];
    const { error } = await getServiceClient().from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;

    res.status(200).json({ lunchPassword, fullPassword });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save passwords." });
  }
}
