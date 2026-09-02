import { useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Button } from "../Button";
import { siteContent } from "../../content/wedding";
import { useAuth } from "./AuthContext";

export function EntryGate({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
    const { role, signIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (requireAdmin && role && role !== "admin") {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    if (!requireAdmin && role && role !== "admin") {
        return <>{children}</>;
    }

    if (!requireAdmin && role === "admin") {
        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    if (requireAdmin && role === "admin") {
        return <>{children}</>;
    }

    const submit = async () => {
        setSubmitting(true);
        setMessage(null);
        try {
            const session = await signIn(password);
            setPassword("");
            if (session.role === "admin") {
                navigate("/admin", { replace: true });
            } else if (location.pathname === "/admin") {
                navigate("/", { replace: true });
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to sign in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-ink">
            <img
                src={siteContent.gate.image}
                alt={siteContent.gate.imageAlt}
                className="auth-bg-fade absolute inset-0 h-full w-full object-cover"
            />
            <div className="auth-overlay-fade absolute inset-0 bg-ink/15" />
            <div className="auth-overlay-fade auth-delay-1 absolute inset-0 bg-linear-to-t from-ink/30 via-transparent to-white/10" />
            <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
                <section className="auth-card-enter relative w-full max-w-md border border-white/80 bg-white/80 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/15">
                    <div className="mb-6 text-center">
                        <p className="auth-rise-in text-label font-medium uppercase tracking-[0.24em] text-rose">
                            {siteContent.couple.dateLabel}
                        </p>
                        <h1 className="auth-rise-in auth-delay-1 mt-3 font-display text-5xl leading-none text-ink">
                            {siteContent.couple.names}
                        </h1>
                        <p className="auth-rise-in auth-delay-2 mt-4 text-small leading-6 text-ink/80">
                            Enter your invite password to view wedding details and RSVP.
                        </p>
                    </div>
                    <form
                        className="auth-rise-in auth-delay-3 grid gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void submit();
                        }}
                    >
                        <label>
                            <span className="sr-only">Password</span>
                            <input
                                className="w-full border border-taupe/20 bg-white/80 px-4 py-3 text-ink placeholder:text-taupe/70 shadow-xs outline-none backdrop-blur-xs transition-all duration-200 focus:border-ink focus:bg-white focus:shadow-sm"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Password"
                                type="password"
                                autoComplete="current-password"
                            />
                        </label>
                        <Button
                            type="submit"
                            disabled={!password.trim() || submitting}
                        >
                            {submitting ? "Checking..." : "Enter"}
                        </Button>
                    </form>
                    {message ? (
                        <p className="auth-message-enter mt-4 border border-rose/30 bg-white/80 p-3 text-small text-rose backdrop-blur-xs">{message}</p>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
