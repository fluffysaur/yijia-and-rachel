import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RsvpDetail } from "./RsvpDetail";
import { RsvpForm } from "./RsvpForm";
import { getInviteWithRsvp, getRsvpSettings, searchInviteGroups, submitGuestRsvp } from "../lib/rsvpRepository";
import { filterInviteForRole, filterInviteWithRsvpForRole } from "../lib/access";
import { validateRsvpDraft } from "../lib/rsvpValidation";
import { isDemoMode } from "../lib/supabase";
import { useAuth } from "./auth/AuthContext";
import type { InviteGroup, InviteWithRsvp, RsvpDraft } from "../types/rsvp";

export function RsvpContent({ compact = false }: { compact?: boolean }) {
    const { role, session } = useAuth();
    const directInviteGroupId = session?.inviteGroupId ?? null;
    const isDirectInviteSession = Boolean(directInviteGroupId);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<InviteGroup[]>([]);
    const [selected, setSelected] = useState<InviteWithRsvp | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [rsvpDeadline, setRsvpDeadline] = useState<string | null>(null);
    const [editingRsvp, setEditingRsvp] = useState(false);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const searchRequestId = useRef(0);
    const searchTimeoutId = useRef<number | null>(null);
    const selectedSectionRef = useRef<HTMLDivElement | null>(null);
    const shouldScrollToSelectedRef = useRef(false);

    useEffect(() => {
        let active = true;

        void getRsvpSettings()
            .then((settings) => {
                if (active) {
                    setRsvpDeadline(settings.rsvpDeadline);
                }
            })
            .catch((error) => {
                if (active) {
                    setMessage(error instanceof Error ? error.message : "Unable to load RSVP deadline.");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const deadlineTime = rsvpDeadline ? new Date(rsvpDeadline).getTime() : Number.NaN;
        if (Number.isNaN(deadlineTime)) {
            return;
        }

        const timeoutMs = deadlineTime - Date.now();
        if (timeoutMs <= 0) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setNowMs(Date.now());
        }, timeoutMs);

        return () => window.clearTimeout(timeoutId);
    }, [rsvpDeadline]);

    useEffect(() => {
        if (!compact || !selected || !shouldScrollToSelectedRef.current) {
            return;
        }

        shouldScrollToSelectedRef.current = false;
        window.requestAnimationFrame(() => {
            selectedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [compact, selected]);

    useEffect(() => {
        if (!directInviteGroupId) {
            return;
        }

        let active = true;
        void Promise.resolve()
            .then(async () => {
                if (active) {
                    setLoading(true);
                    setMessage(null);
                    setEditingRsvp(false);
                }
                return getInviteWithRsvp(directInviteGroupId);
            })
            .then((result) => {
                if (active) {
                    setSelected(filterInviteWithRsvpForRole(result, role));
                }
            })
            .catch((error) => {
                if (active) {
                    setMessage(error instanceof Error ? error.message : "Unable to load RSVP details.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [directInviteGroupId, role]);

    const queueAutocomplete = (value: string) => {
        const normalizedQuery = value.trim();

        if (searchTimeoutId.current) {
            window.clearTimeout(searchTimeoutId.current);
        }

        if (normalizedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const requestId = searchRequestId.current + 1;
        searchRequestId.current = requestId;
        setLoading(true);
        setMessage(null);

        searchTimeoutId.current = window.setTimeout(() => {
            void searchInviteGroups(normalizedQuery)
                .then((matches) => {
                    if (searchRequestId.current === requestId) {
                        setResults(matches.map((invite) => filterInviteForRole(invite, role)));
                    }
                })
                .catch((error) => {
                    if (searchRequestId.current === requestId) {
                        setMessage(error instanceof Error ? error.message : "Unable to search invites.");
                    }
                })
                .finally(() => {
                    if (searchRequestId.current === requestId) {
                        setLoading(false);
                    }
                });
        }, 220);
    };

    const selectInvite = async (inviteGroupId: string) => {
        setLoading(true);
        setMessage(null);
        setEditingRsvp(false);
        try {
            shouldScrollToSelectedRef.current = true;
            setSelected(filterInviteWithRsvpForRole(await getInviteWithRsvp(inviteGroupId), role));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to load RSVP details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (draft: RsvpDraft) => {
        if (!selected) return;
        if (!isRsvpOpen) {
            setMessage("The RSVP deadline has passed. Please contact us for changes.");
            return;
        }

        const validation = validateRsvpDraft(selected.inviteGroup, draft);
        if (!validation.valid) {
            setMessage(validation.errors.join(" "));
            return;
        }

        setSubmitting(true);
        setMessage(null);
        try {
            const wasEditing = Boolean(selected.rsvp);
            const response = await submitGuestRsvp(draft);
            setSelected({ inviteGroup: selected.inviteGroup, rsvp: response });
            setEditingRsvp(false);
            setMessage(wasEditing ? "RSVP updated." : "RSVPed.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to submit RSVP.");
        } finally {
            setSubmitting(false);
        }
    };

    const deadlineDate = rsvpDeadline ? new Date(rsvpDeadline) : null;
    const isRsvpOpen = !deadlineDate || Number.isNaN(deadlineDate.getTime()) || nowMs < deadlineDate.getTime();
    const deadlineLabel = deadlineDate && !Number.isNaN(deadlineDate.getTime())
        ? deadlineDate.toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;
    const isSelectedInviteSession = Boolean(directInviteGroupId && selected?.inviteGroup.id === directInviteGroupId);
    const canEditSelectedRsvp = Boolean(selected?.rsvp && isRsvpOpen && isSelectedInviteSession);
    const lockedMessage = !isRsvpOpen
        ? "The RSVP deadline has passed. Please contact us for changes."
        : isSelectedInviteSession
            ? deadlineLabel
                ? `You can edit this RSVP until ${deadlineLabel}.`
                : "You can edit this RSVP until the RSVP deadline is set."
            : "This RSVP is view-only from shared guest access. Sign in with your invite password to edit.";

    return (
        <div className={compact ? "" : "section-shell max-w-4xl"}>
            <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.22em] text-rose">RSVP</p>
                <h1 className="mt-2 font-display text-5xl">
                    {isDirectInviteSession ? "Your Invite" : "Find Your Invite"}
                </h1>
                {!isDirectInviteSession ? (
                    <p className="mt-4 max-w-2xl text-taupe">
                        Start typing your group or guest name, then select the matching invite. Church ceremony and
                        dinner RSVP are separate in the form.
                    </p>
                ) : null}
                {!isDirectInviteSession && isDemoMode() ? (
                    <p className="mt-3 rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
                        Demo mode is active. Try searching for “Tan”, “Lee”, or “Ong”.
                    </p>
                ) : null}
            </div>

            {!isDirectInviteSession ? (
            <div className="rounded-lg border border-taupe/15 bg-white p-5 shadow-sm">
                <div className="relative">
                    <label>
                        <span className="sr-only">Invite name</span>
                        <input
                            className="w-full rounded-md border border-taupe/20 bg-white px-3 py-3 pr-11"
                            value={query}
                            onChange={(event) => {
                                const nextQuery = event.target.value;
                                setQuery(nextQuery);
                                setSelected(null);
                                queueAutocomplete(nextQuery);
                            }}
                            placeholder="Type a group or guest name"
                            autoComplete="off"
                        />
                    </label>
                    {loading ? (
                        <LoaderCircle
                            className="absolute right-3 top-3 animate-spin text-taupe"
                            size={24}
                            aria-hidden="true"
                        />
                    ) : null}
                </div>

                {query.trim().length >= 2 && results.length ? (
                    <div className="mt-5 grid gap-3">
                        {results.map((invite) => (
                            <button
                                key={invite.id}
                                className="cursor-pointer rounded-md border border-taupe/15 bg-white p-4 text-left transition hover:border-rose/40 hover:bg-cream/35"
                                onClick={() => void selectInvite(invite.id)}
                            >
                                <span className="block font-medium">{invite.groupName}</span>
                                <span className="mt-1 block text-sm text-taupe">{invite.guestNames.join(", ")}</span>
                                <span className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-taupe">
                                    {invite.hasSubmitted ? <span>RSVPed</span> : null}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {query.trim().length >= 2 && !loading && !results.length ? (
                    <p className="mt-4 rounded-md bg-cream/60 p-3 text-sm text-taupe">No matching invite found yet.</p>
                ) : null}

                {message ? <p className="mt-4 rounded-md bg-rose/10 p-3 text-sm text-rose">{message}</p> : null}
            </div>
            ) : message ? (
                <p className="rounded-md bg-rose/10 p-3 text-sm text-rose">{message}</p>
            ) : loading ? (
                <div className="flex items-center gap-2 rounded-lg border border-taupe/15 bg-white p-5 text-sm text-taupe shadow-sm">
                    <LoaderCircle
                        className="animate-spin"
                        size={20}
                        aria-hidden="true"
                    />
                    Loading your invite...
                </div>
            ) : null}

            <div
                ref={selectedSectionRef}
                className="mt-8 scroll-mt-6"
            >
                {selected?.rsvp ? (
                    editingRsvp && canEditSelectedRsvp ? (
                        <RsvpForm
                            key={`${selected.inviteGroup.id}:${selected.rsvp.updatedAt}`}
                            inviteGroup={selected.inviteGroup}
                            initialRsvp={selected.rsvp}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                            submitLabel="Save RSVP"
                        />
                    ) : (
                        <RsvpDetail
                            inviteGroup={selected.inviteGroup}
                            rsvp={selected.rsvp}
                            canEdit={canEditSelectedRsvp}
                            lockedMessage={lockedMessage}
                            onEdit={() => setEditingRsvp(true)}
                        />
                    )
                ) : selected ? (
                    isRsvpOpen ? (
                        <RsvpForm
                            key={selected.inviteGroup.id}
                            inviteGroup={selected.inviteGroup}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                        />
                    ) : (
                        <section className="rounded-lg border border-rose/30 bg-rose/10 p-5 text-sm text-rose">
                            The RSVP deadline has passed. Please contact us for changes.
                        </section>
                    )
                ) : null}
            </div>
        </div>
    );
}
