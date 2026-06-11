import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./Button";
import type { CeremonyAttendee, DinnerAttendee, InviteGroup, RsvpDraft, RsvpResponse } from "../types/rsvp";
import { dinnerMealOptions } from "../types/rsvp";
import { validateRsvpDraft } from "../lib/rsvpValidation";

const namedCeremonyAttendee = (name: string, index: number, dietaryPreference = ""): CeremonyAttendee => ({
  attendeeIndex: index + 1,
  attendeeLabel: name,
  dietaryPreference
});

const namedDinnerAttendee = (
  name: string,
  index: number,
  mealOption: DinnerAttendee["mealOption"] = "Option 1",
  dietaryPreference = ""
): DinnerAttendee => ({
  attendeeIndex: index + 1,
  attendeeLabel: name,
  mealOption,
  dietaryPreference
});

export function RsvpForm({
  inviteGroup,
  initialRsvp = null,
  onSubmit,
  submitting,
  submitLabel = "Submit RSVP"
}: {
  inviteGroup: InviteGroup;
  initialRsvp?: RsvpResponse | null;
  onSubmit: (draft: RsvpDraft) => Promise<void>;
  submitting: boolean;
  submitLabel?: string;
}) {
  const ceremonyNames =
    inviteGroup.guestNames.length > 0
      ? inviteGroup.guestNames
      : Array.from({ length: inviteGroup.ceremonyAllowedCount }, (_, index) => `Guest ${index + 1}`);
  const dinnerNames =
    inviteGroup.dinnerGuestNames.length > 0
      ? inviteGroup.dinnerGuestNames
      : ceremonyNames.slice(0, inviteGroup.dinnerAllowedCount);

  const initialDraft = useMemo<RsvpDraft>(
    () => ({
      inviteGroupId: inviteGroup.id,
      responderName: initialRsvp?.responderName ?? "",
      ceremonyAttendingCount: initialRsvp?.ceremonyAttendingCount ?? 0,
      dinnerAttendingCount: initialRsvp?.dinnerAttendingCount ?? 0,
      generalNotes: initialRsvp?.generalNotes ?? "",
      ceremonyAttendees: initialRsvp?.ceremonyAttendees ?? [],
      dinnerAttendees: initialRsvp?.dinnerAttendees ?? []
    }),
    [initialRsvp, inviteGroup.id]
  );

  const [draft, setDraft] = useState<RsvpDraft>(initialDraft);

  const validation = useMemo(() => validateRsvpDraft(inviteGroup, draft), [draft, inviteGroup]);

  const toggleCeremonyName = (name: string, attending: boolean) => {
    setDraft((current) => ({
      ...current,
      ceremonyAttendees: attending
        ? [...current.ceremonyAttendees, namedCeremonyAttendee(name, current.ceremonyAttendees.length)]
        : current.ceremonyAttendees
            .filter((attendee) => attendee.attendeeLabel !== name)
            .map((attendee, index) => ({ ...attendee, attendeeIndex: index + 1 })),
      ceremonyAttendingCount: attending
        ? current.ceremonyAttendees.length + 1
        : current.ceremonyAttendees.filter((attendee) => attendee.attendeeLabel !== name).length
    }));
  };

  const toggleDinnerName = (name: string, attending: boolean) => {
    setDraft((current) => ({
      ...current,
      dinnerAttendees: attending
        ? [...current.dinnerAttendees, namedDinnerAttendee(name, current.dinnerAttendees.length)]
        : current.dinnerAttendees
            .filter((attendee) => attendee.attendeeLabel !== name)
            .map((attendee, index) => ({ ...attendee, attendeeIndex: index + 1 })),
      dinnerAttendingCount: attending
        ? current.dinnerAttendees.length + 1
        : current.dinnerAttendees.filter((attendee) => attendee.attendeeLabel !== name).length
    }));
  };

  return (
    <form
      className="space-y-6 rounded-lg border border-taupe/15 bg-ivory p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (validation.valid) {
          void onSubmit(draft);
        }
      }}
    >
      <div>
        <p className="text-sm uppercase text-rose">{initialRsvp ? "Edit RSVP for" : "RSVP for"}</p>
        <h2 className="font-display text-3xl">{inviteGroup.groupName}</h2>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Responder name</span>
        <input
          className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
          value={draft.responderName}
          onChange={(event) => setDraft((current) => ({ ...current, responderName: event.target.value }))}
          placeholder="Your name"
        />
      </label>

      <section className="rounded-lg bg-cream/60 p-4">
        <h3 className="font-display text-2xl">Church ceremony & lunch buffet</h3>
        <p className="mt-1 text-sm text-taupe">All invited attendees are invited to this portion.</p>
        <div className="mt-4 grid gap-3">
          {ceremonyNames.map((name) => {
            const attendeeIndex = draft.ceremonyAttendees.findIndex((attendee) => attendee.attendeeLabel === name);
            const attendee = draft.ceremonyAttendees[attendeeIndex];

            return (
              <div key={name} className="rounded-md bg-white p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    className="size-4 accent-rose"
                    type="checkbox"
                    checked={Boolean(attendee)}
                    onChange={(event) => toggleCeremonyName(name, event.target.checked)}
                  />
                  <span className="font-medium">{name}</span>
                </label>
                {attendee ? (
                  <input
                    className="mt-3 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                    value={attendee.dietaryPreference}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        ceremonyAttendees: current.ceremonyAttendees.map((row, rowIndex) =>
                          rowIndex === attendeeIndex ? { ...row, dietaryPreference: event.target.value } : row
                        )
                      }))
                    }
                    placeholder="Dietary preference for lunch buffet"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {inviteGroup.dinnerAllowedCount > 0 ? (
        <section className="rounded-lg bg-blush/20 p-4">
          <h3 className="font-display text-2xl">Dinner banquet</h3>
          <p className="mt-1 text-sm text-taupe">Dinner invitations are separate from the church ceremony.</p>
          <div className="mt-4 grid gap-4">
            {dinnerNames.map((name) => {
              const attendeeIndex = draft.dinnerAttendees.findIndex((attendee) => attendee.attendeeLabel === name);
              const attendee = draft.dinnerAttendees[attendeeIndex];

              return (
                <div key={name} className="rounded-md bg-white p-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      className="size-4 accent-rose"
                      type="checkbox"
                      checked={Boolean(attendee)}
                      onChange={(event) => toggleDinnerName(name, event.target.checked)}
                    />
                    <span className="font-medium">{name}</span>
                  </label>
                  {attendee ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium">Meal</span>
                        <span className="relative mt-2 block">
                          <select
                            className="w-full appearance-none rounded-md border border-taupe/20 bg-white py-2 pl-3 pr-10"
                            value={attendee.mealOption}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                dinnerAttendees: current.dinnerAttendees.map((row, rowIndex) =>
                                  rowIndex === attendeeIndex
                                    ? { ...row, mealOption: event.target.value as DinnerAttendee["mealOption"] }
                                    : row
                                )
                              }))
                            }
                          >
                            {dinnerMealOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
                            size={16}
                            aria-hidden="true"
                          />
                        </span>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium">Other dietary preference</span>
                        <input
                          className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                          value={attendee.dietaryPreference}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              dinnerAttendees: current.dinnerAttendees.map((row, rowIndex) =>
                                rowIndex === attendeeIndex ? { ...row, dietaryPreference: event.target.value } : row
                              )
                            }))
                          }
                          placeholder="Allergies or other notes"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-lg bg-cream/60 p-4 text-sm text-taupe">
          This invite is for the church ceremony and lunch buffet only.
        </section>
      )}

      <label className="block">
        <span className="text-sm font-medium">Remarks</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
          value={draft.generalNotes}
          onChange={(event) => setDraft((current) => ({ ...current, generalNotes: event.target.value }))}
          placeholder="Anything else we should know?"
        />
      </label>

      {validation.errors.length ? (
        <div className="rounded-md border border-rose/30 bg-rose/10 p-3 text-sm text-rose">
          {validation.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <Button type="submit" disabled={!validation.valid || submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
