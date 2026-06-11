import { jsonMethod, requireAdmin } from "../../_lib/session.js";
import { getServiceClient, mapInviteGroup } from "../../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const rawInvitedAt = typeof req.body?.invitedAt === "string" ? req.body.invitedAt.trim() : "";
    const invitedAt = rawInvitedAt || null;
    if (invitedAt && Number.isNaN(new Date(invitedAt).getTime())) {
      res.status(400).json({ error: "Invited timestamp must be a valid date and time." });
      return;
    }

    const { data, error } = await getServiceClient()
      .from("invite_groups")
      .update({
        invited_at: invitedAt ? new Date(invitedAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.query.id)
      .select("*")
      .single();
    if (error) throw error;

    res.status(200).json({ invite: mapInviteGroup(data) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update invite status." });
  }
}
