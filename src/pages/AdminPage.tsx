import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import {
    AddInviteModal,
    AdminHeader,
    AdminMealCounts,
    AdminSignInCard,
    AdminSummaryCards,
    createNewInviteGuestRow,
    EditRsvpModal,
    exportCsv,
    InviteGroupsSection,
    type AdminInviteRow,
} from "../components/admin";
import {
    createAdminInviteGroup,
    deleteAdminInviteGroup,
    getAdminSummary,
    listAdminInvites,
    setAdminCheckIn,
    updateAdminRsvp,
} from "../lib/rsvpRepository";
import { getSupabaseBrowserClient, isDemoMode } from "../lib/supabase";
import type { AdminSummary, RsvpResponse } from "../types/rsvp";

const adminLoginStorageKey = "wedding-admin-login-expires-at";
const adminLoginDurationMs = 2 * 60 * 60 * 1000;

function hasSavedAdminLogin() {
    return Number(localStorage.getItem(adminLoginStorageKey) ?? 0) > Date.now();
}

function saveAdminLogin() {
    localStorage.setItem(adminLoginStorageKey, String(Date.now() + adminLoginDurationMs));
}

function clearAdminLogin() {
    localStorage.removeItem(adminLoginStorageKey);
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

export function AdminPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(() => hasSavedAdminLogin());
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [rows, setRows] = useState<AdminInviteRow[]>([]);
    const [filter, setFilter] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [newInvite, setNewInvite] = useState({
        groupName: "",
        guests: [createNewInviteGuestRow()],
        notes: "",
    });
    const [editingRsvp, setEditingRsvp] = useState<RsvpResponse | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [checkIns, setCheckIns] = useState<Record<string, string[]>>({});

    const filteredRows = useMemo(() => {
        const search = filter.trim().toLowerCase();
        if (!search) return rows;

        return rows.filter((row) => {
            const searchable = [row.groupName, ...row.guestNames, ...row.dinnerGuestNames].join(" ").toLowerCase();
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
            guestNames,
            dinnerGuestNames,
            ceremonyAllowedCount: guestNames.length,
            dinnerAllowedCount: dinnerGuestNames.length,
            notes,
        });

        setNewInvite({
            groupName: "",
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
        if (!editingRsvp) return;
        await updateAdminRsvp(editingRsvp);
        setEditModalOpen(false);
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

    useEffect(() => {
        if (authenticated) {
            void getAdminSummary().then(setSummary);
            void listAdminInvites().then(setRows);
        }
    }, [authenticated]);

    const signIn = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            const staticPassword =
                (import.meta.env.VITE_ADMIN_STATIC_PASSWORD as string | undefined) || "yijialovesrachel123";
            if (password === staticPassword) {
                setAuthenticated(true);
                saveAdminLogin();
                setMessage(null);
                return;
            }
            setMessage("Invalid admin password.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage(error.message);
            return;
        }

        setAuthenticated(true);
        saveAdminLogin();
    };

    const signOut = async () => {
        clearAdminLogin();
        setAuthenticated(false);
        setSummary(null);
        setRows([]);
        setPassword("");
        setEmail("");
        setMessage(null);

        const supabase = getSupabaseBrowserClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    return (
        <Layout>
            <main className="bg-cream/50 pb-14 pt-28">
                <div className="section-shell">
                    <AdminHeader
                        authenticated={authenticated}
                        onSignOut={() => void signOut()}
                    />

                    {!authenticated ? (
                        <AdminSignInCard
                            demoMode={isDemoMode()}
                            email={email}
                            password={password}
                            message={message}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onSignIn={() => void signIn()}
                        />
                    ) : (
                        <div className="space-y-8">
                            {isDemoMode() ? (
                                <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
                                    Demo admin mode is active until Supabase environment variables are configured.
                                </p>
                            ) : null}

                            {summary ? <AdminSummaryCards summary={summary} /> : null}
                            {summary ? <AdminMealCounts summary={summary} /> : null}

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
                                editingRsvp={editingRsvp}
                                setEditingRsvp={setEditingRsvp}
                                onSave={() => void saveRsvpEdit()}
                                onClose={() => setEditModalOpen(false)}
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
                                onEditRsvp={(row) => {
                                    setEditingRsvp(row.rsvp);
                                    setEditModalOpen(true);
                                }}
                                onDeleteInvite={(row) => {
                                    void deleteAdminInviteGroup(row.id).then(loadAdminData);
                                }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
