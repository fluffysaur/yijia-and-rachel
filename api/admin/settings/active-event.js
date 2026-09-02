import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const supabase = getServiceClient();

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "active_check_in_event")
        .maybeSingle();
      if (error) throw error;

      const activeEvent = data?.value === "dinner" ? "dinner" : "ceremony";
      res.status(200).json({ activeEvent });
      return;
    }

    const requestedEvent = req.body?.activeEvent;
    if (requestedEvent !== "ceremony" && requestedEvent !== "dinner") {
      res.status(400).json({ error: "Invalid active event. Must be ceremony or dinner." });
      return;
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: "active_check_in_event", value: requestedEvent, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) throw error;

    res.status(200).json({ activeEvent: requestedEvent });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save active event setting." });
  }
}
