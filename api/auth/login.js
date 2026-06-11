import { createSessionToken, jsonMethod } from "../admin/_lib/session.js";
import { getServiceClient, readGuestPasswords } from "../admin/_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["POST"])) return;

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const { lunchPassword, fullPassword } = await readGuestPasswords();

  if (adminPassword && password === adminPassword) {
    res.status(200).json(createSessionToken("admin"));
    return;
  }

  if (password === fullPassword) {
    res.status(200).json(createSessionToken("full"));
    return;
  }

  if (password === lunchPassword) {
    res.status(200).json(createSessionToken("lunch"));
    return;
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("invite_groups")
      .select("id,dinner_allowed_count,dinner_guest_names")
      .eq("invite_password", password)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      const dinnerGuestCount = Array.isArray(data.dinner_guest_names) ? data.dinner_guest_names.length : 0;
      const role = dinnerGuestCount || Number(data.dinner_allowed_count || 0) ? "full" : "lunch";
      res.status(200).json(createSessionToken(role, String(data.id)));
      return;
    }
  } catch (error) {
    console.error("Unable to check invite password.", error);
  }

  res.status(401).json({ error: "Invalid password." });
}
