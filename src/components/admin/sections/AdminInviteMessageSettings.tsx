import { MessageSquareText, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../Button";
import { FadeModal } from "../../FadeModal";
import { getInviteMessageTemplates, updateInviteMessageTemplates } from "../../../lib/rsvpRepository";
import { defaultInviteMessageTemplates } from "../../../lib/inviteMessage";
import type { InviteMessageTemplates } from "../../../types/rsvp";

const placeholders = "{groupName}, {saveTheDateUrl}, {weddingDate}, {password}, {siteUrl}, {rsvpDeadline}, {lunchDetails}, {dinnerDetails}, {eventDetails}";

type TemplateTab = "saveTheDate" | "lunch" | "dinner";

const activeTabLabels: Record<TemplateTab, string> = {
    saveTheDate: "Save-the-date",
    lunch: "Lunch-only",
    dinner: "Lunch and dinner",
};

export function AdminInviteMessageSettings() {
    const [templates, setTemplates] = useState<InviteMessageTemplates>(defaultInviteMessageTemplates);
    const [activeTab, setActiveTab] = useState<TemplateTab>("saveTheDate");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [resetModalOpen, setResetModalOpen] = useState(false);

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

    const handleReset = async () => {
        setSaving(true);
        setMessage(null);
        try {
            let updatedTemplates: InviteMessageTemplates;
            if (activeTab === "saveTheDate") {
                updatedTemplates = {
                    ...templates,
                    saveTheDateTemplate: defaultInviteMessageTemplates.saveTheDateTemplate,
                    saveTheDateUrl: defaultInviteMessageTemplates.saveTheDateUrl,
                };
            } else if (activeTab === "lunch") {
                updatedTemplates = {
                    ...templates,
                    lunchTemplate: defaultInviteMessageTemplates.lunchTemplate,
                };
            } else {
                updatedTemplates = {
                    ...templates,
                    dinnerTemplate: defaultInviteMessageTemplates.dinnerTemplate,
                };
            }

            const saved = await updateInviteMessageTemplates(updatedTemplates);
            setTemplates(saved);
            setMessage(`${activeTabLabels[activeTab]} template reset to default.`);
            setResetModalOpen(false);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to reset template.");
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
            className="scroll-mt-24 rounded-xs border border-taupe/15 bg-white/95 p-6 shadow-xs"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="font-display text-3xl text-ink">Invite Message Templates</h2>
                    <p className="mt-1 text-base text-ink/80 leading-relaxed">Edit the templates used when copying RSVP & Save-the-Date invite messages.</p>
                </div>
                <MessageSquareText
                    className="hidden text-sage md:block"
                    size={28}
                    aria-hidden="true"
                />
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-taupe font-medium">Placeholders: {placeholders}</p>

            <div className="mt-5">
                <div className="flex flex-wrap gap-1 rounded-xs border border-taupe/15 bg-cream/50 p-1 sm:inline-flex">
                    <button
                        type="button"
                        className={`cursor-pointer rounded-xs px-4 py-2 text-sm font-medium transition ${
                            activeTab === "saveTheDate"
                                ? "bg-white text-ink shadow-xs border border-taupe/20"
                                : "text-taupe hover:text-ink"
                        }`}
                        onClick={() => setActiveTab("saveTheDate")}
                    >
                        Save-the-date
                    </button>
                    <button
                        type="button"
                        className={`cursor-pointer rounded-xs px-4 py-2 text-sm font-medium transition ${
                            activeTab === "lunch"
                                ? "bg-white text-ink shadow-xs border border-taupe/20"
                                : "text-taupe hover:text-ink"
                        }`}
                        onClick={() => setActiveTab("lunch")}
                    >
                        Lunch-only
                    </button>
                    <button
                        type="button"
                        className={`cursor-pointer rounded-xs px-4 py-2 text-sm font-medium transition ${
                            activeTab === "dinner"
                                ? "bg-white text-ink shadow-xs border border-taupe/20"
                                : "text-taupe hover:text-ink"
                        }`}
                        onClick={() => setActiveTab("dinner")}
                    >
                        Lunch and dinner
                    </button>
                </div>
            </div>

            <div className="mt-5">
                {activeTab === "saveTheDate" && (
                    <div className="space-y-4">
                        <label className="block max-w-xl">
                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-taupe">Save-the-date website link</span>
                            <p className="mt-1 text-xs text-ink/70">Optional. If left blank, defaults to your main wedding website link.</p>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="mt-1 w-full rounded-xs border border-taupe/20 bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                                value={templates.saveTheDateUrl || ""}
                                onChange={(event) => setTemplates((value) => ({ ...value, saveTheDateUrl: event.target.value }))}
                                disabled={loading}
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-taupe">Save-the-date template</span>
                            <textarea
                                className="mt-2 min-h-80 w-full rounded-xs border border-taupe/20 bg-white px-3 py-2 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                                value={templates.saveTheDateTemplate || defaultInviteMessageTemplates.saveTheDateTemplate}
                                onChange={(event) => setTemplates((value) => ({ ...value, saveTheDateTemplate: event.target.value }))}
                                disabled={loading}
                            />
                        </label>
                    </div>
                )}

                {activeTab === "lunch" && (
                    <label className="block">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-taupe">Lunch-only invite template</span>
                        <textarea
                            className="mt-2 min-h-80 w-full rounded-xs border border-taupe/20 bg-white px-3 py-2 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                            value={templates.lunchTemplate}
                            onChange={(event) => setTemplates((value) => ({ ...value, lunchTemplate: event.target.value }))}
                            disabled={loading}
                        />
                    </label>
                )}

                {activeTab === "dinner" && (
                    <label className="block">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-taupe">Lunch & dinner invite template</span>
                        <textarea
                            className="mt-2 min-h-80 w-full rounded-xs border border-taupe/20 bg-white px-3 py-2 font-mono text-sm text-ink focus:border-ink focus:outline-none"
                            value={templates.dinnerTemplate}
                            onChange={(event) => setTemplates((value) => ({ ...value, dinnerTemplate: event.target.value }))}
                            disabled={loading}
                        />
                    </label>
                )}
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
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setResetModalOpen(true)}
                    disabled={loading || saving}
                >
                    <RotateCcw size={16} />
                    Reset to default
                </Button>
                {message ? <p className="text-base text-ink/80">{message}</p> : null}
            </div>

            <FadeModal
                open={resetModalOpen}
                title={`Reset ${activeTabLabels[activeTab]} Template`}
                onClose={() => setResetModalOpen(false)}
                closeDisabled={saving}
            >
                <p className="text-base text-ink">
                    Are you sure you want to reset the <span className="font-semibold">{activeTabLabels[activeTab]}</span> template to its default value?
                </p>
                <p className="mt-2 text-base text-ink/80">
                    Any customized text or link for this template will be replaced with the original default.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setResetModalOpen(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <button
                        className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xs bg-rose px-6 py-2 text-control font-medium uppercase tracking-[0.14em] text-white shadow-xs transition hover:bg-rose/85 disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={() => void handleReset()}
                        disabled={saving}
                    >
                        {saving ? "Resetting..." : `Reset ${activeTabLabels[activeTab]}`}
                    </button>
                </div>
            </FadeModal>
        </section>
    );
}
