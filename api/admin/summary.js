import { jsonMethod, requireAdmin } from "./_lib/session.js";
import { listAdminInviteRows } from "./_lib/supabase.js";

const dinnerMealOptions = ["Option 1", "Option 2", "Halal", "Vegetarian"];

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["GET"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const rows = await listAdminInviteRows();
    const responses = rows.map((row) => row.rsvp).filter(Boolean);
    const mealCounts = Object.fromEntries(dinnerMealOptions.map((option) => [option, 0]));
    responses.forEach((response) => {
      response.dinnerAttendees.forEach((attendee) => {
        mealCounts[attendee.mealOption] = (mealCounts[attendee.mealOption] || 0) + 1;
      });
    });

    res.status(200).json({
      summary: {
        totalInviteGroups: rows.length,
        ceremonyInvited: rows.reduce((sum, group) => sum + group.ceremonyAllowedCount, 0),
        ceremonyAttending: responses.reduce((sum, response) => sum + response.ceremonyAttendingCount, 0),
        dinnerInvited: rows.reduce((sum, group) => sum + group.dinnerAllowedCount, 0),
        dinnerAttending: responses.reduce((sum, response) => sum + response.dinnerAttendingCount, 0),
        pendingResponses: rows.length - responses.length,
        mealCounts,
      },
    });
  } catch (error) {
    console.error("Unable to load summary.", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load summary." });
  }
}
