"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { accessToken, accountJson, apiOrigin } from "@/lib/accountApi";

type Gateway = { code: "iotec" | "flutterwave"; name: string; methods: ("mobile_money" | "card")[]; publicKey?: string | null };
type Inline = { public_key: string; tx_ref: string; amount: number; currency: string; payment_options: string; customer: { email: string; name: string; phonenumber?: string | null }; customizations: { title: string; description: string } };
type PaymentPayload = { reference: string; status: "pending" | "paid" | "failed"; provider: "iotec" | "flutterwave"; method: string; amount: string | number; currency: string; message?: string | null; statusToken: string; inline?: Inline | null };

declare global { interface Window { FlutterwaveCheckout?: (config: Inline & { callback: (response: { transaction_id?: string }) => void; onclose: () => void }) => void; } }

interface PaymentCheckoutProps {
  kind: "book" | "podcast" | "subscription" | "donation";
  slug?: string;
  title: string;
  amount: number;
  currency: string;
  donation?: { name?: string; email: string; phone?: string; frequency: "one_time" | "monthly"; isAnonymous?: boolean };
  onPaid?: () => void;
}

export function PaymentCheckout({ kind, slug, title, amount, currency, donation, onPaid }: PaymentCheckoutProps) {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [method, setMethod] = useState<"mobile_money" | "card">("mobile_money");
  const [phone, setPhone] = useState(donation?.phone ?? "");
  const [payment, setPayment] = useState<PaymentPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "starting" | "awaiting" | "paid" | "failed">("loading");
  const [error, setError] = useState("");
  const scriptRequested = useRef(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`${apiOrigin()}/api/v1/payments/methods?currency=${encodeURIComponent(currency)}`, { headers: { Accept: "application/json" } })
      .then(async (response) => response.ok ? response.json() as Promise<{ data: { gateways: Gateway[] } }> : Promise.reject(new Error("Secure payment methods are not available right now.")))
      .then(({ data }) => {
        const choices = data.gateways ?? [];
        setGateways(choices);
        const first = choices.find((item) => item.methods.includes("mobile_money")) ?? choices[0] ?? null;
        setGateway(first);
        setMethod(first?.methods.includes("mobile_money") ? "mobile_money" : "card");
        setState("ready");
      })
      .catch((reason: Error) => { setError(reason.message); setState("failed"); });
  }, [currency]);

  useEffect(() => {
    if (!payment || !["awaiting", "starting"].includes(state) || payment.status !== "pending") return;
    const interval = window.setInterval(() => { void refreshPayment(payment); }, 5000);
    return () => window.clearInterval(interval);
  }, [payment?.reference, state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshPayment(current: PaymentPayload) {
    try {
      const result = await accountJson<{ data: PaymentPayload }>(`/payments/${encodeURIComponent(current.reference)}/status?token=${encodeURIComponent(current.statusToken)}`);
      setPayment((old) => old ? { ...old, ...result.data } : result.data);
      if (result.data.status === "paid") { setState("paid"); onPaid?.(); }
      if (result.data.status === "failed") setState("failed");
    } catch { /* A temporary reconciliation delay must not present a false failure. */ }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (kind !== "donation" && !accessToken()) {
      const next = kind === "subscription" ? "/subscriptions" : kind === "podcast" ? `/podcasts/${slug ?? ""}` : `/checkout?book=${slug ?? ""}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!gateway) return;
    if (gateway.code === "iotec" && !phone.trim()) { setError("Enter the mobile number that will approve this payment."); return; }
    setError(""); setState("starting");
    try {
      const body = kind === "donation"
        ? { kind, amount, currency, name: donation?.name || null, email: donation?.email, phone, frequency: donation?.frequency, is_anonymous: donation?.isAnonymous ?? false, gateway: gateway.code, method }
        : { kind, slug, gateway: gateway.code, method, phone };
      const path = kind === "donation" ? "/donations/checkout" : "/payments/checkout";
      const response = await accountJson<{ data: PaymentPayload }>(path, { method: "POST", body: JSON.stringify(body) });
      setPayment(response.data);
      if (response.data.provider === "flutterwave" && response.data.inline) await openFlutterwave(response.data);
      else setState("awaiting");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not start your secure payment."); setState("ready");
    }
  }

  async function openFlutterwave(created: PaymentPayload) {
    const launch = () => {
      if (!window.FlutterwaveCheckout || !created.inline) { setError("Flutterwave checkout could not be loaded. Please try again."); setState("ready"); return; }
      setState("awaiting");
      window.FlutterwaveCheckout({ ...created.inline, callback: async ({ transaction_id }) => {
        try {
          const result = await accountJson<{ data: PaymentPayload }>(`/payments/${encodeURIComponent(created.reference)}/verify`, { method: "POST", body: JSON.stringify({ transaction_id, token: created.statusToken }) });
          setPayment(result.data); setState(result.data.status === "paid" ? "paid" : result.data.status === "failed" ? "failed" : "awaiting");
          if (result.data.status === "paid") onPaid?.();
        } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not verify this payment yet."); setState("awaiting"); }
      }, onclose: () => setState("awaiting") });
    };
    if (window.FlutterwaveCheckout) { launch(); return; }
    if (scriptRequested.current) return;
    scriptRequested.current = true;
    const script = document.createElement("script"); script.src = "https://checkout.flutterwave.com/v3.js"; script.async = true; script.onload = launch; script.onerror = () => { setError("Flutterwave checkout could not be loaded. Please try again."); setState("ready"); };
    document.head.appendChild(script);
  }

  const amountLabel = new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: currency === "UGX" ? 0 : 2 }).format(amount);
  if (state === "paid") return <div className="notice notice--success" role="status"><h2 style={{ marginTop: 0 }}>Payment confirmed</h2><p>Your payment for {title} has been verified by the provider. Your access is now active.</p></div>;
  if (state === "failed" && !gateways.length) return <div className="notice" role="alert"><h2 style={{ marginTop: 0 }}>Payment unavailable</h2><p>{error || "No secure payment method is available for this currency."}</p></div>;

  return <form className="surface-panel" onSubmit={submit} aria-busy={state === "loading" || state === "starting"}>
    <p className="eyebrow">Secure checkout</p><h2 style={{ marginTop: 0, fontFamily: "var(--heading-font)", fontSize: "2rem", fontWeight: 500 }}>{title}</h2><p style={{ color: "var(--muted)" }}>{amountLabel}</p>
    {state === "awaiting" && payment ? <div className="notice" role="status"><strong>{payment.provider === "iotec" ? "Approve the prompt on your phone." : "Payment submitted — verifying securely."}</strong><p style={{ marginBottom: 0 }}>{payment.message || "We are checking the provider directly. Do not close this page until confirmation appears."}</p></div> : <><fieldset className="form-field" style={{ border: 0, margin: "22px 0 0", padding: 0 }}><legend className="field-label">Payment method</legend>{gateways.map((option) => <label key={option.code} style={{ display: "block", marginBottom: 10 }}><input type="radio" checked={gateway?.code === option.code} onChange={() => { setGateway(option); setMethod(option.methods.includes("mobile_money") ? "mobile_money" : "card"); }} /> {option.name}</label>)}</fieldset>
      {gateway?.methods.length && gateway.methods.length > 1 ? <fieldset className="form-field" style={{ border: 0, margin: "16px 0 0", padding: 0 }}><legend className="field-label">Pay with</legend>{gateway.methods.map((option) => <label key={option} style={{ marginRight: 18 }}><input type="radio" checked={method === option} onChange={() => setMethod(option)} /> {option === "mobile_money" ? "Mobile Money" : "Card"}</label>)}</fieldset> : null}
      {gateway?.code === "iotec" ? <div className="form-field" style={{ marginTop: 16 }}><label className="field-label" htmlFor="payment-phone">Mobile Money number</label><input className="field" id="payment-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07XXXXXXXX or 2567XXXXXXXX" autoComplete="tel" required /></div> : null}</>}
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    {state !== "awaiting" ? <button className="button" type="submit" disabled={state === "loading" || state === "starting" || !gateway} style={{ marginTop: 24 }}>{state === "starting" ? "Starting secure checkout…" : `Pay ${amountLabel}`}</button> : null}
    <p className="field-help" style={{ marginTop: 18 }}>Payment access is granted only after server-side verification with the payment provider. We never collect card details on this site.</p>
  </form>;
}
