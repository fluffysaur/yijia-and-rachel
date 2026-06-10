import { LockKeyhole } from "lucide-react";
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
    return <Navigate to="/" replace />;
  }

  if (!requireAdmin && role && role !== "admin") {
    return <>{children}</>;
  }

  if (!requireAdmin && role === "admin") {
    return <Navigate to="/admin" replace />;
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
    <main className="relative min-h-screen overflow-hidden bg-ink text-ink">
      <img
        src={siteContent.hero.image}
        alt={siteContent.hero.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/35" />
      <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-white/15" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-lg border border-white/35 bg-white/88 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <div className="mb-6">
            <LockKeyhole className="mb-4 text-rose" size={28} />
            <p className="text-sm uppercase tracking-[0.24em] text-rose">{siteContent.couple.dateLabel}</p>
            <h1 className="mt-3 font-display text-5xl leading-none text-ink">{siteContent.couple.names}</h1>
            <p className="mt-4 text-sm leading-6 text-taupe">
              Enter your invite password to view wedding details and RSVP.
            </p>
          </div>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label>
              <span className="sr-only">Password</span>
              <input
                className="w-full rounded-md border border-taupe/20 bg-white px-3 py-3"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
              />
            </label>
            <Button type="submit" disabled={!password.trim() || submitting}>
              {submitting ? "Checking..." : "Enter"}
            </Button>
          </form>
          {message ? <p className="mt-4 rounded-md bg-rose/10 p-3 text-sm text-rose">{message}</p> : null}
        </section>
      </div>
    </main>
  );
}
