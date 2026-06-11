import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearAccessSession,
  readAccessSession,
  saveAccessSession,
  type AccessRole,
  type AccessSession,
} from "../../lib/access";

type AuthContextValue = {
  session: AccessSession | null;
  role: AccessRole | null;
  token: string | null;
  signIn: (password: string) => Promise<AccessSession>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AccessSession | null>(() => readAccessSession());

  useEffect(() => {
    if (!session) return;

    const timeoutId = window.setTimeout(() => {
      clearAccessSession();
      setSession(null);
    }, Math.max(0, session.expiresAt - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [session]);

  const signIn = useCallback(async (password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { role: AccessRole; expiresAt: number; token: string; inviteGroupId?: string | null; error?: string }
      | null;

    if (!response.ok || !payload?.token) {
      throw new Error(payload?.error || "Invalid password.");
    }

    const nextSession = {
      role: payload.role,
      expiresAt: payload.expiresAt,
      token: payload.token,
      inviteGroupId: payload.inviteGroupId ?? null,
    };
    saveAccessSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(() => {
    clearAccessSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      role: session?.role ?? null,
      token: session?.token ?? null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
