"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { accountJson } from "@/lib/accountApi";
import { useAccountAuth } from "@/components/account/AccountAuthProvider";

export function AccountProfileForm() {
  const { state: authState, user, refresh } = useAccountAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (authState === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname || "/account/profile")}`); }, [authState, pathname, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const payload: Record<string, unknown> = {
      name: data.get("name"), email: data.get("email") || null, phone: data.get("phone") || null,
      country: data.get("country") || null, marketing_consent: data.get("marketing_consent") === "on",
    };
    if (password) {
      payload.password = password;
      payload.password_confirmation = data.get("password_confirmation");
    }
    setPending(true); setError(""); setNotice("");
    try {
      await accountJson("/account", { method: "PATCH", body: JSON.stringify(payload) });
      await refresh();
      setNotice("Your profile has been updated.");
      const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
      const confirmationInput = form.elements.namedItem("password_confirmation") as HTMLInputElement | null;
      if (passwordInput) passwordInput.value = "";
      if (confirmationInput) confirmationInput.value = "";
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not update your profile."); }
    finally { setPending(false); }
  }

  if (authState !== "authenticated" || !user) return <div className="surface-panel" aria-busy="true">Checking your account…</div>;
  return <form className="surface-panel form-grid" onSubmit={submit}>
    <div className="form-field"><label className="field-label" htmlFor="profile-name">Full name</label><input className="field" defaultValue={user.name} id="profile-name" name="name" required /></div>
    <div className="form-field"><label className="field-label" htmlFor="profile-email">Email address</label><input autoComplete="email" className="field" defaultValue={user.email ?? ""} id="profile-email" name="email" type="email" /></div>
    <div className="form-field"><label className="field-label" htmlFor="profile-phone">Phone number</label><input autoComplete="tel" className="field" defaultValue={user.phone ?? ""} id="profile-phone" name="phone" type="tel" /><p className="field-help">Use 07XXXXXXXX, 2567XXXXXXXX, or international + format.</p></div>
    <div className="form-field"><label className="field-label" htmlFor="profile-country">Country</label><input autoComplete="country-name" className="field" defaultValue={user.country ?? ""} id="profile-country" name="country" /></div>
    <div className="form-field"><label className="field-label" htmlFor="profile-password">New password</label><input autoComplete="new-password" className="field" id="profile-password" minLength={12} name="password" type="password" /><p className="field-help">Leave blank to keep your current password.</p></div>
    <div className="form-field"><label className="field-label" htmlFor="profile-password-confirmation">Confirm new password</label><input autoComplete="new-password" className="field" id="profile-password-confirmation" minLength={12} name="password_confirmation" type="password" /></div>
    <label className="form-field form-field--full" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><input defaultChecked={Boolean(user.marketingConsent)} name="marketing_consent" type="checkbox" /><span>Keep me informed about ministry resources and community updates.</span></label>
    {error ? <p className="field-error form-field--full" role="alert">{error}</p> : null}
    {notice ? <p className="notice notice--success form-field--full" role="status">{notice}</p> : null}
    <div className="form-field form-field--full"><button className="button" disabled={pending} type="submit">{pending ? "Saving…" : "Save profile"}</button></div>
  </form>;
}
