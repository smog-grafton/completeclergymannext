"use client";

import { useState } from "react";
import { postPublicApi } from "@/lib/publicApi";

interface GivingAmount { amount: number; currency: "UGX" | "USD"; }

export function GiveForm({ suggestedAmounts, currency = "UGX" }: { suggestedAmounts: GivingAmount[]; currency?: "UGX" | "USD" }) {
  const [amount, setAmount] = useState(suggestedAmounts[1]?.amount ?? 50000);
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const format = (value: number) => new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);
    try {
      await postPublicApi("/donation-intents", { amount, currency, frequency, name: form.get("name"), email: form.get("email"), is_anonymous: form.get("anonymous") === "on" });
      setComplete(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not record your giving intention.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (complete) return <div className="notice notice--success" role="status">Thank you. Your giving intention has been recorded. A secure payment option will be offered when a provider is configured.</div>;

  return <form className="surface-panel" onSubmit={submit}><p className="eyebrow">Choose an amount</p><div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>{suggestedAmounts.map((suggestion) => <button key={suggestion.amount} className={amount === suggestion.amount ? "button" : "button--secondary"} type="button" onClick={() => setAmount(suggestion.amount)}>{format(suggestion.amount)}</button>)}</div><div className="form-grid"><div className="form-field"><label className="field-label" htmlFor="gift-amount">Custom amount ({currency})</label><input className="field" id="gift-amount" min="1" value={amount} type="number" onChange={(event) => setAmount(Number(event.target.value) || 0)} required /></div><fieldset className="form-field" style={{ border: 0, margin: 0, padding: 0 }}><legend className="field-label">Frequency</legend><label style={{ marginRight: 18 }}><input name="frequency" type="radio" checked={frequency === "one_time"} onChange={() => setFrequency("one_time")} /> One-time</label><label><input name="frequency" type="radio" checked={frequency === "monthly"} onChange={() => setFrequency("monthly")} /> Monthly</label></fieldset><div className="form-field"><label className="field-label" htmlFor="gift-name">Name</label><input className="field" id="gift-name" name="name" autoComplete="name" /></div><div className="form-field"><label className="field-label" htmlFor="gift-email">Email address</label><input className="field" id="gift-email" name="email" type="email" autoComplete="email" /></div><div className="form-field form-field--full"><label><input name="anonymous" type="checkbox" /> Give anonymously in any future donor listing</label></div></div><div className="notice" style={{ marginTop: 24 }}>Your intention is saved securely; no card, bank, or Mobile Money details are requested on this page.</div>{error ? <p className="field-error" role="alert">{error}</p> : null}<button className="button" type="submit" disabled={isSubmitting} style={{ marginTop: 24 }}>{isSubmitting ? "Saving your intention…" : "Continue with " + format(amount)}</button></form>;
}
