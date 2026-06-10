import type { InviteGroup, RsvpResponse } from "../types/rsvp";

export function RsvpDetail({ inviteGroup, rsvp }: { inviteGroup: InviteGroup; rsvp: RsvpResponse }) {
  return (
    <section className="rounded-lg border border-sage/30 bg-sage/10 p-5">
      <p className="text-sm font-medium uppercase text-sage">Submitted RSVP</p>
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
        <div>
          <h3 className="font-medium">Dinner banquet</h3>
          {inviteGroup.dinnerAllowedCount === 0 ? (
            <p className="text-taupe">Not invited for dinner banquet.</p>
          ) : (
            <>
              <p className="text-taupe">{rsvp.dinnerAttendingCount} attending</p>
              <ul className="mt-3 space-y-2 text-sm text-taupe">
                {rsvp.dinnerAttendees.map((attendee) => (
                  <li key={attendee.attendeeIndex}>
                    {attendee.attendeeLabel}: {attendee.mealOption}
                    {attendee.dietaryPreference ? `, ${attendee.dietaryPreference}` : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {rsvp.generalNotes ? (
        <div className="mt-5 rounded-md bg-ivory p-4 text-sm text-taupe">
          <span className="font-medium text-ink">Notes:</span> {rsvp.generalNotes}
        </div>
      ) : null}
      <p className="mt-5 text-sm text-rose">This RSVP is locked for guest editing. Please contact us for changes.</p>
    </section>
  );
}
