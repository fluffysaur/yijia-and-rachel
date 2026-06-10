import { createSessionToken, jsonMethod } from "../admin/_lib/session.js";
import { readGuestPasswords } from "../admin/_lib/supabase.js";

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

  res.status(401).json({ error: "Invalid password." });
}
