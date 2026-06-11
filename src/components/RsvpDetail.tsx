import type { InviteGroup, RsvpResponse } from "../types/rsvp";
import { Button } from "./Button";

export function RsvpDetail({
  inviteGroup,
  rsvp,
  canEdit = false,
  lockedMessage = "This RSVP is locked for guest editing. Please contact us for changes.",
  onEdit
}: {
  inviteGroup: InviteGroup;
  rsvp: RsvpResponse;
  canEdit?: boolean;
  lockedMessage?: string;
  onEdit?: () => void;
}) {
  return (
    <section className="rounded-lg border border-sage/30 bg-sage/10 p-5">
      <p className="text-sm font-medium uppercase text-sage">RSVPed</p>
      <h2 className="mt-1 font-display text-3xl">{inviteGroup.groupName}</h2>
      <p className="mt-2 text-sm text-taupe">
        Submitted by {rsvp.responderName} on {new Date(rsvp.submittedAt).toLocaleDateString()}.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="font-medium">Church ceremony & lunch</h3>
          <p className="text-taupe">{rsvp.ceremonyAttendingCount} attending</p>
          <ul className="mt-3 space-y-2 text-sm text-taupe">
            {rsvp.ceremonyAttendees.map((attendee) => (
              <li key={attendee.attendeeIndex}>
                {attendee.attendeeLabel}: {attendee.dietaryPreference || "No dietary preference"}
              </li>
            ))}
          </ul>
        </div>
        {inviteGroup.dinnerAllowedCount > 0 ? (
          <div>
            <h3 className="font-medium">Dinner banquet</h3>
            <p className="text-taupe">{rsvp.dinnerAttendingCount} attending</p>
            <ul className="mt-3 space-y-2 text-sm text-taupe">
              {rsvp.dinnerAttendees.map((attendee) => (
                <li key={attendee.attendeeIndex}>
                  {attendee.attendeeLabel}: {attendee.mealOption}
                  {attendee.dietaryPreference ? `, ${attendee.dietaryPreference}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {rsvp.generalNotes ? (
        <div className="mt-5 rounded-md bg-ivory p-4 text-sm text-taupe">
          <span className="font-medium text-ink">Notes:</span> {rsvp.generalNotes}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {canEdit ? (
          <Button
            type="button"
            onClick={onEdit}
          >
            Edit RSVP
          </Button>
        ) : null}
        <p className={`text-sm ${canEdit ? "text-taupe" : "text-rose"}`}>{lockedMessage}</p>
      </div>
    </section>
  );
}
