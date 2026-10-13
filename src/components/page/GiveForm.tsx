"use client";

import { useState } from "react";
import { PaymentCheckout } from "@/components/page/PaymentCheckout";

interface GivingAmount { amount: number; currency: string; }
type Donor = { name?: string; email: string; phone?: string; frequency: "one_time" | "monthly"; isAnonymous?: boolean };

export function GiveForm({ suggestedAmounts, currency = "UGX" }: { suggestedAmounts: GivingAmount[]; currency?: string }) {
  const [amount, setAmount] = useState(suggestedAmounts[1]?.amount ?? 50000);
  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [donor, setDonor] = useState<Donor | null>(null);
  const format = (value: number) => new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setDonor({ name: String(form.get("name") ?? "") || undefined, email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? "") || undefined, frequency, isAnonymous: form.get("anonymous") === "on" });
  }

  if (donor) return <PaymentCheckout kind="donation" title="Your giving" amount={amount} currency={currency} donation={donor} />;
  return <form className="surface-panel" onSubmit={submit}><p className="eyebrow">Choose an amount</p><div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>{suggestedAmounts.map((suggestion) => <button key={suggestion.amount} className={amount === suggestion.amount ? "button" : "button--secondary"} type="button" onClick={() => setAmount(suggestion.amount)}>{format(suggestion.amount)}</button>)}</div><div className="form-grid"><div className="form-field"><label className="field-label" htmlFor="gift-amount">Custom amount ({currency})</label><input className="field" id="gift-amount" min="500" value={amount} type="number" onChange={(event) => setAmount(Number(event.target.value) || 0)} required /></div><fieldset className="form-field" style={{ border: 0, margin: 0, padding: 0 }}><legend className="field-label">Frequency</legend><label style={{ marginRight: 18 }}><input name="frequency" type="radio" checked={frequency === "one_time"} onChange={() => setFrequency("one_time")} /> One-time</label><label><input name="frequency" type="radio" checked={frequency === "monthly"} onChange={() => setFrequency("monthly")} /> Monthly</label></fieldset><div className="form-field"><label className="field-label" htmlFor="gift-name">Name</label><input className="field" id="gift-name" name="name" autoComplete="name" /></div><div className="form-field"><label className="field-label" htmlFor="gift-email">Email address</label><input className="field" id="gift-email" name="email" type="email" autoComplete="email" required /></div><div className="form-field"><label className="field-label" htmlFor="gift-phone">Phone number</label><input className="field" id="gift-phone" name="phone" type="tel" autoComplete="tel" /></div><div className="form-field form-field--full"><label><input name="anonymous" type="checkbox" /> Give anonymously in any future donor listing</label></div></div><div className="notice" style={{ marginTop: 24 }}>You will choose a secure provider next. We never collect card details on this page.</div><button className="button" type="submit" style={{ marginTop: 24 }}>Continue with {format(amount)}</button></form>;
}
