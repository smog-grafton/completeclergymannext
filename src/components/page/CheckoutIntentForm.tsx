"use client";

import { useState } from "react";
import { postPublicApi } from "@/lib/publicApi";

interface CheckoutIntentFormProps { bookSlug: string; bookTitle: string; priceLabel: string; }

export function CheckoutIntentForm({ bookSlug, bookTitle, priceLabel }: CheckoutIntentFormProps) {
  const [method, setMethod] = useState<"mobile_money" | "card">("mobile_money");
  const [state, setState] = useState<"initial" | "processing" | "success" | "failed">("initial");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("processing");
    setError("");
    try {
      const response = await postPublicApi<{ data: { orderNumber: string } }>("/order-intents", { book_slug: bookSlug, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), payment_method: method });
      setOrderNumber(response.data.orderNumber);
      setState("success");
    } catch (submissionError) {
      setState("failed");
      setError(submissionError instanceof Error ? submissionError.message : "We could not save this order.");
    }
  }

  if (state === "success") return <div className="surface-panel"><p className="eyebrow">Order saved</p><h2 style={{ marginTop: 0, fontFamily: "var(--heading-font)", fontSize: "2.25rem", fontWeight: 500 }}>Thank you for your interest in {bookTitle}.</h2><p>Your order reference is <strong>{orderNumber}</strong>. No payment has been collected; the order remains pending until a secure payment provider is enabled.</p></div>;

  return <form className="surface-panel" onSubmit={submit}><div className="grid-2"><div><p className="eyebrow">Your purchase</p><h2 style={{ margin: "0 0 8px", fontFamily: "var(--heading-font)", fontSize: "2rem", fontWeight: 500 }}>{bookTitle}</h2><p style={{ margin: 0, color: "var(--muted)" }}>{priceLabel}</p></div><div><p className="eyebrow">Preferred payment method</p><div style={{ display: "flex", flexDirection: "column", gap: 10 }}><label><input type="radio" name="method" checked={method === "mobile_money"} onChange={() => setMethod("mobile_money")} /> Mobile Money</label><label><input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} /> Card</label></div></div><div className="form-field"><label className="field-label" htmlFor="customer-name">Name</label><input className="field" id="customer-name" required name="name" autoComplete="name" /></div><div className="form-field"><label className="field-label" htmlFor="customer-email">Email</label><input className="field" id="customer-email" required name="email" type="email" autoComplete="email" /></div><div className="form-field"><label className="field-label" htmlFor="customer-phone">Phone</label><input className="field" id="customer-phone" name="phone" type="tel" autoComplete="tel" /></div></div><div className="notice" style={{ marginTop: 26 }}>This creates a pending order only. Card and Mobile Money details are never collected until a secure server-side provider is configured.</div>{state === "failed" ? <p className="field-error" role="alert">{error}</p> : null}<button className="button" type="submit" disabled={state === "processing"} style={{ marginTop: 24 }}>{state === "processing" ? "Saving order…" : "Save order for " + priceLabel}</button></form>;
}
