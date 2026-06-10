import { Check, ChevronDown, Download, Lock, LogIn, LogOut, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../components/Button";
import { FadeModal } from "../components/FadeModal";
import { Layout } from "../components/Layout";
import {
    createAdminInviteGroup,
    deleteAdminInviteGroup,
    getAdminSummary,
    listAdminInvites,
    setAdminCheckIn,
    updateAdminRsvp,
} from "../lib/rsvpRepository";
import { getSupabaseBrowserClient, isDemoMode } from "../lib/supabase";
import type { AdminSummary, InviteGroup, RsvpResponse } from "../types/rsvp";
import { dinnerMealOptions } from "../types/rsvp";

type AdminInviteRow = InviteGroup & { rsvp: RsvpResponse | null };
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

function CheckInDropdown({
    label,
    attendeeNames,
    checkedNames,
    onToggle,
}: {
    label: string;
    attendeeNames: string[];
    checkedNames: string[];
    onToggle: (name: string) => void;
}) {
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0, width: 224 });

    const updatePosition = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setPosition({
            left: rect.left,
            top: rect.bottom + 8,
            width: Math.max(rect.width, 224),
        });
    };

    const toggleOpen = () => {
        updatePosition();
        setOpen((value) => !value);
    };

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return;
            }
            setOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        const handleReposition = () => updatePosition();

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [open]);

    if (!attendeeNames.length) return null;

    return (
        <>
            <button
                ref={triggerRef}
                className="flex min-w-40 cursor-pointer items-center justify-between gap-3 rounded-md border border-taupe/20 bg-white px-3 py-2 transition hover:bg-cream"
                type="button"
                aria-expanded={open}
                onClick={toggleOpen}
            >
                <span className="text-sm font-medium">
                    {label} {checkedNames.length}/{attendeeNames.length}
                </span>
                <ChevronDown
                    className={`text-taupe transition ${open ? "rotate-180" : ""}`}
                    size={16}
                />
            </button>
            {open
                ? createPortal(
                      <div
                          ref={menuRef}
                          className="fixed z-100 rounded-md border border-taupe/15 bg-white p-2 shadow-lg"
                          style={{
                              left: position.left,
                              top: position.top,
                              width: position.width,
                          }}
                      >
                          {attendeeNames.map((name) => {
                              const checked = checkedNames.includes(name);

                              return (
                                  <button
                                      key={name}
                                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-cream"
                                      onClick={() => onToggle(name)}
                                      type="button"
                                  >
                                      <span>{name}</span>
                                      {checked ? (
                                          <Check
                                              className="text-sage"
                                              size={16}
                                          />
                                      ) : null}
                                  </button>
                              );
                          })}
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}

function exportCsv(rows: AdminInviteRow[]) {
    const headers = [
        "group_name",
        "ceremony_allowed",
        "dinner_allowed",
        "rsvp_submitted",
        "ceremony_attending",
        "dinner_attending",
        "dinner_meals",
        "notes",
    ];
    const body = rows.map((row) =>
        [
            row.groupName,
            row.ceremonyAllowedCount,
            row.dinnerAllowedCount,
            row.rsvp ? "yes" : "no",
            row.rsvp?.ceremonyAttendingCount ?? 0,
            row.rsvp?.dinnerAttendingCount ?? 0,
            row.rsvp?.dinnerAttendees
                .map((attendee) => `${attendee.attendeeLabel}:${attendee.mealOption}`)
                .join("; ") ?? "",
            row.rsvp?.generalNotes ?? row.notes ?? "",
        ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
    );

    const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-rsvp-export.csv";
    link.click();
    URL.revokeObjectURL(url);
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
        guestNamesText: "",
        dinnerGuestNamesText: "",
        ceremonyAllowedCount: 1,
        dinnerAllowedCount: 0,
        notes: "",
    });
    const [editingRsvp, setEditingRsvp] = useState<RsvpResponse | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [checkIns, setCheckIns] = useState<Record<string, string[]>>({});

    const filteredRows = useMemo(
        () => rows.filter((row) => row.groupName.toLowerCase().includes(filter.toLowerCase())),
        [filter, rows],
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

        const guestNames = newInvite.guestNamesText
            .split(/\r?\n|;/)
            .map((name) => name.trim())
            .filter(Boolean);
        const dinnerGuestNames = newInvite.dinnerGuestNamesText
            .split(/\r?\n|;/)
            .map((name) => name.trim())
            .filter(Boolean);

        await createAdminInviteGroup({
            groupName: newInvite.groupName,
            guestNames,
            dinnerGuestNames,
            ceremonyAllowedCount: guestNames.length || newInvite.ceremonyAllowedCount,
            dinnerAllowedCount: dinnerGuestNames.length || newInvite.dinnerAllowedCount,
            notes: newInvite.notes,
        });
        setNewInvite({
            groupName: "",
            guestNamesText: "",
            dinnerGuestNamesText: "",
            ceremonyAllowedCount: 1,
            dinnerAllowedCount: 0,
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
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-sm uppercase text-rose">Admin</p>
                            <h1 className="mt-2 font-display text-5xl">Wedding Dashboard</h1>
                            <p className="mt-4 max-w-2xl text-taupe">
                                Manage invite groups, view RSVP status, export responses, and support day-of check-in.
                            </p>
                        </div>
                        {authenticated ? (
                            <Button variant="secondary" onClick={() => void signOut()}>
                                <LogOut size={16} />
                                Sign out
                            </Button>
                        ) : null}
                    </div>

                    {!authenticated ? (
                        <section className="max-w-md rounded-lg border border-taupe/15 bg-ivory p-5 shadow-sm">
                            <Lock className="mb-4 text-rose" />
                            <div className="grid gap-3">
                                {isDemoMode() ? (
                                    <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
                                        Supabase is not configured. Use the static admin password from your environment.
                                    </p>
                                ) : (
                                    <input
                                        className="rounded-md border border-taupe/20 bg-white px-3 py-2"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="Admin email"
                                        type="email"
                                    />
                                )}
                                <input
                                    className="rounded-md border border-taupe/20 bg-white px-3 py-2"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                    type="password"
                                />
                                <Button onClick={() => void signIn()}>
                                    <LogIn size={16} />
                                    Sign in
                                </Button>
                            </div>
                            {message ? <p className="mt-3 text-sm text-rose">{message}</p> : null}
                        </section>
                    ) : (
                        <div className="space-y-8">
                            {isDemoMode() ? (
                                <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
                                    Demo admin mode is active until Supabase environment variables are configured.
                                </p>
                            ) : null}

                            {summary ? (
                                <section
                                    id="summary"
                                    className="grid gap-4 scroll-mt-24 md:grid-cols-3 lg:grid-cols-6"
                                >
                                    {[
                                        ["Invite groups", summary.totalInviteGroups],
                                        ["Church invited", summary.ceremonyInvited],
                                        ["Church attending", summary.ceremonyAttending],
                                        ["Dinner invited", summary.dinnerInvited],
                                        ["Dinner attending", summary.dinnerAttending],
                                        ["Pending", summary.pendingResponses],
                                    ].map(([label, value]) => (
                                        <article
                                            key={label}
                                            className="rounded-lg bg-ivory p-4 shadow-sm"
                                        >
                                            <p className="text-sm text-taupe">{label}</p>
                                            <p className="mt-2 font-display text-4xl">{value}</p>
                                        </article>
                                    ))}
                                </section>
                            ) : null}

                            {summary ? (
                                <section
                                    id="meals"
                                    className="rounded-lg bg-ivory p-5 shadow-sm scroll-mt-24"
                                >
                                    <h2 className="font-display text-3xl">Dinner Meal Counts</h2>
                                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                                        {Object.entries(summary.mealCounts).map(([meal, count]) => (
                                            <div
                                                key={meal}
                                                className="rounded-md bg-cream p-3"
                                            >
                                                <p className="text-sm text-taupe">{meal}</p>
                                                <p className="font-display text-3xl">{count}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null}

                            <FadeModal
                                open={createModalOpen}
                                title="Add Invite"
                                onClose={() => setCreateModalOpen(false)}
                            >
                                <div className="grid gap-3 md:grid-cols-[1fr_140px_140px]">
                                    <label className="block">
                                        <span className="text-sm font-medium text-ink">Group name</span>
                                        <input
                                            className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={newInvite.groupName}
                                            onChange={(event) =>
                                                setNewInvite((value) => ({ ...value, groupName: event.target.value }))
                                            }
                                            placeholder="Tan Family"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-ink">Church seats</span>
                                        <input
                                            className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={newInvite.ceremonyAllowedCount}
                                            min={0}
                                            onChange={(event) =>
                                                setNewInvite((value) => ({
                                                    ...value,
                                                    ceremonyAllowedCount: Number(event.target.value),
                                                }))
                                            }
                                            type="number"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-ink">Dinner seats</span>
                                        <input
                                            className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={newInvite.dinnerAllowedCount}
                                            min={0}
                                            onChange={(event) =>
                                                setNewInvite((value) => ({
                                                    ...value,
                                                    dinnerAllowedCount: Number(event.target.value),
                                                }))
                                            }
                                            type="number"
                                        />
                                    </label>
                                </div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-medium text-ink">Church/lunch invitees</span>
                                        <textarea
                                            className="mt-2 min-h-28 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={newInvite.guestNamesText}
                                            onChange={(event) =>
                                                setNewInvite((value) => ({
                                                    ...value,
                                                    guestNamesText: event.target.value,
                                                }))
                                            }
                                            placeholder="One name per line"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-ink">Dinner invitees</span>
                                        <textarea
                                            className="mt-2 min-h-28 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                            value={newInvite.dinnerGuestNamesText}
                                            onChange={(event) =>
                                                setNewInvite((value) => ({
                                                    ...value,
                                                    dinnerGuestNamesText: event.target.value,
                                                }))
                                            }
                                            placeholder="One name per line"
                                        />
                                    </label>
                                </div>
                                <label className="mt-3 block">
                                    <span className="text-sm font-medium text-ink">Internal notes</span>
                                    <textarea
                                        className="mt-2 min-h-20 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                        value={newInvite.notes}
                                        onChange={(event) =>
                                            setNewInvite((value) => ({ ...value, notes: event.target.value }))
                                        }
                                        placeholder="Optional"
                                    />
                                </label>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Button onClick={() => void createInvite()}>Create invite</Button>
                                    <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-taupe/30 bg-ivory/80 px-5 py-2 text-sm font-medium text-ink transition hover:bg-cream">
                                        Import CSV
                                        <input
                                            className="sr-only"
                                            type="file"
                                            accept=".csv,text/csv"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) void importCsv(file);
                                            }}
                                        />
                                    </label>
                                </div>
                            </FadeModal>

                            <FadeModal
                                open={editModalOpen && Boolean(editingRsvp)}
                                title="Edit RSVP"
                                onClose={() => setEditModalOpen(false)}
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
                                                            value
                                                                ? { ...value, responderName: event.target.value }
                                                                : value,
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
                                                                      ceremonyAttendingCount: Number(
                                                                          event.target.value,
                                                                      ),
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
                                                            <span className="text-sm font-medium text-ink">
                                                                {attendee.attendeeLabel}
                                                            </span>
                                                            <input
                                                                className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                                                value={attendee.dietaryPreference}
                                                                placeholder="Dietary preference"
                                                                onChange={(event) =>
                                                                    setEditingRsvp((value) =>
                                                                        value
                                                                            ? {
                                                                                  ...value,
                                                                                  ceremonyAttendees:
                                                                                      value.ceremonyAttendees.map(
                                                                                          (row, rowIndex) =>
                                                                                              rowIndex === index
                                                                                                  ? {
                                                                                                        ...row,
                                                                                                        dietaryPreference:
                                                                                                            event.target
                                                                                                                .value,
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
                                                            <p className="font-medium text-ink">
                                                                {attendee.attendeeLabel}
                                                            </p>
                                                            <label className="block">
                                                                <span className="text-sm font-medium text-ink">
                                                                    Meal option
                                                                </span>
                                                                <select
                                                                    className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                                                    value={attendee.mealOption}
                                                                    onChange={(event) =>
                                                                        setEditingRsvp((value) =>
                                                                            value
                                                                                ? {
                                                                                      ...value,
                                                                                      dinnerAttendees:
                                                                                          value.dinnerAttendees.map(
                                                                                              (row, rowIndex) =>
                                                                                                  rowIndex === index
                                                                                                      ? {
                                                                                                            ...row,
                                                                                                            mealOption:
                                                                                                                event
                                                                                                                    .target
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
                                                                <span className="text-sm font-medium text-ink">
                                                                    Dietary preference
                                                                </span>
                                                                <input
                                                                    className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                                                    value={attendee.dietaryPreference}
                                                                    placeholder="Optional"
                                                                    onChange={(event) =>
                                                                        setEditingRsvp((value) =>
                                                                            value
                                                                                ? {
                                                                                      ...value,
                                                                                      dinnerAttendees:
                                                                                          value.dinnerAttendees.map(
                                                                                              (row, rowIndex) =>
                                                                                                  rowIndex === index
                                                                                                      ? {
                                                                                                            ...row,
                                                                                                            dietaryPreference:
                                                                                                                event
                                                                                                                    .target
                                                                                                                    .value,
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
                                            <Button onClick={() => void saveRsvpEdit()}>Save RSVP</Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setEditModalOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : null}
                            </FadeModal>

                            <section
                                id="invites"
                                className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="font-display text-3xl">Invite Groups & RSVP</h2>
                                        <p className="text-sm text-taupe">
                                            Create, import, delete, export, edit submitted RSVPs, and mark day-of
                                            check-ins.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => setCreateModalOpen(true)}>
                                            <Plus size={16} />
                                            Add invite
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => void loadAdminData()}
                                        >
                                            <RefreshCw size={16} />
                                            Refresh
                                        </Button>
                                        <Button onClick={() => exportCsv(filteredRows)}>
                                            <Download size={16} />
                                            Export CSV
                                        </Button>
                                    </div>
                                </div>
                                <input
                                    className="mt-5 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                                    value={filter}
                                    onChange={(event) => setFilter(event.target.value)}
                                    placeholder="Filter invite groups"
                                />
                                <div className="mt-5 overflow-x-auto overflow-y-visible">
                                    <table className="w-full min-w-190 text-left text-sm">
                                        <thead className="border-b border-taupe/15 text-taupe">
                                            <tr>
                                                <th className="py-3 pr-4">Group</th>
                                                <th className="py-3 pr-4">Church invitees</th>
                                                <th className="py-3 pr-4">Dinner invitees</th>
                                                <th className="py-3 pr-4">RSVP</th>
                                                <th className="py-3 pr-4">Check in</th>
                                                <th className="py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-taupe/10">
                                            {filteredRows.map((row) => (
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
                                                            {row.dinnerGuestNames.length || row.dinnerAllowedCount}{" "}
                                                            invited
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
                                                                        label={
                                                                            eventType === "ceremony"
                                                                                ? "Church"
                                                                                : "Dinner"
                                                                        }
                                                                        attendeeNames={attendeeNames}
                                                                        checkedNames={checkedNames}
                                                                        onToggle={(name) =>
                                                                            void toggleCheckIn(row, eventType, name)
                                                                        }
                                                                    />
                                                                );
                                                            })}
                                                            {!row.rsvp ? (
                                                                <span className="text-sm text-taupe">
                                                                    Awaiting RSVP
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex justify-end gap-2">
                                                            {row.rsvp ? (
                                                                <button
                                                                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-taupe/20 text-ink transition hover:border-rose/40 hover:bg-cream"
                                                                    aria-label={`Edit RSVP for ${row.groupName}`}
                                                                    title="Edit RSVP"
                                                                    onClick={() => {
                                                                        setEditingRsvp(row.rsvp);
                                                                        setEditModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Pencil size={15} />
                                                                </button>
                                                            ) : null}
                                                            <button
                                                                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-rose/30 text-rose transition hover:bg-rose/10"
                                                                aria-label={`Delete ${row.groupName}`}
                                                                title="Delete invite group"
                                                                onClick={() => {
                                                                    void deleteAdminInviteGroup(row.id).then(
                                                                        loadAdminData,
                                                                    );
                                                                }}
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
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
