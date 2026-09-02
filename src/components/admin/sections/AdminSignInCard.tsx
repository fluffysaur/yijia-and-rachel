import { Lock, LogIn } from "lucide-react";
import { Button } from "../../Button";

export function AdminSignInCard({
    demoMode,
    email,
    password,
    message,
    onEmailChange,
    onPasswordChange,
    onSignIn,
}: {
    demoMode: boolean;
    email: string;
    password: string;
    message: string | null;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSignIn: () => void;
}) {
    return (
        <section className="relative max-w-md rounded-xs border border-taupe/15 bg-white/95 p-6 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10">
            <Lock className="mb-4 text-rose" />
            <div className="grid gap-3">
                {demoMode ? (
                    <p className="rounded-xs border border-gold/20 bg-gold/10 px-3 py-2 text-sm text-taupe">
                        Supabase is not configured. Use the static admin password from your environment.
                    </p>
                ) : (
                    <input
                        className="rounded-xs border border-taupe/20 bg-white px-3 py-2 text-ink focus:border-ink focus:outline-none"
                        value={email}
                        onChange={(event) => onEmailChange(event.target.value)}
                        placeholder="Admin email"
                        type="email"
                    />
                )}
                <input
                    className="rounded-xs border border-taupe/20 bg-white px-3 py-2 text-ink focus:border-ink focus:outline-none"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="Password"
                    type="password"
                />
                <Button onClick={onSignIn}>
                    <LogIn size={16} />
                    Sign in
                </Button>
            </div>
            {message ? <p className="mt-3 text-sm font-medium text-rose">{message}</p> : null}
        </section>
    );
}
