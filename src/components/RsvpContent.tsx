import { LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { RsvpDetail } from "./RsvpDetail";
import { RsvpForm } from "./RsvpForm";
import { getInviteWithRsvp, searchInviteGroups, submitGuestRsvp } from "../lib/rsvpRepository";
import { filterInviteForRole, filterInviteWithRsvpForRole } from "../lib/access";
import { validateRsvpDraft } from "../lib/rsvpValidation";
import { isDemoMode } from "../lib/supabase";
import { useAuth } from "./auth/AuthContext";
import type { InviteGroup, InviteWithRsvp, RsvpDraft } from "../types/rsvp";

export function RsvpContent({ compact = false }: { compact?: boolean }) {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InviteGroup[]>([]);
  const [selected, setSelected] = useState<InviteWithRsvp | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const searchRequestId = useRef(0);
  const searchTimeoutId = useRef<number | null>(null);

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
    try {
      setSelected(filterInviteWithRsvpForRole(await getInviteWithRsvp(inviteGroupId), role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load RSVP details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (draft: RsvpDraft) => {
    if (!selected) return;
    const validation = validateRsvpDraft(selected.inviteGroup, draft);
    if (!validation.valid) {
      setMessage(validation.errors.join(" "));
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await submitGuestRsvp(draft);
      setSelected({ inviteGroup: selected.inviteGroup, rsvp: response });
      setMessage("RSVP submitted. Your details are now view-only. Please contact us for changes.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={compact ? "" : "section-shell max-w-4xl"}>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-rose">RSVP</p>
        <h1 className="mt-2 font-display text-5xl">Find Your Invite</h1>
        <p className="mt-4 max-w-2xl text-taupe">
          Start typing your group or guest name, then select the matching invite. Church ceremony and dinner RSVP are
          separate in the form.
        </p>
        {isDemoMode() ? (
          <p className="mt-3 rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
            Demo mode is active. Try searching for “Tan”, “Lee”, or “Ong”.
          </p>
        ) : null}
      </div>

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
            <LoaderCircle className="absolute right-3 top-3.5 animate-spin text-taupe" size={18} aria-hidden="true" />
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
                  <span>Church invited: {invite.guestNames.length || invite.ceremonyAllowedCount}</span>
                  {invite.dinnerGuestNames.length || invite.dinnerAllowedCount ? (
                    <span>Dinner invited: {invite.dinnerGuestNames.length || invite.dinnerAllowedCount}</span>
                  ) : null}
                  {invite.hasSubmitted ? <span>RSVP submitted</span> : null}
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

      <div className="mt-8">
        {selected?.rsvp ? (
          <RsvpDetail inviteGroup={selected.inviteGroup} rsvp={selected.rsvp} />
        ) : selected ? (
          <RsvpForm inviteGroup={selected.inviteGroup} onSubmit={handleSubmit} submitting={submitting} />
        ) : null}
      </div>
    </div>
  );
}
