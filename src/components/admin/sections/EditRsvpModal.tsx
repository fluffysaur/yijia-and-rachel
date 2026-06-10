import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
import type { RsvpResponse } from "../../../types/rsvp";
import { dinnerMealOptions } from "../../../types/rsvp";

export function EditRsvpModal({
    open,
    editingRsvp,
    setEditingRsvp,
    onSave,
    onClose,
}: {
    open: boolean;
    editingRsvp: RsvpResponse | null;
    setEditingRsvp: Dispatch<SetStateAction<RsvpResponse | null>>;
    onSave: () => void;
    onClose: () => void;
}) {
    return (
        <FadeModal
            open={open && Boolean(editingRsvp)}
            title="Edit RSVP"
            onClose={onClose}
        >
            {editingRsvp ? (
                <>
                    <div className="grid gap-3 md:grid-cols-3">
                        <label className="block">
                            <span className="text-sm font-medium text-ink">Responder name</span>
                            <input
                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                value={editingRsvp.responderName}
                                onChange={(event) =>
                                    setEditingRsvp((value) =>
                                        value ? { ...value, responderName: event.target.value } : value,
                                    )
                                }
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-ink">Church attending</span>
                            <input
                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                value={editingRsvp.ceremonyAttendingCount}
                                min={0}
                                type="number"
                                onChange={(event) =>
                                    setEditingRsvp((value) =>
                                        value
                                            ? {
                                                  ...value,
                                                  ceremonyAttendingCount: Number(event.target.value),
                                              }
                                            : value,
                                    )
                                }
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-ink">Dinner attending</span>
                            <input
                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                value={editingRsvp.dinnerAttendingCount}
                                min={0}
                                type="number"
                                onChange={(event) =>
                                    setEditingRsvp((value) =>
                                        value
                                            ? {
                                                  ...value,
                                                  dinnerAttendingCount: Number(event.target.value),
                                              }
                                            : value,
                                    )
                                }
                            />
                        </label>
                    </div>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div>
                            <h3 className="font-medium">Church dietary preferences</h3>
                            <div className="mt-3 grid gap-2">
                                {editingRsvp.ceremonyAttendees.map((attendee, index) => (
                                    <label
                                        key={attendee.attendeeIndex}
                                        className="block"
                                    >
                                        <span className="text-sm font-medium text-ink">{attendee.attendeeLabel}</span>
                                        <input
                                            className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={attendee.dietaryPreference}
                                            placeholder="Dietary preference"
                                            onChange={(event) =>
                                                setEditingRsvp((value) =>
                                                    value
                                                        ? {
                                                              ...value,
                                                              ceremonyAttendees: value.ceremonyAttendees.map(
                                                                  (row, rowIndex) =>
                                                                      rowIndex === index
                                                                          ? {
                                                                                ...row,
                                                                                dietaryPreference: event.target.value,
                                                                            }
                                                                          : row,
                                                              ),
                                                          }
                                                        : value,
                                                )
                                            }
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium">Dinner meals</h3>
                            <div className="mt-3 grid gap-3">
                                {editingRsvp.dinnerAttendees.map((attendee, index) => (
                                    <div
                                        key={attendee.attendeeIndex}
                                        className="grid gap-2 rounded-md bg-cream p-3"
                                    >
                                        <p className="font-medium text-ink">{attendee.attendeeLabel}</p>
                                        <label className="block">
                                            <span className="text-sm font-medium text-ink">Meal option</span>
                                            <select
                                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                                value={attendee.mealOption}
                                                onChange={(event) =>
                                                    setEditingRsvp((value) =>
                                                        value
                                                            ? {
                                                                  ...value,
                                                                  dinnerAttendees: value.dinnerAttendees.map(
                                                                      (row, rowIndex) =>
                                                                          rowIndex === index
                                                                              ? {
                                                                                    ...row,
                                                                                    mealOption: event.target
                                                                                        .value as RsvpResponse["dinnerAttendees"][number]["mealOption"],
                                                                                }
                                                                              : row,
                                                                  ),
                                                              }
                                                            : value,
                                                    )
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
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-ink">Dietary preference</span>
                                            <input
                                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                                value={attendee.dietaryPreference}
                                                placeholder="Optional"
                                                onChange={(event) =>
                                                    setEditingRsvp((value) =>
                                                        value
                                                            ? {
                                                                  ...value,
                                                                  dinnerAttendees: value.dinnerAttendees.map(
                                                                      (row, rowIndex) =>
                                                                          rowIndex === index
                                                                              ? {
                                                                                    ...row,
                                                                                    dietaryPreference:
                                                                                        event.target.value,
                                                                                }
                                                                              : row,
                                                                  ),
                                                              }
                                                            : value,
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <label className="mt-4 block">
                        <span className="text-sm font-medium text-ink">General notes</span>
                        <textarea
                            className="mt-2 min-h-20 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                            value={editingRsvp.generalNotes}
                            onChange={(event) =>
                                setEditingRsvp((value) =>
                                    value ? { ...value, generalNotes: event.target.value } : value,
                                )
                            }
                            placeholder="Optional"
                        />
                    </label>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={onSave}>Save RSVP</Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            ) : null}
        </FadeModal>
    );
}
