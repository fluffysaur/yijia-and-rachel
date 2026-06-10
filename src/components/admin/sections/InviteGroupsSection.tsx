import { Download, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../../Button";
import { CheckInDropdown } from "./CheckInDropdown";
import type { AdminInviteRow } from "../types";

export function InviteGroupsSection({
    rows,
    filter,
    filteredChurchInvitedCount,
    filteredDinnerInvitedCount,
    onFilterChange,
    onAddInvite,
    onRefresh,
    onExport,
    onToggleCheckIn,
    checkInAttendees,
    getCheckedInNames,
    onEditRsvp,
    onDeleteInvite,
}: {
    rows: AdminInviteRow[];
    filter: string;
    filteredChurchInvitedCount: number;
    filteredDinnerInvitedCount: number;
    onFilterChange: (value: string) => void;
    onAddInvite: () => void;
    onRefresh: () => void;
    onExport: () => void;
    onToggleCheckIn: (row: AdminInviteRow, eventType: "ceremony" | "dinner", name: string) => void;
    checkInAttendees: (row: AdminInviteRow, eventType: "ceremony" | "dinner") => string[];
    getCheckedInNames: (row: AdminInviteRow, eventType: "ceremony" | "dinner") => string[];
    onEditRsvp: (row: AdminInviteRow) => void;
    onDeleteInvite: (row: AdminInviteRow) => void;
}) {
    return (
        <section
            id="invites"
            className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-3xl">Invite Groups & RSVP</h2>
                    <p className="text-sm text-taupe">
                        Create, import, delete, export, edit submitted RSVPs, and mark day-of check-ins.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={onAddInvite}>
                        <Plus size={16} />
                        Add invite
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onRefresh}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button onClick={onExport}>
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>
            </div>
            <input
                className="mt-5 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                value={filter}
                onChange={(event) => onFilterChange(event.target.value)}
                placeholder="Filter invite groups"
            />
            <div className="mt-5 overflow-x-auto overflow-y-visible">
                <table className="w-full min-w-190 text-left text-sm">
                    <thead className="border-b border-taupe/15 text-taupe">
                        <tr>
                            <th className="py-3 pr-4">Group</th>
                            <th className="py-3 pr-4">Church ({filteredChurchInvitedCount})</th>
                            <th className="py-3 pr-4">Dinner ({filteredDinnerInvitedCount})</th>
                            <th className="py-3 pr-4">RSVP</th>
                            <th className="py-3 pr-4">Check in</th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-taupe/10">
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td className="py-3 pr-4 font-medium">{row.groupName}</td>
                                <td className="py-3 pr-4">
                                    <span className="block">
                                        {row.guestNames.join(", ") || row.ceremonyAllowedCount}
                                    </span>
                                    <span className="mt-1 block text-xs text-taupe">
                                        {row.guestNames.length || row.ceremonyAllowedCount} invited
                                    </span>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className="block">
                                        {row.dinnerGuestNames.join(", ") || row.dinnerAllowedCount}
                                    </span>
                                    <span className="mt-1 block text-xs text-taupe">
                                        {row.dinnerGuestNames.length || row.dinnerAllowedCount} invited
                                    </span>
                                </td>
                                <td className="py-3 pr-4">{row.rsvp ? "Submitted" : "Pending"}</td>
                                <td className="py-3 pr-4">
                                    <div className="flex flex-nowrap items-start gap-2">
                                        {(["ceremony", "dinner"] as const).map((eventType) => {
                                            const attendeeNames = checkInAttendees(row, eventType);
                                            const checkedNames = getCheckedInNames(row, eventType);

                                            return (
                                                <CheckInDropdown
                                                    key={eventType}
                                                    label={eventType === "ceremony" ? "Church" : "Dinner"}
                                                    attendeeNames={attendeeNames}
                                                    checkedNames={checkedNames}
                                                    onToggle={(name) => onToggleCheckIn(row, eventType, name)}
                                                />
                                            );
                                        })}
                                        {!row.rsvp ? <span className="text-sm text-taupe">Awaiting RSVP</span> : null}
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex justify-end gap-2">
                                        {row.rsvp ? (
                                            <button
                                                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-taupe/20 text-ink transition hover:border-rose/40 hover:bg-cream"
                                                aria-label={`Edit RSVP for ${row.groupName}`}
                                                title="Edit RSVP"
                                                onClick={() => onEditRsvp(row)}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                        ) : null}
                                        <button
                                            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-rose/30 text-rose transition hover:bg-rose/10"
                                            aria-label={`Delete ${row.groupName}`}
                                            title="Delete invite group"
                                            onClick={() => onDeleteInvite(row)}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
