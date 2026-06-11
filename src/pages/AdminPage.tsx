import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import {
    AddInviteModal,
    AdminHeader,
    AdminInviteMessageSettings,
    AdminMealCounts,
    AdminPasswordSettings,
    AdminRsvpDeadlineSettings,
    AdminSummaryCards,
    createNewInviteGuestRow,
    EditRsvpModal,
    exportCsv,
    InviteGroupsSection,
    InviteMessageModal,
    type AdminInviteRow,
} from "../components/admin";
import {
    createAdminInviteGroup,
    deleteAdminInviteGroup,
    deleteAdminRsvp,
    getAdminSummary,
    getInviteMessageTemplates,
    getRsvpSettings,
    listAdminInvites,
    setAdminCheckIn,
    updateAdminInviteStatus,
    updateAdminInviteGroup,
    updateAdminRsvp,
} from "../lib/rsvpRepository";
import { createInvitePassword } from "../lib/invitePassword";
import type { AdminSummary, InviteMessageTemplates } from "../types/rsvp";
import type { AdminRsvpEditState, NewInviteGuestRow } from "../components/admin";

function readStoredCheckIns(inviteGroupId: string, eventType: "ceremony" | "dinner") {
    const stored = localStorage.getItem(`wedding-check-in:${inviteGroupId}:${eventType}`);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

const inviteeRemarksHeading = "Invitee remarks:";

function parseInviteNotes(notes: string | null | undefined) {
    const rawNotes = notes ?? "";
    const [baseNotes, remarksBlock = ""] = rawNotes.split(inviteeRemarksHeading);
    const remarksByName = new Map<string, string>();

    remarksBlock
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
            const separatorIndex = line.indexOf(":");
            if (separatorIndex <= 0) return;

            remarksByName.set(line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim());
        });

    return {
        baseNotes: baseNotes.trim(),
        remarksByName,
    };
}

function composeInviteNotes(notes: string, guests: NewInviteGuestRow[]) {
    const rowRemarks = guests
        .filter((guest) => guest.fullName.trim() && guest.remarks.trim())
        .map((guest) => `${guest.fullName.trim()}: ${guest.remarks.trim()}`)
        .join("\n");

    return [notes.trim(), rowRemarks ? `${inviteeRemarksHeading}\n${rowRemarks}` : ""].filter(Boolean).join("\n\n");
}

function createEditState(row: AdminInviteRow): AdminRsvpEditState {
    const { baseNotes, remarksByName } = parseInviteNotes(row.notes);
    const names = Array.from(new Set([...row.guestNames, ...row.dinnerGuestNames])).filter(Boolean);
    const guests = (names.length ? names : [""]).map((name) => ({
        id: crypto.randomUUID(),
        fullName: name,
        church: row.guestNames.includes(name),
        dinner: row.dinnerGuestNames.includes(name),
        remarks: remarksByName.get(name) ?? "",
    }));

    return {
        ...row,
        notes: baseNotes,
        rsvpStatus: row.rsvp ? "submitted" : "pending",
        guests,
    };
}

export function AdminPage() {
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [rows, setRows] = useState<AdminInviteRow[]>([]);
    const [filter, setFilter] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [newInvite, setNewInvite] = useState({
        groupName: "",
        invitePassword: createInvitePassword(),
        guests: [createNewInviteGuestRow()],
        notes: "",
    });
    const [editingRow, setEditingRow] = useState<AdminRsvpEditState | null>(null);
    const [inviteMessageRow, setInviteMessageRow] = useState<AdminInviteRow | null>(null);
    const [inviteMessageTemplates, setInviteMessageTemplates] = useState<InviteMessageTemplates | null>(null);
    const [inviteMessageDeadline, setInviteMessageDeadline] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [inviteMessageModalOpen, setInviteMessageModalOpen] = useState(false);
    const [checkIns, setCheckIns] = useState<Record<string, string[]>>({});

    const filteredRows = useMemo(() => {
        const search = filter.trim().toLowerCase();
        if (!search) return rows;

        return rows.filter((row) => {
            const searchable = [row.groupName, row.invitePassword ?? "", ...row.guestNames, ...row.dinnerGuestNames]
                .join(" ")
                .toLowerCase();
            return searchable.includes(search);
        });
    }, [filter, rows]);

    const filteredChurchInvitedCount = useMemo(
        () => filteredRows.reduce((sum, row) => sum + (row.guestNames.length || row.ceremonyAllowedCount), 0),
        [filteredRows],
    );

    const filteredDinnerInvitedCount = useMemo(
        () => filteredRows.reduce((sum, row) => sum + (row.dinnerGuestNames.length || row.dinnerAllowedCount), 0),
        [filteredRows],
    );

    const loadAdminData = async () => {
        setSummary(await getAdminSummary());
        setRows(await listAdminInvites());
    };

    const createInvite = async () => {
        if (!newInvite.groupName.trim()) {
            setMessage("Invite group name is required.");
            return;
        }

        const guestRows = newInvite.guests
            .map((guest) => ({ ...guest, fullName: guest.fullName.trim(), remarks: guest.remarks.trim() }))
            .filter((guest) => guest.fullName);

        if (!guestRows.length) {
            setMessage("Please add at least one invitee name.");
            return;
        }

        const guestNames = guestRows.filter((guest) => guest.church).map((guest) => guest.fullName);
        const dinnerGuestNames = guestRows.filter((guest) => guest.dinner).map((guest) => guest.fullName);
        const rowRemarks = guestRows
            .filter((guest) => guest.remarks)
            .map((guest) => `${guest.fullName}: ${guest.remarks}`)
            .join("\n");
        const notes = [newInvite.notes.trim(), rowRemarks ? `Invitee remarks:\n${rowRemarks}` : ""]
            .filter(Boolean)
            .join("\n\n");

        await createAdminInviteGroup({
            groupName: newInvite.groupName,
            invitePassword: newInvite.invitePassword,
            guestNames,
            dinnerGuestNames,
            ceremonyAllowedCount: guestNames.length,
            dinnerAllowedCount: dinnerGuestNames.length,
            notes,
        });

        setNewInvite({
            groupName: "",
            invitePassword: createInvitePassword(),
            guests: [createNewInviteGuestRow()],
            notes: "",
        });
        setCreateModalOpen(false);
        await loadAdminData();
    };

    const importCsv = async (file: File) => {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const [headerLine, ...dataLines] = lines;
        const headers = headerLine.split(",").map((header) => header.trim());

        for (const line of dataLines) {
            const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
            const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
            await createAdminInviteGroup({
                groupName: row.group_name || row.groupName || row.name || "",
                invitePassword: row.invite_password || row.invitePassword || "",
                guestNames: String(row.guest_names || row.guestNames || "")
                    .split(/;|\|/)
                    .map((name) => name.trim())
                    .filter(Boolean),
                dinnerGuestNames: String(row.dinner_guest_names || row.dinnerGuestNames || "")
                    .split(/;|\|/)
                    .map((name) => name.trim())
                    .filter(Boolean),
                ceremonyAllowedCount: Number(
                    row.ceremony_allowed_count || row.ceremonyAllowedCount || row.ceremony_allowed || 1,
                ),
                dinnerAllowedCount: Number(
                    row.dinner_allowed_count || row.dinnerAllowedCount || row.dinner_allowed || 0,
                ),
                notes: row.notes || "",
            });
        }

        await loadAdminData();
    };

    const saveRsvpEdit = async () => {
        if (!editingRow) return;

        if (!editingRow.groupName.trim()) {
            setMessage("Invite group name is required.");
            return;
        }
        if (!String(editingRow.invitePassword ?? "").trim()) {
            setMessage("Invite password is required.");
            return;
        }

        const guestRows = editingRow.guests
            .map((guest) => ({
                ...guest,
                fullName: guest.fullName.trim(),
                remarks: guest.remarks.trim(),
            }))
            .filter((guest) => guest.fullName);

        if (!guestRows.length) {
            setMessage("Please keep at least one invitee name.");
            return;
        }

        await updateAdminInviteGroup({
            id: editingRow.id,
            groupName: editingRow.groupName.trim(),
            invitePassword: String(editingRow.invitePassword ?? "").trim(),
            guestNames: guestRows.filter((guest) => guest.church).map((guest) => guest.fullName),
            dinnerGuestNames: guestRows.filter((guest) => guest.dinner).map((guest) => guest.fullName),
            notes: composeInviteNotes(editingRow.notes ?? "", guestRows),
        });

        if (editingRow.rsvpStatus === "pending") {
            if (editingRow.rsvp) {
                await deleteAdminRsvp(editingRow.rsvp.id);
            }
        } else if (editingRow.rsvp) {
            const ceremonyAttendees = editingRow.rsvp.ceremonyAttendees
                .map((attendee) => ({
                    ...attendee,
                    attendeeLabel: attendee.attendeeLabel.trim(),
                    dietaryPreference: attendee.dietaryPreference.trim(),
                }))
                .filter((attendee) => attendee.attendeeLabel);
            const dinnerAttendees = editingRow.rsvp.dinnerAttendees
                .map((attendee) => ({
                    ...attendee,
                    attendeeLabel: attendee.attendeeLabel.trim(),
                    dietaryPreference: attendee.dietaryPreference.trim(),
                }))
                .filter((attendee) => attendee.attendeeLabel);

            await updateAdminRsvp({
                ...editingRow.rsvp,
                responderName: editingRow.rsvp.responderName.trim() || editingRow.groupName.trim(),
                ceremonyAttendingCount: ceremonyAttendees.length,
                dinnerAttendingCount: dinnerAttendees.length,
                generalNotes: editingRow.rsvp.generalNotes.trim(),
                ceremonyAttendees,
                dinnerAttendees,
            });
        }

        setMessage(null);
        setEditModalOpen(false);
        setEditingRow(null);
        await loadAdminData();
    };

    const getCheckedInNames = (row: AdminInviteRow, eventType: "ceremony" | "dinner") => {
        const key = `${row.id}:${eventType}`;
        return checkIns[key] ?? readStoredCheckIns(row.id, eventType);
    };

    const toggleCheckIn = async (row: AdminInviteRow, eventType: "ceremony" | "dinner", name: string) => {
        const key = `${row.id}:${eventType}`;
        const current = getCheckedInNames(row, eventType);
        const next = current.includes(name)
            ? current.filter((checkedName) => checkedName !== name)
            : [...current, name];
        setCheckIns((value) => ({ ...value, [key]: next }));
        await setAdminCheckIn(row.id, eventType, next);
    };

    const checkInAttendees = (row: AdminInviteRow, eventType: "ceremony" | "dinner") =>
        eventType === "ceremony"
            ? (row.rsvp?.ceremonyAttendees.map((attendee) => attendee.attendeeLabel) ?? [])
            : (row.rsvp?.dinnerAttendees.map((attendee) => attendee.attendeeLabel) ?? []);

    const openInviteMessage = async (row: AdminInviteRow) => {
        setMessage(null);
        setInviteMessageRow(row);
        setInviteMessageTemplates(null);
        setInviteMessageDeadline(null);
        setInviteMessageModalOpen(true);
        try {
            const [templates, settings] = await Promise.all([getInviteMessageTemplates(), getRsvpSettings()]);
            setInviteMessageTemplates(templates);
            setInviteMessageDeadline(settings.rsvpDeadline);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to load invite message.");
        }
    };

    const updateInviteStatus = async (row: AdminInviteRow, invitedAt: string | null) => {
        const updated = await updateAdminInviteStatus(row.id, invitedAt);
        setRows((value) =>
            value.map((item) => (item.id === row.id ? { ...item, invitedAt: updated.invitedAt ?? null } : item)),
        );
        setInviteMessageRow((value) =>
            value?.id === row.id ? { ...value, invitedAt: updated.invitedAt ?? null } : value,
        );
    };

    useEffect(() => {
        void getAdminSummary()
            .then(setSummary)
            .catch((error) => {
                setMessage(error instanceof Error ? error.message : "Unable to load admin summary.");
            });
        void listAdminInvites()
            .then(setRows)
            .catch((error) => {
                setMessage(error instanceof Error ? error.message : "Unable to load invite groups.");
            });
    }, []);

    return (
        <Layout>
            <main className="bg-cream/50 pb-14 pt-28">
                <div className="section-shell">
                    <AdminHeader />

                    <div className="space-y-8">
                        {message ? (
                            <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{message}</p>
                        ) : null}

                        {summary ? <AdminSummaryCards summary={summary} /> : null}
                        {summary ? <AdminMealCounts summary={summary} /> : null}
                        <AdminRsvpDeadlineSettings />
                        <AdminPasswordSettings />
                        <AdminInviteMessageSettings />

                        <AddInviteModal
                            open={createModalOpen}
                            newInvite={newInvite}
                            setNewInvite={setNewInvite}
                            onClose={() => setCreateModalOpen(false)}
                            onCreateInvite={() => void createInvite()}
                            onImportCsv={(file) => void importCsv(file)}
                        />

                        <EditRsvpModal
                            open={editModalOpen}
                            editingRow={editingRow}
                            setEditingRow={setEditingRow}
                            onSave={() => void saveRsvpEdit()}
                            onClose={() => {
                                setEditModalOpen(false);
                                setEditingRow(null);
                            }}
                        />

                        <InviteMessageModal
                            open={inviteMessageModalOpen}
                            row={inviteMessageRow}
                            templates={inviteMessageTemplates}
                            rsvpDeadline={inviteMessageDeadline}
                            onMarkInvited={(row) => updateInviteStatus(row, new Date().toISOString())}
                            onClearInvited={(row) => updateInviteStatus(row, null)}
                            onClose={() => {
                                setInviteMessageModalOpen(false);
                                setInviteMessageRow(null);
                            }}
                        />

                        <InviteGroupsSection
                            rows={filteredRows}
                            filter={filter}
                            filteredChurchInvitedCount={filteredChurchInvitedCount}
                            filteredDinnerInvitedCount={filteredDinnerInvitedCount}
                            onFilterChange={setFilter}
                            onAddInvite={() => setCreateModalOpen(true)}
                            onImportCsv={(file) => void importCsv(file)}
                            onRefresh={() => void loadAdminData()}
                            onExport={() => exportCsv(filteredRows)}
                            onToggleCheckIn={(row, eventType, name) => void toggleCheckIn(row, eventType, name)}
                            checkInAttendees={checkInAttendees}
                            getCheckedInNames={getCheckedInNames}
                            onInviteMessage={(row) => void openInviteMessage(row)}
                            onEditRsvp={(row) => {
                                setEditingRow(createEditState(row));
                                setEditModalOpen(true);
                            }}
                            onDeleteInvite={(row) => {
                                void deleteAdminInviteGroup(row.id).then(loadAdminData);
                            }}
                        />
                    </div>
                </div>
            </main>
        </Layout>
    );
}
