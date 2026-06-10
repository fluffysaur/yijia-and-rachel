import { jsonMethod, requireAdmin } from "../_lib/session.js";
import { getServiceClient } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!jsonMethod(req, res, ["DELETE", "PUT"])) return;
  if (!requireAdmin(req, res)) return;

  try {
    const supabase = getServiceClient();

    if (req.method === "DELETE") {
      const { error } = await supabase.from("rsvp_responses").delete().eq("id", req.query.id);
      if (error) throw error;
      res.status(200).json({ ok: true });
      return;
    }

    const response = req.body?.response;
    if (!response || response.id !== req.query.id || !response.inviteGroupId) {
      res.status(400).json({ error: "Invalid RSVP payload." });
      return;
    }

    const timestamp = new Date().toISOString();
    const { error: responseError } = await supabase.from("rsvp_responses").upsert(
      {
        id: response.id,
        invite_group_id: response.inviteGroupId,
        responder_name: response.responderName,
        ceremony_attending_count: response.ceremonyAttendingCount,
        dinner_attending_count: response.dinnerAttendingCount,
        general_notes: response.generalNotes,
        locked_for_guest_edit: true,
        submitted_at: response.submittedAt || timestamp,
        updated_at: timestamp,
      },
      { onConflict: "id" },
    );
    if (responseError) throw responseError;

    const { error: deleteCeremonyError } = await supabase
      .from("ceremony_attendees")
      .delete()
      .eq("rsvp_response_id", response.id);
    if (deleteCeremonyError) throw deleteCeremonyError;

    const { error: deleteDinnerError } = await supabase
      .from("dinner_attendees")
      .delete()
      .eq("rsvp_response_id", response.id);
    if (deleteDinnerError) throw deleteDinnerError;

    if (response.ceremonyAttendees?.length) {
      const { error } = await supabase.from("ceremony_attendees").insert(
        response.ceremonyAttendees.map((attendee) => ({
          rsvp_response_id: response.id,
          attendee_index: attendee.attendeeIndex,
          attendee_label: attendee.attendeeLabel,
          dietary_preference: attendee.dietaryPreference,
        })),
      );
      if (error) throw error;
    }

    if (response.dinnerAttendees?.length) {
      const { error } = await supabase.from("dinner_attendees").insert(
        response.dinnerAttendees.map((attendee) => ({
          rsvp_response_id: response.id,
          attendee_index: attendee.attendeeIndex,
          attendee_label: attendee.attendeeLabel,
          meal_option: attendee.mealOption,
          dietary_preference: attendee.dietaryPreference,
        })),
      );
      if (error) throw error;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update RSVP." });
  }
}
