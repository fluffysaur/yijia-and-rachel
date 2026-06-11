import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient, readRsvpSettings } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      res.status(200).json(await readRsvpSettings());
      return;
    }

    const rawDeadline = typeof req.body?.rsvpDeadline === "string" ? req.body.rsvpDeadline.trim() : "";
    const rsvpDeadline = rawDeadline || null;
    if (rsvpDeadline && Number.isNaN(new Date(rsvpDeadline).getTime())) {
      res.status(400).json({ error: "RSVP deadline must be a valid date and time." });
      return;
    }

    const supabase = getServiceClient();
    if (rsvpDeadline) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: "rsvp_deadline", value: new Date(rsvpDeadline).toISOString(), updated_at: new Date().toISOString() },
          { onConflict: "key" },
        );
      if (error) throw error;
    } else {
      const { error } = await supabase.from("site_settings").delete().eq("key", "rsvp_deadline");
      if (error) throw error;
    }

    res.status(200).json({ rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save RSVP settings." });
  }
}
