import {
    Check,
    ChevronDown,
    Church,
    Download,
    List,
    LoaderCircle,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Upload,
    Utensils,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../Button";
import type { AdminInviteRow } from "../types";
import {
    dinnerMealOptions,
    type CeremonyAttendee,
    type DinnerAttendee,
    type DinnerMealOption,
} from "../../../types/rsvp";

type TableView = "master" | "church" | "dinner";
type RsvpFilter = "all" | "rsvped" | "pending";
type CheckInFilter = "all" | "checked" | "not_checked";
type DietaryFilter = "all" | "none" | "present";
type MealFilter = "all" | DinnerMealOption;

const inviteeRemarksHeading = "Invitee remarks:";

function parseInviteRemarks(notes: string | null | undefined) {
    const rawNotes = notes ?? "";
    const [, remarksBlock = ""] = rawNotes.split(inviteeRemarksHeading);
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

    return remarksByName;
}

function joinRemarks(...remarks: Array<string | null | undefined>) {
    return remarks
        .map((remark) => remark?.trim())
        .filter(Boolean)
        .join(" / ");
}

function includesSearch(values: Array<string | number | null | undefined>, search: string) {
    return values
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase()
        .includes(search);
}

function RsvpStatus({ row }: { row: AdminInviteRow }) {
    return (
        <div className="space-y-1">
            {row.invitedAt ? <span>Invited</span> : <span className="text-taupe">Not invited</span>}
            <span className="block text-xs text-taupe">{row.rsvp ? "RSVPed" : "RSVP pending"}</span>
        </div>
    );
}

function EmptyValue() {
    return <span className="text-taupe">-</span>;
}

function AttendeeCheckInButton({
    checked,
    label,
    onToggle,
}: {
    checked: boolean;
    label: string;
    onToggle: () => void;
}) {
    return (
        <button
            className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                checked
                    ? "border-sage/40 bg-sage/10 text-ink hover:bg-sage/15"
                    : "border-taupe/20 bg-white text-taupe hover:bg-cream hover:text-ink"
            }`}
            type="button"
            onClick={onToggle}
            aria-pressed={checked}
        >
            <span className="inline-flex size-4 items-center justify-center rounded border border-current">
                {checked ? <Check size={12} /> : null}
            </span>
            {label}
        </button>
    );
}

function FilterSelect({
    value,
    onChange,
    ariaLabel,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
    children: ReactNode;
}) {
    return (
        <div className="relative">
            <select
                className="w-full appearance-none rounded-md border border-taupe/20 bg-white py-2 pl-3 pr-10"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-label={ariaLabel}
            >
                {children}
            </select>
            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
                size={16}
                aria-hidden="true"
            />
        </div>
    );
}

export function InviteGroupsSection({
    rows,
    filter,
    onFilterChange,
    onAddInvite,
    onImportCsv,
    onRefresh,
    loading,
    refreshing,
    onExport,
    onToggleCheckIn,
    getCheckedInNames,
    onInviteMessage,
    onEditRsvp,
    onDeleteInvite,
}: {
    rows: AdminInviteRow[];
    filter: string;
    onFilterChange: (value: string) => void;
    onAddInvite: () => void;
    onImportCsv: (file: File) => void;
    onRefresh: () => void;
    loading: boolean;
    refreshing: boolean;
    onExport: (rows: AdminInviteRow[]) => void;
    onToggleCheckIn: (row: AdminInviteRow, eventType: "ceremony" | "dinner", name: string) => void;
    getCheckedInNames: (row: AdminInviteRow, eventType: "ceremony" | "dinner") => string[];
    onInviteMessage: (row: AdminInviteRow) => void;
    onEditRsvp: (row: AdminInviteRow) => void;
    onDeleteInvite: (row: AdminInviteRow) => void;
}) {
    const importCsvInputRef = useRef<HTMLInputElement | null>(null);
    const toolbarMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
    const toolbarMenuRef = useRef<HTMLDivElement | null>(null);
    const rowMenuRef = useRef<HTMLDivElement | null>(null);
    const rowActionTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [view, setView] = useState<TableView>("master");
    const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>("all");
    const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>("all");
    const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
    const [mealFilter, setMealFilter] = useState<MealFilter>("all");
    const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
    const [rowMenuOpenKey, setRowMenuOpenKey] = useState<string | null>(null);
    const [rowMenuRow, setRowMenuRow] = useState<AdminInviteRow | null>(null);
    const [toolbarMenuPosition, setToolbarMenuPosition] = useState({ left: 0, top: 0, width: 180 });
    const [rowMenuPosition, setRowMenuPosition] = useState({ left: 0, top: 0, width: 176 });

    const search = filter.trim().toLowerCase();

    const masterRows = useMemo(
        () =>
            rows.filter((row) => {
                const remarksByName = parseInviteRemarks(row.notes);
                const checkedNames = [...getCheckedInNames(row, "ceremony"), ...getCheckedInNames(row, "dinner")];
                const checkedTotal = checkedNames.length;
                const attendeeTotal =
                    (row.rsvp?.ceremonyAttendees.length ?? 0) + (row.rsvp?.dinnerAttendees.length ?? 0);
                const groupRemarks = joinRemarks(row.rsvp?.generalNotes, ...Array.from(remarksByName.values()));
                const attendeeDetails = [
                    ...(row.rsvp?.ceremonyAttendees.flatMap((attendee) => [
                        attendee.attendeeLabel,
                        attendee.dietaryPreference,
                    ]) ?? []),
                    ...(row.rsvp?.dinnerAttendees.flatMap((attendee) => [
                        attendee.attendeeLabel,
                        attendee.mealOption,
                        attendee.dietaryPreference,
                    ]) ?? []),
                ];
                const dietaryPreferences = [
                    ...(row.rsvp?.ceremonyAttendees.map((attendee) => attendee.dietaryPreference.trim()) ?? []),
                    ...(row.rsvp?.dinnerAttendees.map((attendee) => attendee.dietaryPreference.trim()) ?? []),
                ];
                const hasDietaryPreference = dietaryPreferences.some(Boolean);
                const hasMatchingMeal =
                    mealFilter === "all" ||
                    Boolean(row.rsvp?.dinnerAttendees.some((attendee) => attendee.mealOption === mealFilter));

                if (rsvpFilter === "rsvped" && !row.rsvp) return false;
                if (rsvpFilter === "pending" && row.rsvp) return false;
                if (checkInFilter === "checked" && checkedTotal === 0) return false;
                if (checkInFilter === "not_checked" && attendeeTotal > 0 && checkedTotal >= attendeeTotal) return false;
                if (checkInFilter === "not_checked" && attendeeTotal === 0) return false;
                if (dietaryFilter === "present" && !hasDietaryPreference) return false;
                if (dietaryFilter === "none" && hasDietaryPreference) return false;
                if (!hasMatchingMeal) return false;

                if (!search) return true;

                return includesSearch(
                    [
                        row.groupName,
                        row.invitePassword,
                        ...row.guestNames,
                        ...row.dinnerGuestNames,
                        ...attendeeDetails,
                        groupRemarks,
                    ],
                    search,
                );
            }),
        [checkInFilter, dietaryFilter, getCheckedInNames, mealFilter, rows, rsvpFilter, search],
    );

    const churchRows = useMemo(
        () =>
            rows.flatMap((row) => {
                if (rsvpFilter === "rsvped" && !row.rsvp) return [];
                if (rsvpFilter === "pending" && row.rsvp) return [];
                if (!row.rsvp) return [];

                const checkedNames = getCheckedInNames(row, "ceremony");
                const remarksByName = parseInviteRemarks(row.notes);

                return row.rsvp.ceremonyAttendees
                    .map((attendee, index) => ({
                        key: `church:${row.id}:${attendee.attendeeLabel}:${index}`,
                        row,
                        attendee,
                        checked: checkedNames.includes(attendee.attendeeLabel),
                        remarks: joinRemarks(remarksByName.get(attendee.attendeeLabel), row.rsvp?.generalNotes),
                    }))
                    .filter((item) => {
                        if (checkInFilter === "checked" && !item.checked) return false;
                        if (checkInFilter === "not_checked" && item.checked) return false;
                        if (dietaryFilter === "present" && !item.attendee.dietaryPreference.trim()) return false;
                        if (dietaryFilter === "none" && item.attendee.dietaryPreference.trim()) return false;
                        if (mealFilter !== "all") return false;
                        if (!search) return true;

                        return includesSearch(
                            [
                                item.attendee.attendeeLabel,
                                item.attendee.dietaryPreference,
                                item.row.groupName,
                                item.row.invitePassword,
                                item.remarks,
                            ],
                            search,
                        );
                    });
            }),
        [checkInFilter, dietaryFilter, getCheckedInNames, mealFilter, rows, rsvpFilter, search],
    );

    const dinnerRows = useMemo(
        () =>
            rows.flatMap((row) => {
                if (rsvpFilter === "rsvped" && !row.rsvp) return [];
                if (rsvpFilter === "pending" && row.rsvp) return [];
                if (!row.rsvp) return [];

                const checkedNames = getCheckedInNames(row, "dinner");
                const remarksByName = parseInviteRemarks(row.notes);

                return row.rsvp.dinnerAttendees
                    .map((attendee, index) => ({
                        key: `dinner:${row.id}:${attendee.attendeeLabel}:${index}`,
                        row,
                        attendee,
                        checked: checkedNames.includes(attendee.attendeeLabel),
                        remarks: joinRemarks(remarksByName.get(attendee.attendeeLabel), row.rsvp?.generalNotes),
                    }))
                    .filter((item) => {
                        if (checkInFilter === "checked" && !item.checked) return false;
                        if (checkInFilter === "not_checked" && item.checked) return false;
                        if (dietaryFilter === "present" && !item.attendee.dietaryPreference.trim()) return false;
                        if (dietaryFilter === "none" && item.attendee.dietaryPreference.trim()) return false;
                        if (mealFilter !== "all" && item.attendee.mealOption !== mealFilter) return false;
                        if (!search) return true;

                        return includesSearch(
                            [
                                item.attendee.attendeeLabel,
                                item.attendee.mealOption,
                                item.attendee.dietaryPreference,
                                item.row.groupName,
                                item.row.invitePassword,
                                item.remarks,
                            ],
                            search,
                        );
                    });
            }),
        [checkInFilter, dietaryFilter, getCheckedInNames, mealFilter, rows, rsvpFilter, search],
    );

    const visibleMasterRows = view === "master" ? masterRows : rows;
    const visibleRowCount =
        view === "master" ? masterRows.length : view === "church" ? churchRows.length : dinnerRows.length;
    const tableColSpan = view === "master" ? 5 : view === "church" ? 7 : 8;

    const updateToolbarMenuPosition = () => {
        const rect = toolbarMenuTriggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setToolbarMenuPosition({
            left: rect.right - 180,
            top: rect.bottom + 8,
            width: 180,
        });
    };

    const updateRowMenuPosition = (rowKey: string) => {
        const trigger = rowActionTriggerRefs.current[rowKey];
        const rect = trigger?.getBoundingClientRect();
        if (!rect) return;

        setRowMenuPosition({
            left: rect.right - 176,
            top: rect.bottom + 8,
            width: 176,
        });
    };

    const toggleToolbarMenu = () => {
        updateToolbarMenuPosition();
        setToolbarMenuOpen((value) => !value);
        setRowMenuOpenKey(null);
        setRowMenuRow(null);
    };

    const toggleRowMenu = (rowKey: string, row: AdminInviteRow) => {
        if (rowMenuOpenKey === rowKey) {
            setRowMenuOpenKey(null);
            setRowMenuRow(null);
            return;
        }

        updateRowMenuPosition(rowKey);
        setRowMenuOpenKey(rowKey);
        setRowMenuRow(row);
        setToolbarMenuOpen(false);
    };

    useEffect(() => {
        if (!toolbarMenuOpen && !rowMenuOpenKey) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            const activeRowTrigger = rowMenuOpenKey ? rowActionTriggerRefs.current[rowMenuOpenKey] : null;

            if (
                toolbarMenuTriggerRef.current?.contains(target) ||
                toolbarMenuRef.current?.contains(target) ||
                activeRowTrigger?.contains(target) ||
                rowMenuRef.current?.contains(target)
            ) {
                return;
            }

            setToolbarMenuOpen(false);
            setRowMenuOpenKey(null);
            setRowMenuRow(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setToolbarMenuOpen(false);
                setRowMenuOpenKey(null);
                setRowMenuRow(null);
            }
        };

        const handleReposition = () => {
            if (toolbarMenuOpen) updateToolbarMenuPosition();
            if (rowMenuOpenKey) updateRowMenuPosition(rowMenuOpenKey);
        };

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
    }, [toolbarMenuOpen, rowMenuOpenKey]);

    const renderActionButton = (rowKey: string, row: AdminInviteRow) => (
        <div className="flex justify-end">
            <button
                ref={(node) => {
                    rowActionTriggerRefs.current[rowKey] = node;
                }}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-taupe/20 text-ink transition hover:bg-cream"
                aria-label={`Actions for ${row.groupName}`}
                title="Actions"
                type="button"
                onClick={() => toggleRowMenu(rowKey, row)}
            >
                <MoreHorizontal size={16} />
            </button>
        </div>
    );

    const renderMasterRows = () =>
        masterRows.map((row) => {
            const hasDinnerInvite = row.dinnerGuestNames.length > 0 || row.dinnerAllowedCount > 0;
            const remarksByName = parseInviteRemarks(row.notes);
            const remarks = joinRemarks(row.rsvp?.generalNotes, ...Array.from(remarksByName.values()));

            return (
                <tr key={row.id}>
                    <td className="py-3 pr-4">
                        <span className="block font-medium">{row.groupName}</span>
                    </td>
                    <td className="py-3 pr-4">
                        <div className="space-y-2">
                            <p>
                                <span className="font-medium">Church: </span>
                                {row.guestNames.join(", ") || row.ceremonyAllowedCount}
                                <span className="ml-2 text-xs text-taupe">
                                    ({row.guestNames.length || row.ceremonyAllowedCount} invited)
                                </span>
                            </p>
                            {hasDinnerInvite ? (
                                <p>
                                    <span className="font-medium">Dinner: </span>
                                    {row.dinnerGuestNames.join(", ") || row.dinnerAllowedCount}
                                    <span className="ml-2 text-xs text-taupe">
                                        ({row.dinnerGuestNames.length || row.dinnerAllowedCount} invited)
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </td>
                    <td className="py-3 pr-4">
                        {row.invitedAt ? (
                            <RsvpStatus row={row} />
                        ) : (
                            <div className="space-y-1">
                                <button
                                    className="cursor-pointer text-left text-taupe underline decoration-taupe/40 underline-offset-4 transition hover:text-ink"
                                    type="button"
                                    onClick={() => onInviteMessage(row)}
                                >
                                    Not invited
                                </button>
                                <span className="block text-xs text-taupe">{row.rsvp ? "RSVPed" : "RSVP pending"}</span>
                            </div>
                        )}
                    </td>
                    <td className="max-w-72 py-3 pr-4">{remarks || <EmptyValue />}</td>
                    <td className="py-3">{renderActionButton(row.id, row)}</td>
                </tr>
            );
        });

    const renderChurchRows = () =>
        churchRows.map(({ key, row, attendee, checked, remarks }) => (
            <tr key={key}>
                <td className="py-3 pr-4">
                    <span className="font-medium">{(attendee as CeremonyAttendee).attendeeLabel}</span>
                </td>
                <td className="py-3 pr-4">{row.groupName}</td>
                <td className="py-3 pr-4">
                    <RsvpStatus row={row} />
                </td>
                <td className="py-3 pr-4">{attendee.dietaryPreference || <EmptyValue />}</td>
                <td className="max-w-72 py-3 pr-4">{remarks || <EmptyValue />}</td>
                <td className="py-3 pr-4">
                    <AttendeeCheckInButton
                        checked={checked}
                        label={checked ? "Checked in" : "Not checked in"}
                        onToggle={() => onToggleCheckIn(row, "ceremony", attendee.attendeeLabel)}
                    />
                </td>
                <td className="py-3">{renderActionButton(key, row)}</td>
            </tr>
        ));

    const renderDinnerRows = () =>
        dinnerRows.map(({ key, row, attendee, checked, remarks }) => (
            <tr key={key}>
                <td className="py-3 pr-4">
                    <span className="font-medium">{(attendee as DinnerAttendee).attendeeLabel}</span>
                </td>
                <td className="py-3 pr-4">{row.groupName}</td>
                <td className="py-3 pr-4">
                    <RsvpStatus row={row} />
                </td>
                <td className="py-3 pr-4">{attendee.mealOption}</td>
                <td className="py-3 pr-4">{attendee.dietaryPreference || <EmptyValue />}</td>
                <td className="max-w-72 py-3 pr-4">{remarks || <EmptyValue />}</td>
                <td className="py-3 pr-4">
                    <AttendeeCheckInButton
                        checked={checked}
                        label={checked ? "Checked in" : "Not checked in"}
                        onToggle={() => onToggleCheckIn(row, "dinner", attendee.attendeeLabel)}
                    />
                </td>
                <td className="py-3">{renderActionButton(key, row)}</td>
            </tr>
        ));

    return (
        <section
            id="invites"
            className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
            aria-busy={loading || refreshing}
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-3xl">Invite Groups & RSVP</h2>
                    <p className="text-sm text-taupe">
                        Create, import, invite, export, edit RSVPs, and mark day-of check-ins.
                    </p>
                </div>
                <div className="ml-auto flex w-full flex-wrap justify-end gap-2 md:w-auto">
                    <Button onClick={onAddInvite}>
                        <Plus size={16} />
                        Add invite
                    </Button>
                    <Button
                        variant="secondary"
                        className="min-w-11 px-3"
                        onClick={onRefresh}
                        disabled={refreshing}
                        aria-label="Refresh invites"
                        title={refreshing ? "Refreshing" : "Refresh"}
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : undefined}
                        />
                    </Button>
                    <button
                        ref={toolbarMenuTriggerRef}
                        className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-taupe/20 bg-white/85 px-3 text-ink transition hover:bg-cream"
                        type="button"
                        aria-expanded={toolbarMenuOpen}
                        aria-label="CSV actions"
                        title="CSV actions"
                        onClick={toggleToolbarMenu}
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    <input
                        ref={importCsvInputRef}
                        className="sr-only"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.currentTarget.value = "";
                            if (file) {
                                onImportCsv(file);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {[
                    { value: "master", label: "Master", icon: List },
                    { value: "church", label: "Church", icon: Church },
                    { value: "dinner", label: "Dinner", icon: Utensils },
                ].map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition sm:px-4 ${
                            view === value
                                ? "border-rose/40 bg-rose/10 text-ink"
                                : "border-taupe/20 bg-white text-taupe hover:bg-cream hover:text-ink"
                        }`}
                        type="button"
                        onClick={() => setView(value as TableView)}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-3">
                <input
                    className="w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                    value={filter}
                    onChange={(event) => onFilterChange(event.target.value)}
                    placeholder="Filter by name, meal, dietary, remarks"
                />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <FilterSelect
                    value={rsvpFilter}
                    onChange={(value) => setRsvpFilter(value as RsvpFilter)}
                    ariaLabel="Filter RSVP status"
                >
                    <option value="all">All RSVPs</option>
                    <option value="rsvped">RSVPed</option>
                    <option value="pending">Pending</option>
                </FilterSelect>
                <FilterSelect
                    value={checkInFilter}
                    onChange={(value) => setCheckInFilter(value as CheckInFilter)}
                    ariaLabel="Filter check-in status"
                >
                    <option value="all">All check-ins</option>
                    <option value="checked">Checked in</option>
                    <option value="not_checked">Not checked in</option>
                </FilterSelect>
                <FilterSelect
                    value={dietaryFilter}
                    onChange={(value) => setDietaryFilter(value as DietaryFilter)}
                    ariaLabel="Filter dietary preference"
                >
                    <option value="all">All dietary</option>
                    <option value="none">No dietary</option>
                    <option value="present">Dietary present</option>
                </FilterSelect>
                <FilterSelect
                    value={mealFilter}
                    onChange={(value) => setMealFilter(value as MealFilter)}
                    ariaLabel="Filter meal option"
                >
                    <option value="all">All meals</option>
                    {dinnerMealOptions.map((option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>
                    ))}
                </FilterSelect>
            </div>

            <p className="mt-3 text-sm text-taupe">
                Showing {visibleRowCount} {view === "master" ? "invite groups" : "attendees"}.
            </p>

            {refreshing ? (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-taupe">
                    <LoaderCircle
                        size={16}
                        className="animate-spin"
                    />
                    Refreshing dashboard...
                </p>
            ) : null}

            <div className="mt-5 overflow-x-auto overflow-y-visible">
                <table className="w-full min-w-180 text-left text-sm">
                    <thead className="border-b border-taupe/15 text-taupe">
                        {view === "master" ? (
                            <tr>
                                <th className="py-3 pr-4">Group</th>
                                <th className="py-3 pr-4">Guests</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3 pr-4">Remarks</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        ) : view === "church" ? (
                            <tr>
                                <th className="py-3 pr-4">Attendee</th>
                                <th className="py-3 pr-4">Group</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3 pr-4">Dietary</th>
                                <th className="py-3 pr-4">Remarks</th>
                                <th className="py-3 pr-4">Check-in</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="py-3 pr-4">Attendee</th>
                                <th className="py-3 pr-4">Group</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3 pr-4">Meal</th>
                                <th className="py-3 pr-4">Dietary</th>
                                <th className="py-3 pr-4">Remarks</th>
                                <th className="py-3 pr-4">Check-in</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-taupe/10">
                        {loading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                  <tr key={index}>
                                      {Array.from({ length: tableColSpan }).map((__, cellIndex) => (
                                          <td
                                              key={cellIndex}
                                              className="py-3 pr-4"
                                          >
                                              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-taupe/15" />
                                              {cellIndex < 3 ? (
                                                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-taupe/15" />
                                              ) : null}
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : null}
                        {!loading && visibleRowCount === 0 ? (
                            <tr>
                                <td
                                    className="py-8 text-center text-taupe"
                                    colSpan={tableColSpan}
                                >
                                    No matching records found.
                                </td>
                            </tr>
                        ) : null}
                        {!loading && view === "master" ? renderMasterRows() : null}
                        {!loading && view === "church" ? renderChurchRows() : null}
                        {!loading && view === "dinner" ? renderDinnerRows() : null}
                    </tbody>
                </table>
            </div>

            {toolbarMenuOpen
                ? createPortal(
                      <div
                          ref={toolbarMenuRef}
                          className="fixed z-100 rounded-md border border-taupe/20 bg-white p-1 shadow-lg"
                          style={{
                              left: toolbarMenuPosition.left,
                              top: toolbarMenuPosition.top,
                              width: toolbarMenuPosition.width,
                          }}
                      >
                          <button
                              className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                              type="button"
                              onClick={() => {
                                  setToolbarMenuOpen(false);
                                  importCsvInputRef.current?.click();
                              }}
                          >
                              <Upload size={16} />
                              Add by CSV
                          </button>
                          <button
                              className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                              type="button"
                              onClick={() => {
                                  setToolbarMenuOpen(false);
                                  onExport(visibleMasterRows);
                              }}
                          >
                              <Download size={16} />
                              Download CSV
                          </button>
                      </div>,
                      document.body,
                  )
                : null}

            {rowMenuOpenKey && rowMenuRow
                ? createPortal(
                      <div
                          ref={rowMenuRef}
                          className="fixed z-100 rounded-md border border-taupe/20 bg-white p-1 shadow-lg"
                          style={{
                              left: rowMenuPosition.left,
                              top: rowMenuPosition.top,
                              width: rowMenuPosition.width,
                          }}
                      >
                          <button
                              className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                              type="button"
                              onClick={() => {
                                  onInviteMessage(rowMenuRow);
                                  setRowMenuOpenKey(null);
                                  setRowMenuRow(null);
                              }}
                          >
                              Invite message
                          </button>
                          <button
                              className="flex w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                              type="button"
                              onClick={() => {
                                  onEditRsvp(rowMenuRow);
                                  setRowMenuOpenKey(null);
                                  setRowMenuRow(null);
                              }}
                          >
                              Edit
                          </button>
                          <button
                              className="flex w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-rose transition hover:bg-rose/10"
                              type="button"
                              onClick={() => {
                                  onDeleteInvite(rowMenuRow);
                                  setRowMenuOpenKey(null);
                                  setRowMenuRow(null);
                              }}
                          >
                              Delete
                          </button>
                      </div>,
                      document.body,
                  )
                : null}
        </section>
    );
}
