"use client";

import { useEffect, useState } from "react";
import { apiOrigin } from "@/lib/accountApi";
import { formatPrice } from "@/components/books";
import { PaymentCheckout } from "@/components/page/PaymentCheckout";

type Plan = { id: number; slug: string; name: string; description?: string; price: number | string; currency: string; billingInterval: string; accessScope: string; features: string[] };

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Plan | null>(null);

  useEffect(() => {
    fetch(`${apiOrigin()}/api/v1/subscription-plans`, { headers: { Accept: "application/json" } })
      .then(async (response) => response.ok ? response.json() as Promise<{ data: Plan[] }> : Promise.reject(new Error("Membership plans could not be loaded.")))
      .then((payload) => setPlans(payload.data ?? []))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (selected) return <><button className="button--secondary" type="button" onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>← Choose another plan</button><PaymentCheckout kind="subscription" slug={selected.slug} title={`${selected.name} membership`} amount={Number(selected.price)} currency={selected.currency} /></>;
  if (loading) return <div className="surface-panel" aria-busy="true"><p>Loading membership plans…</p></div>;
  if (error && !plans.length) return <div className="empty-state"><h2>Membership plans unavailable</h2><p>{error}</p></div>;
  return <><p className="field-help">Choose a plan, then select a secure provider. Membership access becomes active only after provider verification.</p>{error ? <p className="field-error" role="alert">{error}</p> : null}<div className="grid-3">{plans.map((plan) => <section className="surface-panel" key={plan.id}><p className="eyebrow">{plan.billingInterval}</p><h2 style={{ marginTop: 0 }}>{plan.name}</h2><p>{plan.description}</p><p style={{ fontFamily: "var(--heading-font)", fontSize: "2rem", margin: "20px 0 6px" }}>{formatPrice(Number(plan.price), plan.currency)}</p><p className="field-help">per {plan.billingInterval.replace(/ly$/, "")}</p>{plan.features.length ? <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}<button className="button" onClick={() => setSelected(plan)} type="button">Choose membership</button></section>)}</div></>;
}
