import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams, Link } from "react-router";
import { Check, ChevronRight, Edit3, LoaderCircle } from "lucide-react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { useAuth } from "../components/auth/AuthContext";
import {
  getActiveCheckInEvent,
  getGuestCheckInState,
  submitGuestCheckIn,
} from "../lib/rsvpRepository";
import type { CheckInEventType, GuestCheckInState } from "../types/rsvp";

export function CheckInPage() {
  const [searchParams] = useSearchParams();
  const { session, signIn, signOut } = useAuth();

  const urlPassword = searchParams.get("password") || "";
  const urlEvent = searchParams.get("event");
  const requestedEvent: CheckInEventType | undefined =
    urlEvent === "dinner" || urlEvent === "ceremony" ? urlEvent : undefined;

  const [passwordInput, setPasswordInput] = useState(urlPassword);
  const [loading, setLoading] = useState(Boolean(urlPassword || session?.inviteGroupId));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [checkInState, setCheckInState] = useState<GuestCheckInState | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Load check-in details for an authenticated group or password
  const fetchAndApplyState = useCallback(
    async (credentials: { inviteGroupId?: string; invitePassword?: string; event?: CheckInEventType }) => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const activeEvent = credentials.event ?? (await getActiveCheckInEvent());
        const state = await getGuestCheckInState({
          inviteGroupId: credentials.inviteGroupId,
          invitePassword: credentials.invitePassword,
          eventType: activeEvent,
        });

        setCheckInState(state);
        setSelectedNames(state.checkedInNames);
        setHasConfirmed(state.checkedInNames.length > 0);
        setIsEditing(state.checkedInNames.length === 0);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load check-in details.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initialize from existing session or url parameter
  useEffect(() => {
    let active = true;

    if (!urlPassword && !session?.inviteGroupId) {
      return;
    }

    const credentials = urlPassword
      ? { invitePassword: urlPassword, event: requestedEvent }
      : { inviteGroupId: session?.inviteGroupId || undefined, event: requestedEvent };

    void (async () => {
      try {
        const activeEvent = credentials.event ?? (await getActiveCheckInEvent());
        const state = await getGuestCheckInState({
          inviteGroupId: credentials.inviteGroupId,
          invitePassword: credentials.invitePassword,
          eventType: activeEvent,
        });

        if (!active) return;
        setCheckInState(state);
        setSelectedNames(state.checkedInNames);
        setHasConfirmed(state.checkedInNames.length > 0);
        setIsEditing(state.checkedInNames.length === 0);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load check-in details.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [session?.inviteGroupId, urlPassword, requestedEvent]);

  // Handle password submission
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter your invitation password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Attempt sign in to store session
      await signIn(trimmed).catch(() => {
        // Continue even if general login fails as long as guest check-in resolves
      });

      await fetchAndApplyState({ invitePassword: trimmed, event: requestedEvent });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Invalid invitation password.");
      setLoading(false);
    }
  };

  // Toggle single attendee selection
  const handleToggleAttendee = (name: string) => {
    setSelectedNames((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };

  // Select all or clear
  const handleSelectAll = () => {
    if (!checkInState) return;
    const allNames = checkInState.attendees.map((a) => a.name);
    setSelectedNames(allNames);
  };

  const handleClearAll = () => {
    setSelectedNames([]);
  };

  // Switch event (e.g. Ceremony <-> Dinner) if eligible
  const handleSwitchEvent = async (event: CheckInEventType) => {
    if (!checkInState || checkInState.eventType === event) return;
    await fetchAndApplyState({
      inviteGroupId: checkInState.inviteGroup.id,
      event,
    });
  };

  // Submit check-in updates
  const handleConfirmCheckIn = async () => {
    if (!checkInState || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await submitGuestCheckIn({
        inviteGroupId: checkInState.inviteGroup.id,
        eventType: checkInState.eventType,
        checkedInNames: selectedNames,
      });

      setCheckInState((current) =>
        current
          ? {
              ...current,
              checkedInNames: selectedNames,
              attendees: current.attendees.map((attendee) => ({
                ...attendee,
                checkedIn: selectedNames.includes(attendee.name),
              })),
            }
          : null
      );

      setHasConfirmed(true);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset to check in another group
  const handleSignOutOtherGroup = () => {
    signOut();
    setCheckInState(null);
    setSelectedNames([]);
    setHasConfirmed(false);
    setIsEditing(false);
    setPasswordInput("");
    setErrorMessage(null);
  };

  const isEligibleForBothEvents = useMemo(() => {
    if (!checkInState) return false;
    const { ceremonyAllowedCount, dinnerAllowedCount, dinnerGuestNames } = checkInState.inviteGroup;
    return ceremonyAllowedCount > 0 && (dinnerAllowedCount > 0 || dinnerGuestNames.length > 0);
  }, [checkInState]);

  return (
    <Layout showHeader={false}>
      <main className="section-shell flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-lg">
          {/* Phase 1: Password Gate */}
          {!checkInState ? (
            <div className="relative rounded-xs border border-taupe/20 bg-ivory/60 p-8 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10">
              <div className="text-center">
                <span className="font-display text-xs uppercase tracking-[0.24em] text-taupe">
                  Yi Jia &amp; Rachel
                </span>
                <h1 className="mt-2 font-display text-3xl font-medium tracking-wide text-ink sm:text-4xl">
                  Wedding Check-In
                </h1>
                <p className="mt-2 text-base text-ink/80 leading-relaxed">
                  Welcome! Please enter your invitation password to confirm your group&apos;s arrival.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="checkin-password"
                    className="block text-xs font-semibold uppercase tracking-[0.16em] text-taupe"
                  >
                    Invitation Password
                  </label>
                  <input
                    id="checkin-password"
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="e.g. rose-gold-1234"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoFocus
                    className="h-11 w-full rounded-xs border border-taupe/30 bg-white px-4 font-mono text-base tracking-wider text-ink shadow-xs transition placeholder:text-taupe/50 focus:border-ink focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-xs border border-taupe/25 bg-white p-3 text-xs text-ink/90"
                  >
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {loading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <>
                      Check-In
                      <ChevronRight size={16} />
                    </>
                  )}
                </Button>

                <div className="rounded-xs border border-taupe/15 bg-white/60 p-3 text-center text-xs text-taupe">
                  Found on your wedding invitation card or digital message.
                </div>
              </form>
            </div>
          ) : !isEditing && hasConfirmed ? (
            /* Phase 3: Celebratory Confirmation View */
            <div className="relative rounded-xs border border-taupe/20 bg-ivory/60 p-8 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xs bg-sage text-white shadow-xs">
                  <Check size={24} strokeWidth={2.5} />
                </div>

                <span className="mt-4 block font-display text-xs uppercase tracking-[0.24em] text-taupe">
                  {checkInState.eventType === "dinner" ? "Dinner" : "Church"}
                </span>

                <h1 className="mt-1 font-display text-3xl font-medium tracking-wide text-ink sm:text-4xl">
                  You&apos;re Checked In!
                </h1>

                <p className="mt-2 text-base text-ink/80 leading-relaxed">
                  Welcome, <strong className="font-semibold text-ink">{checkInState.inviteGroup.groupName}</strong>. Thank you for celebrating with us today!
                </p>
              </div>

              {/* Checked-In Roster Summary */}
              <div className="mt-6 divide-y divide-taupe/15 rounded-xs border border-taupe/20 bg-white">
                <div className="bg-cream/40 px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-taupe">
                    Arrived Attendees ({selectedNames.length} of {checkInState.attendees.length})
                  </span>
                </div>

                {checkInState.attendees.map((attendee) => {
                  const isArrived = selectedNames.includes(attendee.name);
                  return (
                    <div
                      key={attendee.name}
                      className="flex items-center justify-between px-4 py-3 text-base"
                    >
                      <span className={isArrived ? "font-medium text-ink" : "text-taupe/70 line-through"}>
                        {attendee.name}
                      </span>
                      {isArrived ? (
                        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-sage">
                          <Check size={16} strokeWidth={2.5} />
                          Arrived
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.16em] text-taupe/60">
                          Not arrived
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={16} />
                  Edit Check-In
                </Button>

                {isEligibleForBothEvents && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]"
                    onClick={() =>
                      void handleSwitchEvent(
                        checkInState.eventType === "ceremony" ? "dinner" : "ceremony"
                      )
                    }
                  >
                    Switch to {checkInState.eventType === "ceremony" ? "Dinner" : "Church"}
                  </Button>
                )}

                <div className="flex items-center justify-between border-t border-taupe/15 pt-4 text-xs">
                  <button
                    type="button"
                    onClick={handleSignOutOtherGroup}
                    className="cursor-pointer text-taupe transition hover:text-ink hover:underline"
                  >
                    Check in another group
                  </button>

                  <Link
                    to="/"
                    className="cursor-pointer text-taupe transition hover:text-ink hover:underline"
                  >
                    View wedding details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Phase 2: Attendee Selection / Editing View */
            <div className="relative rounded-xs border border-taupe/20 bg-ivory/60 p-8 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display text-xs uppercase tracking-[0.24em] text-taupe">
                    {checkInState.eventType === "dinner" ? "Dinner" : "Church"} Check-In
                  </span>
                  <h1 className="mt-1 font-display text-2xl font-medium tracking-wide text-ink sm:text-3xl">
                    {checkInState.inviteGroup.groupName}
                  </h1>
                </div>

                {isEligibleForBothEvents && (
                  <div className="flex rounded-xs border border-taupe/20 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => void handleSwitchEvent("ceremony")}
                      className={`rounded-xs px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        checkInState.eventType === "ceremony"
                          ? "bg-sage text-white"
                          : "text-taupe hover:text-ink"
                      }`}
                    >
                      Church
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSwitchEvent("dinner")}
                      className={`rounded-xs px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        checkInState.eventType === "dinner"
                          ? "bg-sage text-white"
                          : "text-taupe hover:text-ink"
                      }`}
                    >
                      Dinner
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-base text-ink/80 leading-relaxed">
                Please check the box for everyone in your party who has arrived:
              </p>

              {/* Selection helpers */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-taupe uppercase tracking-[0.16em]">
                  {selectedNames.length} of {checkInState.attendees.length} selected
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="cursor-pointer text-ink/80 underline decoration-taupe/40 underline-offset-4 hover:text-ink"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="cursor-pointer text-taupe underline decoration-taupe/40 underline-offset-4 hover:text-ink"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {/* Attendees Checkbox List */}
              <div className="mt-3 space-y-2">
                {checkInState.attendees.map((attendee) => {
                  const isChecked = selectedNames.includes(attendee.name);
                  return (
                    <button
                      key={attendee.name}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleToggleAttendee(attendee.name)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xs border p-4 text-left transition ${
                        isChecked
                          ? "border-sage/60 bg-white shadow-xs"
                          : "border-taupe/20 bg-white/70 hover:border-taupe/40 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-xs border transition ${
                            isChecked
                              ? "border-sage bg-sage text-white shadow-xs"
                              : "border-taupe/40 bg-white"
                          }`}
                        >
                          {isChecked ? <Check size={16} strokeWidth={2.5} /> : null}
                        </span>
                        <span className="text-base font-medium text-ink">
                          {attendee.name}
                        </span>
                      </div>

                      {isChecked && (
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sage">
                          Arrived
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-xs border border-taupe/25 bg-white p-3 text-xs text-ink/90"
                >
                  {errorMessage}
                </div>
              )}

              {/* Confirmation Actions */}
              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={submitting}
                  onClick={() => void handleConfirmCheckIn()}
                  className="flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  {submitting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <>
                      Confirm Check-In ({selectedNames.length})
                      <Check size={16} />
                    </>
                  )}
                </Button>

                {hasConfirmed && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    className="flex min-h-11 w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.16em]"
                  >
                    Cancel Editing
                  </Button>
                )}

                <div className="pt-2 text-center text-xs text-taupe">
                  <button
                    type="button"
                    onClick={handleSignOutOtherGroup}
                    className="cursor-pointer text-taupe transition hover:text-ink hover:underline"
                  >
                    Check in another group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
