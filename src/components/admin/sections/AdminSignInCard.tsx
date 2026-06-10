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
        <section className="max-w-md rounded-lg border border-taupe/15 bg-ivory p-5 shadow-sm">
            <Lock className="mb-4 text-rose" />
            <div className="grid gap-3">
                {demoMode ? (
                    <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-taupe">
                        Supabase is not configured. Use the static admin password from your environment.
                    </p>
                ) : (
                    <input
                        className="rounded-md border border-taupe/20 bg-white px-3 py-2"
                        value={email}
                        onChange={(event) => onEmailChange(event.target.value)}
                        placeholder="Admin email"
                        type="email"
                    />
                )}
                <input
                    className="rounded-md border border-taupe/20 bg-white px-3 py-2"
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
            {message ? <p className="mt-3 text-sm text-rose">{message}</p> : null}
        </section>
    );
}
