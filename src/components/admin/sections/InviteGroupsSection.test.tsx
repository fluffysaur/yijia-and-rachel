import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InviteGroupsSection } from "./InviteGroupsSection";
import type { AdminInviteRow } from "../types";

const mockInvitePassword = ["mock", "test", "invite", "pass"].join("-");

const mockRows: AdminInviteRow[] = [
  {
    id: "invite-1",
    groupName: "Tan Family",
    guestNames: ["Alice Tan", "Bob Tan"],
    dinnerGuestNames: ["Alice Tan", "Bob Tan"],
    ceremonyAllowedCount: 2,
    dinnerAllowedCount: 2,
    notes: "",
    invitedAt: "2026-09-01T00:00:00.000Z",
    invitePassword: mockInvitePassword,
    rsvp: {
      id: "rsvp-1",
      inviteGroupId: "invite-1",
      responderName: "Alice Tan",
      ceremonyAttendingCount: 2,
      dinnerAttendingCount: 2,
      generalNotes: "Looking forward!",
      lockedForGuestEdit: false,
      submittedAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-01T10:00:00.000Z",
      ceremonyAttendees: [
        { attendeeIndex: 0, attendeeLabel: "Alice Tan", dietaryPreference: "No seafood" },
        { attendeeIndex: 1, attendeeLabel: "Bob Tan", dietaryPreference: "" },
      ],
      dinnerAttendees: [
        { attendeeIndex: 0, attendeeLabel: "Alice Tan", mealOption: "Standard (Chinese Banquet)", dietaryPreference: "No seafood" },
        { attendeeIndex: 1, attendeeLabel: "Bob Tan", mealOption: "Vegetarian", dietaryPreference: "" },
      ],
    },
  },
];

describe("InviteGroupsSection", () => {
  it("renders check-in checkboxes, live check-in chip, and no visible Actions header in Church view", () => {
    const handleToggleCheckIn = vi.fn();
    const getCheckedInNames = vi.fn().mockReturnValue(["Alice Tan"]);

    render(
      <InviteGroupsSection
        rows={mockRows}
        filter=""
        onFilterChange={vi.fn()}
        onAddInvite={vi.fn()}
        onImportCsv={vi.fn()}
        onRefresh={vi.fn()}
        loading={false}
        refreshing={false}
        onExport={vi.fn()}
        onToggleCheckIn={handleToggleCheckIn}
        getCheckedInNames={getCheckedInNames}
        onInviteMessage={vi.fn()}
        onEditRsvp={vi.fn()}
        onDeleteInvite={vi.fn()}
      />
    );

    // Switch to Church view
    const churchTab = screen.getByRole("button", { name: /church/i });
    fireEvent.click(churchTab);

    // Check-in header exists
    expect(screen.getByRole("columnheader", { name: /check-in/i })).toBeDefined();

    // Live check-in count chip displays progress
    expect(screen.getByText("1 of 2 checked in")).toBeDefined();

    // Checkbox buttons for attendees (Alice Tan checked, Bob Tan unchecked)
    const aliceCheckbox = screen.getByRole("checkbox", { name: "Check in Alice Tan" });
    const bobCheckbox = screen.getByRole("checkbox", { name: "Check in Bob Tan" });
    expect(aliceCheckbox).toBeDefined();
    expect(bobCheckbox).toBeDefined();
    expect(aliceCheckbox.getAttribute("aria-checked")).toBe("true");
    expect(bobCheckbox.getAttribute("aria-checked")).toBe("false");

    // Toggle Bob Tan check-in
    fireEvent.click(bobCheckbox);
    expect(handleToggleCheckIn).toHaveBeenCalledWith(mockRows[0], "ceremony", "Bob Tan");

    // Actions header has screen reader text only
    const actionsHeader = screen.getByText("Actions");
    expect(actionsHeader.classList.contains("sr-only")).toBe(true);
  });

  it("handles entering and exiting fullscreen mode", () => {
    render(
      <InviteGroupsSection
        rows={mockRows}
        filter=""
        onFilterChange={vi.fn()}
        onAddInvite={vi.fn()}
        onImportCsv={vi.fn()}
        onRefresh={vi.fn()}
        loading={false}
        refreshing={false}
        onExport={vi.fn()}
        onToggleCheckIn={vi.fn()}
        getCheckedInNames={vi.fn().mockReturnValue([])}
        onInviteMessage={vi.fn()}
        onEditRsvp={vi.fn()}
        onDeleteInvite={vi.fn()}
      />
    );

    const fullscreenButton = screen.getByRole("button", { name: /fullscreen table/i });
    expect(fullscreenButton).toBeDefined();

    // Enter fullscreen
    fireEvent.click(fullscreenButton);

    const exitButton = screen.getByRole("button", { name: /exit fullscreen/i });
    expect(exitButton).toBeDefined();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    // Press Escape to exit fullscreen
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: /fullscreen table/i })).toBeDefined();
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
  });
});
