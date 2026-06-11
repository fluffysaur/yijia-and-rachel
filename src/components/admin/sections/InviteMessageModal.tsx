import { Check, Clipboard, RotateCcw, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "../../Button";
import { buildInviteMessage } from "../../../lib/inviteMessage";
import type { AdminInviteRow } from "../types";
import type { InviteMessageTemplates } from "../../../types/rsvp";

function formatInvitedAt(value: string | null | undefined) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

export function InviteMessageModal({
    open,
    row,
    templates,
    rsvpDeadline,
    onClose,
    onMarkInvited,
    onClearInvited,
}: {
    open: boolean;
    row: AdminInviteRow | null;
    templates: InviteMessageTemplates | null;
    rsvpDeadline: string | null;
    onClose: () => void;
    onMarkInvited: (row: AdminInviteRow) => Promise<void>;
    onClearInvited: (row: AdminInviteRow) => Promise<void>;
}) {
    const messageTextRef = useRef<HTMLTextAreaElement | null>(null);
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const generatedMessage = useMemo(() => {
        if (!row || !templates) return "";

        return buildInviteMessage({
            invite: row,
            templates,
            rsvpDeadline,
            siteUrl: window.location.origin,
        });
    }, [row, rsvpDeadline, templates]);

    if (!open || !row) return null;

    const invitedAt = formatInvitedAt(row.invitedAt);
    const closeModal = () => {
        setCopyMessage(null);
        onClose();
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(messageTextRef.current?.value ?? generatedMessage);
            setCopyMessage("Copied.");
        } catch {
            setCopyMessage("Unable to copy automatically. Select and copy the message manually.");
        }
    };

    const runStatusUpdate = async (action: () => Promise<void>) => {
        setSaving(true);
        setCopyMessage(null);
        try {
            await action();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/40 px-4 py-8">
            <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-ivory p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-display text-3xl">Invite Message</h2>
                        <p className="text-sm text-taupe">
                            {row.groupName} · {invitedAt ? `Invited ${invitedAt}` : "Not invited"}
                        </p>
                    </div>
                    <button
                        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-taupe/20 text-ink transition hover:bg-cream"
                        type="button"
                        aria-label="Close invite message"
                        onClick={closeModal}
                    >
                        <X size={16} />
                    </button>
                </div>

                {templates ? (
                    <textarea
                        key={generatedMessage}
                        ref={messageTextRef}
                        className="mt-5 min-h-96 w-full rounded-md border border-taupe/20 bg-white px-3 py-2 text-sm leading-6"
                        defaultValue={generatedMessage}
                        onChange={() => {
                            setCopyMessage(null);
                        }}
                    />
                ) : (
                    <div className="mt-5 flex min-h-96 items-center justify-center rounded-md border border-taupe/20 bg-white px-3 py-2 text-sm text-taupe">
                        Loading invite message...
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                        type="button"
                        onClick={() => void copyToClipboard()}
                        disabled={!templates}
                    >
                        <Clipboard size={16} />
                        Copy message
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            void runStatusUpdate(() => (row.invitedAt ? onClearInvited(row) : onMarkInvited(row)))
                        }
                        disabled={saving || !templates}
                    >
                        {row.invitedAt ? <RotateCcw size={16} /> : <Check size={16} />}
                        {row.invitedAt ? "Clear invited" : "Mark invited"}
                    </Button>
                    {copyMessage ? <p className="text-sm text-taupe">{copyMessage}</p> : null}
                </div>
            </div>
        </div>
    );
}
