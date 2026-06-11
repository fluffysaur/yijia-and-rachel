import { MessageSquareText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../Button";
import { getInviteMessageTemplates, updateInviteMessageTemplates } from "../../../lib/rsvpRepository";
import { defaultInviteMessageTemplates } from "../../../lib/inviteMessage";
import type { InviteMessageTemplates } from "../../../types/rsvp";

const placeholders = "{groupName}, {password}, {siteUrl}, {rsvpDeadline}, {lunchDetails}, {dinnerDetails}, {eventDetails}";

export function AdminInviteMessageSettings() {
    const [templates, setTemplates] = useState<InviteMessageTemplates>(defaultInviteMessageTemplates);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const saveTemplates = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const saved = await updateInviteMessageTemplates(templates);
            setTemplates(saved);
            setMessage("Invite message templates saved.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save invite message templates.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        let active = true;

        void getInviteMessageTemplates()
            .then((savedTemplates) => {
                if (active) setTemplates(savedTemplates);
            })
            .catch((error) => {
                if (active) setMessage(error instanceof Error ? error.message : "Unable to load invite message templates.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <section
            id="invite-message-settings"
            className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="font-display text-3xl">Invite Message Templates</h2>
                    <p className="text-small text-taupe">Edit the templates used when copying RSVP invite messages.</p>
                </div>
                <MessageSquareText
                    className="hidden text-sage md:block"
                    size={32}
                    aria-hidden="true"
                />
            </div>

            <p className="mt-4 text-small text-taupe">Placeholders: {placeholders}</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="block">
                    <span className="text-label font-medium">Lunch-only invite template</span>
                    <textarea
                        className="mt-2 min-h-72 w-full rounded-md border border-taupe/20 bg-white px-3 py-2 font-mono text-small"
                        value={templates.lunchTemplate}
                        onChange={(event) => setTemplates((value) => ({ ...value, lunchTemplate: event.target.value }))}
                        disabled={loading}
                    />
                </label>
                <label className="block">
                    <span className="text-label font-medium">Dinner invite template</span>
                    <textarea
                        className="mt-2 min-h-72 w-full rounded-md border border-taupe/20 bg-white px-3 py-2 font-mono text-small"
                        value={templates.dinnerTemplate}
                        onChange={(event) => setTemplates((value) => ({ ...value, dinnerTemplate: event.target.value }))}
                        disabled={loading}
                    />
                </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    onClick={() => void saveTemplates()}
                    disabled={loading || saving}
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save templates"}
                </Button>
                {message ? <p className="text-small text-taupe">{message}</p> : null}
            </div>
        </section>
    );
}
