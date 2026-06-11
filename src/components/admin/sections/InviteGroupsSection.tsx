import { Download, LoaderCircle, MoreHorizontal, Plus, RefreshCw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    onImportCsv,
    onRefresh,
    loading,
    refreshing,
    onExport,
    onToggleCheckIn,
    checkInAttendees,
    getCheckedInNames,
    onInviteMessage,
    onEditRsvp,
    onDeleteInvite,
}: {
    rows: AdminInviteRow[];
    filter: string;
    filteredChurchInvitedCount: number;
    filteredDinnerInvitedCount: number;
    onFilterChange: (value: string) => void;
    onAddInvite: () => void;
    onImportCsv: (file: File) => void;
    onRefresh: () => void;
    loading: boolean;
    refreshing: boolean;
    onExport: () => void;
    onToggleCheckIn: (row: AdminInviteRow, eventType: "ceremony" | "dinner", name: string) => void;
    checkInAttendees: (row: AdminInviteRow, eventType: "ceremony" | "dinner") => string[];
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
    const [toolbarMenuOpen, setToolbarMenuOpen] = useState(false);
    const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null);
    const [toolbarMenuPosition, setToolbarMenuPosition] = useState({ left: 0, top: 0, width: 180 });
    const [rowMenuPosition, setRowMenuPosition] = useState({ left: 0, top: 0, width: 176 });

    const activeRow = rowMenuOpenId ? (rows.find((row) => row.id === rowMenuOpenId) ?? null) : null;

    const updateToolbarMenuPosition = () => {
        const rect = toolbarMenuTriggerRef.current?.getBoundingClientRect();
        if (!rect) return;

        setToolbarMenuPosition({
            left: rect.right - 180,
            top: rect.bottom + 8,
            width: 180,
        });
    };

    const updateRowMenuPosition = (rowId: string) => {
        const trigger = rowActionTriggerRefs.current[rowId];
        const rect = trigger?.getBoundingClientRect();
        if (!rect) return;

        setRowMenuPosition({
            left: rect.right - 176,
            top: rect.bottom + 8,
            width: 176,
        });
    };

    const formatInvitedAt = (value: string | null | undefined) => {
        if (!value) return null;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;

        return new Intl.DateTimeFormat("en-SG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const toggleToolbarMenu = () => {
        updateToolbarMenuPosition();
        setToolbarMenuOpen((value) => !value);
        setRowMenuOpenId(null);
    };

    const toggleRowMenu = (rowId: string) => {
        if (rowMenuOpenId === rowId) {
            setRowMenuOpenId(null);
            return;
        }

        updateRowMenuPosition(rowId);
        setRowMenuOpenId(rowId);
        setToolbarMenuOpen(false);
    };

    useEffect(() => {
        if (!toolbarMenuOpen && !rowMenuOpenId) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            const activeRowTrigger = rowMenuOpenId ? rowActionTriggerRefs.current[rowMenuOpenId] : null;

            if (
                toolbarMenuTriggerRef.current?.contains(target) ||
                toolbarMenuRef.current?.contains(target) ||
                activeRowTrigger?.contains(target) ||
                rowMenuRef.current?.contains(target)
            ) {
                return;
            }

            setToolbarMenuOpen(false);
            setRowMenuOpenId(null);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setToolbarMenuOpen(false);
                setRowMenuOpenId(null);
            }
        };

        const handleReposition = () => {
            if (toolbarMenuOpen) updateToolbarMenuPosition();
            if (rowMenuOpenId) updateRowMenuPosition(rowMenuOpenId);
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
    }, [toolbarMenuOpen, rowMenuOpenId]);

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
            <input
                className="mt-5 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                value={filter}
                onChange={(event) => onFilterChange(event.target.value)}
                placeholder="Filter invite groups"
            />
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
                <table className="w-full min-w-210 text-left text-sm">
                    <thead className="border-b border-taupe/15 text-taupe">
                        <tr>
                            <th className="py-3 pr-4">Group</th>
                            <th className="py-3 pr-4">Password</th>
                            <th className="py-3 pr-4">Church ({filteredChurchInvitedCount})</th>
                            <th className="py-3 pr-4">Dinner ({filteredDinnerInvitedCount})</th>
                            <th className="py-3 pr-4">Invite</th>
                            <th className="py-3 pr-4">RSVP</th>
                            <th className="py-3 pr-4">Check in</th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-taupe/10">
                        {loading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                  <tr key={index}>
                                      {Array.from({ length: 8 }).map((__, cellIndex) => (
                                          <td
                                              key={cellIndex}
                                              className="py-3 pr-4"
                                          >
                                              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-taupe/15" />
                                              {cellIndex === 2 || cellIndex === 3 ? (
                                                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-taupe/15" />
                                              ) : null}
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : null}
                        {!loading && rows.length === 0 ? (
                            <tr>
                                <td
                                    className="py-8 text-center text-taupe"
                                    colSpan={8}
                                >
                                    No invite groups found.
                                </td>
                            </tr>
                        ) : null}
                        {!loading
                            ? rows.map((row) => (
                                  <tr key={row.id}>
                                      <td className="py-3 pr-4 font-medium">{row.groupName}</td>
                                      <td className="py-3 pr-4 font-mono text-xs text-taupe">{row.invitePassword}</td>
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
                                      <td className="py-3 pr-4">
                                          {row.invitedAt ? (
                                              <span>
                                                  Invited
                                                  <span className="mt-1 block text-xs text-taupe">
                                                      {formatInvitedAt(row.invitedAt)}
                                                  </span>
                                              </span>
                                          ) : (
                                              <button
                                                  className="cursor-pointer text-left text-taupe underline decoration-taupe/40 underline-offset-4 transition hover:text-ink"
                                                  type="button"
                                                  onClick={() => onInviteMessage(row)}
                                              >
                                                  Not invited
                                              </button>
                                          )}
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
                                              {!row.rsvp ? (
                                                  <span className="text-sm text-taupe">Awaiting RSVP</span>
                                              ) : null}
                                          </div>
                                      </td>
                                      <td className="py-3">
                                          <div className="flex justify-end">
                                              <button
                                                  ref={(node) => {
                                                      rowActionTriggerRefs.current[row.id] = node;
                                                  }}
                                                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-taupe/20 text-ink transition hover:bg-cream"
                                                  aria-label={`Actions for ${row.groupName}`}
                                                  title="Actions"
                                                  type="button"
                                                  onClick={() => toggleRowMenu(row.id)}
                                              >
                                                  <MoreHorizontal size={16} />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))
                            : null}
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
                                  onExport();
                              }}
                          >
                              <Download size={16} />
                              Download CSV
                          </button>
                      </div>,
                      document.body,
                  )
                : null}

            {rowMenuOpenId && activeRow
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
                                  onInviteMessage(activeRow);
                                  setRowMenuOpenId(null);
                              }}
                          >
                              Invite message
                          </button>
                          <button
                              className="flex w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-ink transition hover:bg-cream"
                              type="button"
                              onClick={() => {
                                  onEditRsvp(activeRow);
                                  setRowMenuOpenId(null);
                              }}
                          >
                              Edit
                          </button>
                          <button
                              className="flex w-full cursor-pointer rounded px-3 py-2 text-left text-sm text-rose transition hover:bg-rose/10"
                              type="button"
                              onClick={() => {
                                  setRowMenuOpenId(null);
                                  onDeleteInvite(activeRow);
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
