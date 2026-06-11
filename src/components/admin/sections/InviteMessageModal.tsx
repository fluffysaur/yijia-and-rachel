import { Check, Clipboard, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
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
    const [copied, setCopied] = useState(false);
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

    useEffect(() => {
        if (!copied) return;

        const timeoutId = window.setTimeout(() => {
            setCopied(false);
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    const invitedAt = formatInvitedAt(row?.invitedAt);
    const closeModal = () => {
        setCopyMessage(null);
        setCopied(false);
        onClose();
    };

    const copyToClipboard = async () => {
        if (!row) return;

        try {
            await navigator.clipboard.writeText(messageTextRef.current?.value ?? generatedMessage);
            setCopyMessage(null);
            setCopied(true);
        } catch {
            setCopied(false);
            setCopyMessage("Unable to copy automatically. Select and copy the message manually.");
        }
    };

    const runStatusUpdate = async (action: () => Promise<void>) => {
        if (!row) return;

        setSaving(true);
        setCopyMessage(null);
        setCopied(false);
        try {
            await action();
        } finally {
            setSaving(false);
        }
    };

    return (
        <FadeModal
            open={open && Boolean(row)}
            title="Invite Message"
            onClose={closeModal}
            closeDisabled={saving}
        >
            {row ? (
                <>
                    <p className="text-small text-taupe">
                        {row.groupName} · {invitedAt ? `Invited ${invitedAt}` : "Not invited"}
                    </p>
                {templates ? (
                    <textarea
                        key={generatedMessage}
                        ref={messageTextRef}
                        className="mt-5 min-h-96 w-full rounded-md border border-taupe/20 bg-white px-3 py-2 text-small leading-6"
                        defaultValue={generatedMessage}
                        onChange={() => {
                            setCopyMessage(null);
                            setCopied(false);
                        }}
                    />
                ) : (
                    <div className="mt-5 flex min-h-96 items-center justify-center rounded-md border border-taupe/20 bg-white px-3 py-2 text-small text-taupe">
                        Loading invite message...
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                        type="button"
                        onClick={() => void copyToClipboard()}
                        disabled={!templates}
                        className="min-w-40"
                    >
                        {copied ? <Check size={16} /> : <Clipboard size={16} />}
                        {copied ? "Copied!" : "Copy message"}
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
                    {copyMessage ? <p className="text-small text-taupe">{copyMessage}</p> : null}
                </div>
                </>
            ) : null}
        </FadeModal>
    );
}
