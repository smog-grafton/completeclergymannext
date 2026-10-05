"use client";

import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export function AccountAuthForm({ mode }: { mode: Mode }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(data.entries());
    if (mode === "register") payload.marketing_consent = data.get("marketing_consent") ? true : false;
    setPending(true); setError("");
    try {
      if (!apiBase) throw new Error("Account services are not configured yet.");
      const response = await fetch(`${apiBase}/api/v1/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => null) as { data?: { token?: string }; message?: string; errors?: Record<string, string[]> } | null;
      if (!response.ok || !body?.data?.token) throw new Error(Object.values(body?.errors ?? {})[0]?.[0] ?? body?.message ?? "We could not sign you in.");
      window.localStorage.setItem("cc_access_token", body.data.token);
      window.location.assign("/account");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not sign you in."); }
    finally { setPending(false); }
  }

  return <form className="form-grid" noValidate onSubmit={submit}>
    {mode === "register" ? <><div className="form-field"><label className="field-label" htmlFor="account-name">Full name *</label><input className="field" id="account-name" name="name" required /></div><div className="form-field"><label className="field-label" htmlFor="account-phone">Phone number</label><input autoComplete="tel" className="field" id="account-phone" name="phone" type="tel" /></div><div className="form-field"><label className="field-label" htmlFor="account-country">Country</label><input autoComplete="country-name" className="field" id="account-country" name="country" /></div></> : null}
    <div className="form-field"><label className="field-label" htmlFor="account-email">Email address *</label><input autoComplete="email" className="field" id="account-email" name="email" required type="email" /></div>
    <div className="form-field"><label className="field-label" htmlFor="account-password">{mode === "register" ? "Choose a password" : "Password"} *</label><input autoComplete={mode === "register" ? "new-password" : "current-password"} className="field" id="account-password" minLength={mode === "register" ? 12 : undefined} name="password" required type="password" />{mode === "register" ? <p className="field-help">Use at least 12 characters.</p> : null}</div>
    {mode === "register" ? <label className="form-field form-field--full" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><input name="marketing_consent" type="checkbox" /><span><strong>Keep me informed</strong><span className="field-help" style={{ display: "block" }}>I am happy to receive occasional ministry and resource updates by email or SMS.</span></span></label> : null}
    {error ? <p className="field-error form-field--full" role="alert">{error}</p> : null}
    <div className="form-field form-field--full"><button className="button" disabled={pending} type="submit">{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></div>
  </form>;
}
