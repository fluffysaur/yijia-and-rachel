import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { CheckInPage } from "./CheckInPage";
import { AuthProvider } from "../components/auth/AuthContext";
import { RsvpModalProvider } from "../components/RsvpModal";
import {
  createAdminInviteGroup,
  setActiveCheckInEvent,
} from "../lib/rsvpRepository";

function renderCheckInPage(initialEntries = ["/check-in"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <RsvpModalProvider>
          <Routes>
            <Route path="/check-in" element={<CheckInPage />} />
          </Routes>
        </RsvpModalProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("CheckInPage Component", () => {
  beforeEach(async () => {
    localStorage.clear();
    await setActiveCheckInEvent("ceremony");
  });

  it("renders password gate initially when not authenticated and hides navbar header", () => {
    renderCheckInPage();

    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.getByRole("heading", { name: /wedding check-in/i })).toBeDefined();
    expect(screen.getByLabelText(/invitation password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^check-in$/i })).toBeDefined();
  });

  it("shows error for non-existent password", async () => {
    renderCheckInPage();

    const input = screen.getByLabelText(/invitation password/i);
    const submitBtn = screen.getByRole("button", { name: /^check-in$/i });

    fireEvent.change(input, { target: { value: "invalid-password-xyz" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });
  });

  it("authenticates with valid invite password and allows attendee check-in and edit flow", async () => {
    await createAdminInviteGroup({
      groupName: "The Wang Family",
      invitePassword: "wang-pass-999",
      guestNames: ["David Wang", "Elena Wang"],
      dinnerGuestNames: ["David Wang", "Elena Wang"],
      ceremonyAllowedCount: 2,
      dinnerAllowedCount: 2,
      notes: "",
    });

    renderCheckInPage();

    const input = screen.getByLabelText(/invitation password/i);
    const submitBtn = screen.getByRole("button", { name: /^check-in$/i });

    fireEvent.change(input, { target: { value: "wang-pass-999" } });
    fireEvent.click(submitBtn);

    // Wait for roster phase
    await waitFor(() => {
      expect(screen.getByText("The Wang Family")).toBeDefined();
    });

    const davidCheckbox = screen.getByRole("checkbox", { name: /David Wang/i });
    const elenaCheckbox = screen.getByRole("checkbox", { name: /Elena Wang/i });

    expect(davidCheckbox).toBeDefined();
    expect(elenaCheckbox).toBeDefined();

    // Check in David only
    fireEvent.click(davidCheckbox);

    const confirmBtn = screen.getByRole("button", { name: /confirm check-in/i });
    fireEvent.click(confirmBtn);

    // Wait for confirmation phase
    await waitFor(() => {
      expect(screen.getByText(/you're checked in!/i)).toBeDefined();
      expect(screen.getByText(/Arrived Attendees \(1 of 2\)/i)).toBeDefined();
    });

    // Test Edit flow
    const editBtn = screen.getByRole("button", { name: /edit check-in/i });
    fireEvent.click(editBtn);

    // Back in edit mode: check in Elena too
    await waitFor(() => {
      expect(screen.getByRole("checkbox", { name: /Elena Wang/i })).toBeDefined();
    });

    const elenaCheckboxEdit = screen.getByRole("checkbox", { name: /Elena Wang/i });
    fireEvent.click(elenaCheckboxEdit);

    const confirmBtnEdit = screen.getByRole("button", { name: /confirm check-in/i });
    fireEvent.click(confirmBtnEdit);

    await waitFor(() => {
      expect(screen.getByText(/you're checked in!/i)).toBeDefined();
      expect(screen.getByText(/Arrived Attendees \(2 of 2\)/i)).toBeDefined();
    });

    // Test Check in another group (sign out)
    const switchGroupBtn = screen.getByRole("button", { name: /check in another group/i });
    fireEvent.click(switchGroupBtn);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /wedding check-in/i })).toBeDefined();
    });
  });
});
