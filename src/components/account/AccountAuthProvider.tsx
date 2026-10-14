"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { accountFetch, accountJson, accessToken, clearAccessToken } from "@/lib/accountApi";

export type AccountUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  marketingConsent?: boolean;
  status: "active" | "suspended" | "disabled";
};

type AuthState = "loading" | "authenticated" | "unauthenticated";
type AccountAuthValue = { state: AuthState; user: AccountUser | null; refresh: () => Promise<void>; signOut: () => Promise<void> };

const AccountAuthContext = createContext<AccountAuthValue | null>(null);

export function AccountAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [user, setUser] = useState<AccountUser | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken()) {
      setUser(null);
      setState("unauthenticated");
      return;
    }

    setState("loading");
    try {
      const response = await accountJson<{ data: { user: AccountUser } }>("/auth/me");
      setUser(response.data.user);
      setState("authenticated");
    } catch {
      clearAccessToken();
      setUser(null);
      setState("unauthenticated");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await accountFetch("/account/logout", { method: "POST" });
    } finally {
      clearAccessToken();
      setUser(null);
      setState("unauthenticated");
    }
  }, []);

  const value = useMemo(() => ({ state, user, refresh, signOut }), [state, user, refresh, signOut]);
  return <AccountAuthContext.Provider value={value}>{children}</AccountAuthContext.Provider>;
}

export function useAccountAuth(): AccountAuthValue {
  const value = useContext(AccountAuthContext);
  if (!value) throw new Error("useAccountAuth must be rendered within AccountAuthProvider.");
  return value;
}
