import type { Dispatch, SetStateAction } from "react";
import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
import { createNewInviteGuestRow } from "../createNewInviteGuestRow";
import type { NewInviteFormState } from "../types";

export function AddInviteModal({
    open,
    newInvite,
    setNewInvite,
    onClose,
    onCreateInvite,
    onImportCsv,
}: {
    open: boolean;
    newInvite: NewInviteFormState;
    setNewInvite: Dispatch<SetStateAction<NewInviteFormState>>;
    onClose: () => void;
    onCreateInvite: () => void;
    onImportCsv: (file: File) => void;
}) {
    return (
        <FadeModal
            open={open}
            title="Add Invite"
            onClose={onClose}
        >
            <div className="grid gap-3 md:grid-cols-1">
                <label className="block">
                    <span className="text-sm font-medium text-ink">Group name</span>
                    <input
                        className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                        value={newInvite.groupName}
                        onChange={(event) => setNewInvite((value) => ({ ...value, groupName: event.target.value }))}
                        placeholder="Tan Family"
                    />
                </label>
            </div>
            <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
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
                        {newInvite.guests.map((guest) => (
                            <tr key={guest.id}>
                                <td className="py-2 pr-3 align-top">
                                    <input
                                        className="w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                        value={guest.fullName}
                                        onChange={(event) =>
                                            setNewInvite((value) => ({
                                                ...value,
                                                guests: value.guests.map((row) =>
                                                    row.id === guest.id
                                                        ? {
                                                              ...row,
                                                              fullName: event.target.value,
                                                          }
                                                        : row,
                                                ),
                                            }))
                                        }
                                        placeholder="Guest name"
                                    />
                                </td>
                                <td className="py-2 pr-3 text-center align-top">
                                    <input
                                        className="mt-2 h-4 w-4"
                                        type="checkbox"
                                        checked={guest.church}
                                        onChange={(event) =>
                                            setNewInvite((value) => ({
                                                ...value,
                                                guests: value.guests.map((row) =>
                                                    row.id === guest.id
                                                        ? { ...row, church: event.target.checked }
                                                        : row,
                                                ),
                                            }))
                                        }
                                        aria-label={`Church invite for ${guest.fullName || "guest"}`}
                                    />
                                </td>
                                <td className="py-2 pr-3 text-center align-top">
                                    <input
                                        className="mt-2 h-4 w-4"
                                        type="checkbox"
                                        checked={guest.dinner}
                                        onChange={(event) =>
                                            setNewInvite((value) => ({
                                                ...value,
                                                guests: value.guests.map((row) =>
                                                    row.id === guest.id
                                                        ? { ...row, dinner: event.target.checked }
                                                        : row,
                                                ),
                                            }))
                                        }
                                        aria-label={`Dinner invite for ${guest.fullName || "guest"}`}
                                    />
                                </td>
                                <td className="py-2 pr-3 align-top">
                                    <input
                                        className="w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                        value={guest.remarks}
                                        onChange={(event) =>
                                            setNewInvite((value) => ({
                                                ...value,
                                                guests: value.guests.map((row) =>
                                                    row.id === guest.id
                                                        ? {
                                                              ...row,
                                                              remarks: event.target.value,
                                                          }
                                                        : row,
                                                ),
                                            }))
                                        }
                                        placeholder="Optional"
                                    />
                                </td>
                                <td className="py-2 text-right align-top">
                                    <button
                                        className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-taupe/25 px-3 text-sm font-semibold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                                        type="button"
                                        onClick={() =>
                                            setNewInvite((value) => ({
                                                ...value,
                                                guests:
                                                    value.guests.length > 1
                                                        ? value.guests.filter((row) => row.id !== guest.id)
                                                        : value.guests,
                                            }))
                                        }
                                        disabled={newInvite.guests.length <= 1}
                                        aria-label="Remove row"
                                    >
                                        -
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-taupe/30 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-cream"
                    type="button"
                    onClick={() =>
                        setNewInvite((value) => ({
                            ...value,
                            guests: [...value.guests, createNewInviteGuestRow()],
                        }))
                    }
                >
                    + Add row
                </button>
            </div>
            <label className="mt-3 block">
                <span className="text-sm font-medium text-ink">Internal notes</span>
                <textarea
                    className="mt-2 min-h-20 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                    value={newInvite.notes}
                    onChange={(event) => setNewInvite((value) => ({ ...value, notes: event.target.value }))}
                    placeholder="Optional"
                />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={onCreateInvite}>Create invite</Button>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-taupe/30 bg-ivory/80 px-5 py-2 text-sm font-medium text-ink transition hover:bg-cream">
                    Import CSV
                    <input
                        className="sr-only"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) onImportCsv(file);
                        }}
                    />
                </label>
            </div>
        </FadeModal>
    );
}
