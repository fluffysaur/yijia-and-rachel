import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
import type { CeremonyAttendee, DinnerAttendee, RsvpResponse } from "../../../types/rsvp";
import { dinnerMealOptions } from "../../../types/rsvp";
import { createNewInviteGuestRow } from "../createNewInviteGuestRow";
import type { AdminRsvpEditState, NewInviteGuestRow } from "../types";

const inputClass = "w-full rounded-md border border-taupe/20 bg-white px-3 py-2";

function createEmptyRsvp(inviteGroupId: string, responderName: string): RsvpResponse {
    const now = new Date().toISOString();

    return {
        id: crypto.randomUUID(),
        inviteGroupId,
        responderName,
        ceremonyAttendingCount: 0,
        dinnerAttendingCount: 0,
        generalNotes: "",
        lockedForGuestEdit: true,
        submittedAt: now,
        updatedAt: now,
        ceremonyAttendees: [],
        dinnerAttendees: [],
    };
}

function nextAttendeeIndex(attendees: { attendeeIndex: number }[]) {
    return Math.max(0, ...attendees.map((attendee) => attendee.attendeeIndex)) + 1;
}

export function EditRsvpModal({
    open,
    editingRow,
    setEditingRow,
    saving,
    onSave,
    onClose,
}: {
    open: boolean;
    editingRow: AdminRsvpEditState | null;
    setEditingRow: Dispatch<SetStateAction<AdminRsvpEditState | null>>;
    saving: boolean;
    onSave: () => void;
    onClose: () => void;
}) {
    const updateGuest = (guestId: string, changes: Partial<NewInviteGuestRow>) => {
        setEditingRow((value) =>
            value
                ? {
                      ...value,
                      guests: value.guests.map((guest) => (guest.id === guestId ? { ...guest, ...changes } : guest)),
                  }
                : value,
        );
    };

    const updateRsvp = (changes: Partial<RsvpResponse>) => {
        setEditingRow((value) =>
            value?.rsvp
                ? {
                      ...value,
                      rsvp: { ...value.rsvp, ...changes },
                  }
                : value,
        );
    };

    const updateCeremonyAttendee = (index: number, changes: Partial<CeremonyAttendee>) => {
        setEditingRow((value) =>
            value?.rsvp
                ? {
                      ...value,
                      rsvp: {
                          ...value.rsvp,
                          ceremonyAttendees: value.rsvp.ceremonyAttendees.map((attendee, attendeeIndex) =>
                              attendeeIndex === index ? { ...attendee, ...changes } : attendee,
                          ),
                      },
                  }
                : value,
        );
    };

    const updateDinnerAttendee = (index: number, changes: Partial<DinnerAttendee>) => {
        setEditingRow((value) =>
            value?.rsvp
                ? {
                      ...value,
                      rsvp: {
                          ...value.rsvp,
                          dinnerAttendees: value.rsvp.dinnerAttendees.map((attendee, attendeeIndex) =>
                              attendeeIndex === index ? { ...attendee, ...changes } : attendee,
                          ),
                      },
                  }
                : value,
        );
    };

    return (
        <FadeModal
            open={open && Boolean(editingRow)}
            title="Edit RSVP"
            onClose={onClose}
            closeDisabled={saving}
        >
            {editingRow ? (
                <>
                    <fieldset
                        className="contents"
                        disabled={saving}
                    >
                    <div className="grid gap-3 md:grid-cols-[1fr_14rem_13rem]">
                        <label className="block">
                            <span className="text-label font-medium text-ink">Group name</span>
                            <input
                                className={`mt-2 ${inputClass}`}
                                value={editingRow.groupName}
                                onChange={(event) =>
                                    setEditingRow((value) =>
                                        value ? { ...value, groupName: event.target.value } : value,
                                    )
                                }
                            />
                        </label>
                        <label className="block">
                            <span className="text-label font-medium text-ink">Invite password</span>
                            <input
                                className={`mt-2 ${inputClass}`}
                                value={editingRow.invitePassword ?? ""}
                                onChange={(event) =>
                                    setEditingRow((value) =>
                                        value ? { ...value, invitePassword: event.target.value } : value,
                                    )
                                }
                            />
                        </label>
                        <label className="block">
                            <span className="text-label font-medium text-ink">RSVP status</span>
                            <span className="relative mt-2 block">
                                <select
                                    className="w-full appearance-none rounded-md border border-taupe/20 bg-white py-2 pl-3 pr-10"
                                    value={editingRow.rsvpStatus}
                                    onChange={(event) =>
                                        setEditingRow((value) => {
                                            if (!value) return value;
                                            const rsvpStatus = event.target.value as AdminRsvpEditState["rsvpStatus"];

                                            return {
                                                ...value,
                                                rsvpStatus,
                                                rsvp:
                                                    rsvpStatus === "submitted"
                                                        ? (value.rsvp ?? createEmptyRsvp(value.id, value.groupName))
                                                        : value.rsvp,
                                            };
                                        })
                                    }
                                >
                                    <option value="submitted">RSVPed</option>
                                    <option value="pending">Awaiting RSVP</option>
                                </select>
                                <ChevronDown
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
                                    size={16}
                                    aria-hidden="true"
                                />
                            </span>
                        </label>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-160 text-left text-small">
                            <thead className="border-b border-taupe/15 text-taupe">
                                <tr>
                                    <th className="py-2 pr-3">Full name</th>
                                    <th className="py-2 pr-3 text-center">Church</th>
                                    <th className="py-2 pr-3 text-center">Dinner</th>
                                    <th className="py-2 pr-3">Remarks</th>
                                    <th className="py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-taupe/10">
                                {editingRow.guests.map((guest) => (
                                    <tr key={guest.id}>
                                        <td className="py-2 pr-3 align-top">
                                            <input
                                                className={inputClass}
                                                value={guest.fullName}
                                                onChange={(event) => updateGuest(guest.id, { fullName: event.target.value })}
                                                placeholder="Guest name"
                                            />
                                        </td>
                                        <td className="py-2 pr-3 text-center align-top">
                                            <input
                                                className="mt-2 h-4 w-4"
                                                type="checkbox"
                                                checked={guest.church}
                                                onChange={(event) => updateGuest(guest.id, { church: event.target.checked })}
                                                aria-label={`Church invite for ${guest.fullName || "guest"}`}
                                            />
                                        </td>
                                        <td className="py-2 pr-3 text-center align-top">
                                            <input
                                                className="mt-2 h-4 w-4"
                                                type="checkbox"
                                                checked={guest.dinner}
                                                onChange={(event) => updateGuest(guest.id, { dinner: event.target.checked })}
                                                aria-label={`Dinner invite for ${guest.fullName || "guest"}`}
                                            />
                                        </td>
                                        <td className="py-2 pr-3 align-top">
                                            <input
                                                className={inputClass}
                                                value={guest.remarks}
                                                onChange={(event) => updateGuest(guest.id, { remarks: event.target.value })}
                                                placeholder="Optional"
                                            />
                                        </td>
                                        <td className="py-2 text-right align-top">
                                            <button
                                                className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-taupe/25 text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                                                type="button"
                                                onClick={() =>
                                                    setEditingRow((value) =>
                                                        value && value.guests.length > 1
                                                            ? {
                                                                  ...value,
                                                                  guests: value.guests.filter((row) => row.id !== guest.id),
                                                              }
                                                            : value,
                                                    )
                                                }
                                                disabled={editingRow.guests.length <= 1}
                                                aria-label="Remove invitee"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-taupe/30 bg-white px-4 py-2 text-control font-medium text-ink transition hover:bg-cream"
                            type="button"
                            onClick={() =>
                                setEditingRow((value) =>
                                    value
                                        ? {
                                              ...value,
                                              guests: [...value.guests, createNewInviteGuestRow()],
                                          }
                                        : value,
                                )
                            }
                        >
                            <Plus size={16} />
                            Add name
                        </button>
                    </div>

                    <label className="mt-4 block">
                        <span className="text-label font-medium text-ink">Internal notes</span>
                        <textarea
                            className="mt-2 min-h-20 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                            value={editingRow.notes ?? ""}
                            onChange={(event) =>
                                setEditingRow((value) => (value ? { ...value, notes: event.target.value } : value))
                            }
                            placeholder="Optional"
                        />
                    </label>

                    {editingRow.rsvpStatus === "submitted" && editingRow.rsvp ? (
                        <div className="mt-6 space-y-5 border-t border-taupe/15 pt-5">
                            <label className="block">
                                <span className="text-label font-medium text-ink">Responder name</span>
                                <input
                                    className={`mt-2 ${inputClass}`}
                                    value={editingRow.rsvp.responderName}
                                    onChange={(event) => updateRsvp({ responderName: event.target.value })}
                                />
                            </label>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-medium">Lunch dietary preferences</h3>
                                    <button
                                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-taupe/30 bg-white px-3 py-2 text-control font-medium text-ink transition hover:bg-cream"
                                        type="button"
                                        onClick={() =>
                                            setEditingRow((value) => {
                                                if (!value?.rsvp) return value;
                                                return {
                                                    ...value,
                                                    rsvp: {
                                                        ...value.rsvp,
                                                        ceremonyAttendees: [
                                                            ...value.rsvp.ceremonyAttendees,
                                                            {
                                                                attendeeIndex: nextAttendeeIndex(
                                                                    value.rsvp.ceremonyAttendees,
                                                                ),
                                                                attendeeLabel: "",
                                                                dietaryPreference: "",
                                                            },
                                                        ],
                                                    },
                                                };
                                            })
                                        }
                                    >
                                        <Plus size={16} />
                                        Add lunch
                                    </button>
                                </div>
                                <div className="mt-3 grid gap-3">
                                    {editingRow.rsvp.ceremonyAttendees.map((attendee, index) => (
                                        <div
                                            key={`${attendee.attendeeIndex}-${index}`}
                                            className="grid gap-3 rounded-md bg-cream p-3 md:grid-cols-[1fr_1fr_auto]"
                                        >
                                            <label className="block">
                                                <span className="text-label font-medium text-ink">Name</span>
                                                <input
                                                    className={`mt-2 ${inputClass}`}
                                                    value={attendee.attendeeLabel}
                                                    onChange={(event) =>
                                                        updateCeremonyAttendee(index, {
                                                            attendeeLabel: event.target.value,
                                                        })
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-label font-medium text-ink">Dietary preference</span>
                                                <input
                                                    className={`mt-2 ${inputClass}`}
                                                    value={attendee.dietaryPreference}
                                                    placeholder="Optional"
                                                    onChange={(event) =>
                                                        updateCeremonyAttendee(index, {
                                                            dietaryPreference: event.target.value,
                                                        })
                                                    }
                                                />
                                            </label>
                                            <div className="flex items-end justify-end">
                                                <button
                                                    className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-taupe/25 bg-white text-ink transition hover:bg-cream"
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingRow((value) =>
                                                            value?.rsvp
                                                                ? {
                                                                      ...value,
                                                                      rsvp: {
                                                                          ...value.rsvp,
                                                                          ceremonyAttendees:
                                                                              value.rsvp.ceremonyAttendees.filter(
                                                                                  (_, rowIndex) => rowIndex !== index,
                                                                              ),
                                                                      },
                                                                  }
                                                                : value,
                                                        )
                                                    }
                                                    aria-label="Remove lunch attendee"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-medium">Dinner meals</h3>
                                    <button
                                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-taupe/30 bg-white px-3 py-2 text-control font-medium text-ink transition hover:bg-cream"
                                        type="button"
                                        onClick={() =>
                                            setEditingRow((value) => {
                                                if (!value?.rsvp) return value;
                                                return {
                                                    ...value,
                                                    rsvp: {
                                                        ...value.rsvp,
                                                        dinnerAttendees: [
                                                            ...value.rsvp.dinnerAttendees,
                                                            {
                                                                attendeeIndex: nextAttendeeIndex(value.rsvp.dinnerAttendees),
                                                                attendeeLabel: "",
                                                                mealOption: dinnerMealOptions[0],
                                                                dietaryPreference: "",
                                                            },
                                                        ],
                                                    },
                                                };
                                            })
                                        }
                                    >
                                        <Plus size={16} />
                                        Add dinner
                                    </button>
                                </div>
                                <div className="mt-3 grid gap-3">
                                    {editingRow.rsvp.dinnerAttendees.map((attendee, index) => (
                                        <div
                                            key={`${attendee.attendeeIndex}-${index}`}
                                            className="grid gap-3 rounded-md bg-cream p-3 md:grid-cols-[1fr_12rem_1fr_auto]"
                                        >
                                            <label className="block">
                                                <span className="text-label font-medium text-ink">Name</span>
                                                <input
                                                    className={`mt-2 ${inputClass}`}
                                                    value={attendee.attendeeLabel}
                                                    onChange={(event) =>
                                                        updateDinnerAttendee(index, {
                                                            attendeeLabel: event.target.value,
                                                        })
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-label font-medium text-ink">Meal option</span>
                                                <span className="relative mt-2 block">
                                                    <select
                                                        className="w-full appearance-none rounded-md border border-taupe/20 bg-white py-2 pl-3 pr-10"
                                                        value={attendee.mealOption}
                                                        onChange={(event) =>
                                                            updateDinnerAttendee(index, {
                                                                mealOption: event.target
                                                                    .value as RsvpResponse["dinnerAttendees"][number]["mealOption"],
                                                            })
                                                        }
                                                    >
                                                        {dinnerMealOptions.map((option) => (
                                                            <option
                                                                key={option}
                                                                value={option}
                                                            >
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
                                                <span className="text-label font-medium text-ink">Dietary preference</span>
                                                <input
                                                    className={`mt-2 ${inputClass}`}
                                                    value={attendee.dietaryPreference}
                                                    placeholder="Optional"
                                                    onChange={(event) =>
                                                        updateDinnerAttendee(index, {
                                                            dietaryPreference: event.target.value,
                                                        })
                                                    }
                                                />
                                            </label>
                                            <div className="flex items-end justify-end">
                                                <button
                                                    className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-taupe/25 bg-white text-ink transition hover:bg-cream"
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingRow((value) =>
                                                            value?.rsvp
                                                                ? {
                                                                      ...value,
                                                                      rsvp: {
                                                                          ...value.rsvp,
                                                                          dinnerAttendees:
                                                                              value.rsvp.dinnerAttendees.filter(
                                                                                  (_, rowIndex) => rowIndex !== index,
                                                                              ),
                                                                      },
                                                                  }
                                                                : value,
                                                        )
                                                    }
                                                    aria-label="Remove dinner attendee"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="text-label font-medium text-ink">Remarks</span>
                                <textarea
                                    className="mt-2 min-h-20 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                    value={editingRow.rsvp.generalNotes}
                                    onChange={(event) => updateRsvp({ generalNotes: event.target.value })}
                                    placeholder="Optional"
                                />
                            </label>
                        </div>
                    ) : null}

                    </fieldset>

                    <div className="mt-5 flex gap-2">
                        <Button
                            onClick={onSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save RSVP"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            ) : null}
        </FadeModal>
    );
}
