import { useCallback, useEffect, useRef, useState } from "react";
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
    DeleteInviteModal,
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

const LOCAL_ADMIN_LOAD_DELAY_MS = 1200;
const MODAL_CLOSE_ANIMATION_MS = 300;

function wait(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function maybeDelayAdminLoad() {
    if (!import.meta.env.DEV) return;

    await wait(LOCAL_ADMIN_LOAD_DELAY_MS);
}

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
    const [adminDataLoading, setAdminDataLoading] = useState(true);
    const [adminDataRefreshing, setAdminDataRefreshing] = useState(false);
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
    const [deleteInviteRow, setDeleteInviteRow] = useState<AdminInviteRow | null>(null);
    const [creatingInvite, setCreatingInvite] = useState(false);
    const [savingRsvpEdit, setSavingRsvpEdit] = useState(false);
    const [deletingInvite, setDeletingInvite] = useState(false);
    const [checkIns, setCheckIns] = useState<Record<string, string[]>>({});
    const editModalCloseTimeoutRef = useRef<number | null>(null);
    const inviteMessageModalCloseTimeoutRef = useRef<number | null>(null);

    const fetchAdminData = useCallback(async () => {
        const [nextSummary, nextRows] = await Promise.all([
            getAdminSummary(),
            listAdminInvites(),
            maybeDelayAdminLoad(),
        ]);

        return { nextSummary, nextRows };
    }, []);

    const loadAdminData = useCallback(async () => {
        setAdminDataRefreshing(true);
        setMessage(null);

        try {
            const { nextSummary, nextRows } = await fetchAdminData();
            setSummary(nextSummary);
            setRows(nextRows);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to load admin dashboard.");
        } finally {
            setAdminDataRefreshing(false);
        }
    }, [fetchAdminData]);

    const createInvite = async () => {
        if (creatingInvite) return;

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

        setCreatingInvite(true);
        setMessage(null);
        try {
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
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to create invite.");
        } finally {
            setCreatingInvite(false);
        }
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
        if (savingRsvpEdit) return;
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

        setSavingRsvpEdit(true);
        setMessage(null);
        try {
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

            closeEditModal();
            await loadAdminData();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save RSVP.");
        } finally {
            setSavingRsvpEdit(false);
        }
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

    const checkInSummary = rows.reduce(
        (counts, row) => ({
            churchCheckedIn: counts.churchCheckedIn + getCheckedInNames(row, "ceremony").length,
            dinnerCheckedIn: counts.dinnerCheckedIn + getCheckedInNames(row, "dinner").length,
        }),
        { churchCheckedIn: 0, dinnerCheckedIn: 0 },
    );

    const openInviteMessage = async (row: AdminInviteRow) => {
        if (inviteMessageModalCloseTimeoutRef.current) {
            window.clearTimeout(inviteMessageModalCloseTimeoutRef.current);
            inviteMessageModalCloseTimeoutRef.current = null;
        }

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

    function closeEditModal() {
        setEditModalOpen(false);
        if (editModalCloseTimeoutRef.current) {
            window.clearTimeout(editModalCloseTimeoutRef.current);
        }
        editModalCloseTimeoutRef.current = window.setTimeout(() => {
            setEditingRow(null);
            editModalCloseTimeoutRef.current = null;
        }, MODAL_CLOSE_ANIMATION_MS);
    }

    function closeInviteMessageModal() {
        setInviteMessageModalOpen(false);
        if (inviteMessageModalCloseTimeoutRef.current) {
            window.clearTimeout(inviteMessageModalCloseTimeoutRef.current);
        }
        inviteMessageModalCloseTimeoutRef.current = window.setTimeout(() => {
            setInviteMessageRow(null);
            setInviteMessageTemplates(null);
            setInviteMessageDeadline(null);
            inviteMessageModalCloseTimeoutRef.current = null;
        }, MODAL_CLOSE_ANIMATION_MS);
    }

    const updateInviteStatus = async (row: AdminInviteRow, invitedAt: string | null) => {
        const updated = await updateAdminInviteStatus(row.id, invitedAt);
        setRows((value) =>
            value.map((item) => (item.id === row.id ? { ...item, invitedAt: updated.invitedAt ?? null } : item)),
        );
        setInviteMessageRow((value) =>
            value?.id === row.id ? { ...value, invitedAt: updated.invitedAt ?? null } : value,
        );
    };

    const confirmDeleteInvite = async () => {
        if (!deleteInviteRow || deletingInvite) return;

        setDeletingInvite(true);
        setMessage(null);
        try {
            await deleteAdminInviteGroup(deleteInviteRow.id);
            await loadAdminData();
            setDeleteInviteRow(null);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to delete invite group.");
        } finally {
            setDeletingInvite(false);
        }
    };

    useEffect(() => {
        let active = true;

        void fetchAdminData()
            .then(({ nextSummary, nextRows }) => {
                if (!active) return;

                setSummary(nextSummary);
                setRows(nextRows);
            })
            .catch((error) => {
                if (!active) return;

                setMessage(error instanceof Error ? error.message : "Unable to load admin dashboard.");
            })
            .finally(() => {
                if (!active) return;

                setAdminDataLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetchAdminData]);

    useEffect(
        () => () => {
            if (editModalCloseTimeoutRef.current) {
                window.clearTimeout(editModalCloseTimeoutRef.current);
            }
            if (inviteMessageModalCloseTimeoutRef.current) {
                window.clearTimeout(inviteMessageModalCloseTimeoutRef.current);
            }
        },
        [],
    );

    return (
        <Layout>
            <main className="bg-cream/50 pb-14 pt-28">
                <div className="section-shell">
                    <AdminHeader />

                    <div>
                        {message ? (
                            <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{message}</p>
                        ) : null}

                        <AddInviteModal
                            open={createModalOpen}
                            newInvite={newInvite}
                            setNewInvite={setNewInvite}
                            submitting={creatingInvite}
                            onClose={() => {
                                if (creatingInvite) return;
                                setCreateModalOpen(false);
                            }}
                            onCreateInvite={() => void createInvite()}
                            onImportCsv={(file) => void importCsv(file)}
                        />

                        <EditRsvpModal
                            open={editModalOpen}
                            editingRow={editingRow}
                            setEditingRow={setEditingRow}
                            saving={savingRsvpEdit}
                            onSave={() => void saveRsvpEdit()}
                            onClose={() => {
                                if (savingRsvpEdit) return;
                                closeEditModal();
                            }}
                        />

                        <InviteMessageModal
                            open={inviteMessageModalOpen}
                            row={inviteMessageRow}
                            templates={inviteMessageTemplates}
                            rsvpDeadline={inviteMessageDeadline}
                            onMarkInvited={(row) => updateInviteStatus(row, new Date().toISOString())}
                            onClearInvited={(row) => updateInviteStatus(row, null)}
                            onClose={closeInviteMessageModal}
                        />

                        <DeleteInviteModal
                            row={deleteInviteRow}
                            deleting={deletingInvite}
                            onCancel={() => {
                                if (deletingInvite) return;
                                setDeleteInviteRow(null);
                            }}
                            onDelete={() => void confirmDeleteInvite()}
                        />

                        <div className="mt-8 space-y-8">
                            {summary && !adminDataRefreshing ? (
                                <AdminSummaryCards
                                    summary={summary}
                                    churchCheckedIn={checkInSummary.churchCheckedIn}
                                    dinnerCheckedIn={checkInSummary.dinnerCheckedIn}
                                />
                            ) : (
                                <AdminSummaryCardsSkeleton />
                            )}
                            {summary && !adminDataRefreshing ? (
                                <AdminMealCounts summary={summary} />
                            ) : (
                                <AdminMealCountsSkeleton />
                            )}
                            <AdminRsvpDeadlineSettings />
                            <AdminPasswordSettings />
                            <AdminInviteMessageSettings />

                            <InviteGroupsSection
                                rows={rows}
                                filter={filter}
                                onFilterChange={setFilter}
                                onAddInvite={() => setCreateModalOpen(true)}
                                onImportCsv={(file) => void importCsv(file)}
                                onRefresh={() => void loadAdminData()}
                                loading={adminDataLoading || adminDataRefreshing}
                                refreshing={adminDataRefreshing}
                                onExport={exportCsv}
                                onToggleCheckIn={(row, eventType, name) => void toggleCheckIn(row, eventType, name)}
                                getCheckedInNames={getCheckedInNames}
                                onInviteMessage={(row) => void openInviteMessage(row)}
                                onEditRsvp={(row) => {
                                    if (editModalCloseTimeoutRef.current) {
                                        window.clearTimeout(editModalCloseTimeoutRef.current);
                                        editModalCloseTimeoutRef.current = null;
                                    }
                                    setEditingRow(createEditState(row));
                                    setEditModalOpen(true);
                                }}
                                onDeleteInvite={setDeleteInviteRow}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

function AdminSummaryCardsSkeleton() {
    return (
        <section
            id="summary"
            className="grid gap-4 scroll-mt-24 lg:grid-cols-3"
            aria-label="Loading summary"
        >
            {Array.from({ length: 3 }).map((_, index) => (
                <article
                    key={index}
                    className="rounded-lg bg-ivory p-5 shadow-sm"
                >
                    <div className="h-6 w-24 animate-pulse rounded bg-taupe/15" />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((__, statIndex) => (
                            <div
                                key={statIndex}
                                className="rounded-md bg-cream p-3"
                            >
                                <div className="h-3 w-14 animate-pulse rounded bg-taupe/15" />
                                <div className="mt-3 h-8 w-10 animate-pulse rounded bg-taupe/15" />
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
}

function AdminMealCountsSkeleton() {
    return (
        <section
            id="meals"
            className="rounded-lg bg-ivory p-5 shadow-sm scroll-mt-24"
            aria-label="Loading meal counts"
        >
            <div className="h-8 w-56 animate-pulse rounded bg-taupe/15" />
            <div className="mt-4 grid gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-md bg-cream p-3"
                    >
                        <div className="h-4 w-20 animate-pulse rounded bg-taupe/15" />
                        <div className="mt-3 h-8 w-10 animate-pulse rounded bg-taupe/15" />
                    </div>
                ))}
            </div>
        </section>
    );
}
