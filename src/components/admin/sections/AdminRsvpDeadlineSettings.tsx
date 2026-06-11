import { CalendarClock, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../Button";
import { getRsvpSettings, updateRsvpSettings } from "../../../lib/rsvpRepository";

function isoToLocalInputValue(value: string | null) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function localInputValueToIso(value: string) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toISOString();
}

export function AdminRsvpDeadlineSettings() {
    const [deadlineValue, setDeadlineValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const saveDeadline = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const settings = await updateRsvpSettings({ rsvpDeadline: localInputValueToIso(deadlineValue) });
            setDeadlineValue(isoToLocalInputValue(settings.rsvpDeadline));
            setMessage(settings.rsvpDeadline ? "RSVP deadline saved." : "RSVP deadline cleared.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save RSVP deadline.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        let active = true;

        void getRsvpSettings()
            .then((settings) => {
                if (!active) return;
                setDeadlineValue(isoToLocalInputValue(settings.rsvpDeadline));
            })
            .catch((error) => {
                if (!active) return;
                setMessage(error instanceof Error ? error.message : "Unable to load RSVP deadline.");
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <section
            id="rsvp-settings"
            className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="font-display text-3xl">RSVP Deadline</h2>
                    <p className="text-sm text-taupe">
                        Guests can submit and edit RSVPs until this date and time.
                    </p>
                </div>
                <CalendarClock
                    className="hidden text-sage md:block"
                    size={28}
                    aria-hidden="true"
                />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <label className="block">
                    <span className="text-sm font-medium">Deadline</span>
                    <input
                        className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                        value={deadlineValue}
                        onChange={(event) => setDeadlineValue(event.target.value)}
                        type="datetime-local"
                        disabled={loading}
                    />
                </label>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDeadlineValue("")}
                    disabled={loading || saving || !deadlineValue}
                >
                    <X size={16} />
                    Clear
                </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    onClick={() => void saveDeadline()}
                    disabled={loading || saving}
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save deadline"}
                </Button>
                {message ? <p className="text-sm text-taupe">{message}</p> : null}
            </div>
        </section>
    );
}
