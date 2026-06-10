import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../Button";
import { getGuestPasswords, updateGuestPasswords } from "../../../lib/rsvpRepository";

export function AdminPasswordSettings() {
    const [lunchPassword, setLunchPassword] = useState("");
    const [fullPassword, setFullPassword] = useState("");
    const [revealed, setRevealed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const savePasswords = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const passwords = await updateGuestPasswords({ lunchPassword, fullPassword });
            setLunchPassword(passwords.lunchPassword);
            setFullPassword(passwords.fullPassword);
            setMessage("Guest passwords saved.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to save guest passwords.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        let active = true;

        void getGuestPasswords()
            .then((passwords) => {
                if (!active) return;
                setLunchPassword(passwords.lunchPassword);
                setFullPassword(passwords.fullPassword);
            })
            .catch((error) => {
                if (!active) return;
                setMessage(error instanceof Error ? error.message : "Unable to load guest passwords.");
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
            id="settings"
            className="scroll-mt-24 rounded-lg bg-ivory p-5 shadow-sm"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="font-display text-3xl">Guest Access Passwords</h2>
                    <p className="text-sm text-taupe">
                        Manage the lunch-only and full-detail passwords guests use to enter the site.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRevealed((value) => !value)}
                >
                    {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    {revealed ? "Hide" : "Reveal"}
                </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Lunch-only password</span>
                    <input
                        className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                        value={lunchPassword}
                        onChange={(event) => setLunchPassword(event.target.value)}
                        type={revealed ? "text" : "password"}
                        disabled={loading}
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Full-details password</span>
                    <input
                        className="mt-2 w-full rounded-md border border-taupe/20 bg-white px-3 py-2"
                        value={fullPassword}
                        onChange={(event) => setFullPassword(event.target.value)}
                        type={revealed ? "text" : "password"}
                        disabled={loading}
                    />
                </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    onClick={() => void savePasswords()}
                    disabled={loading || saving || !lunchPassword.trim() || !fullPassword.trim()}
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save passwords"}
                </Button>
                {message ? <p className="text-sm text-taupe">{message}</p> : null}
            </div>
        </section>
    );
}
