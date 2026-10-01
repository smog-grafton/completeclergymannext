"use client";

import { SubmissionForm } from "@/components/page/SubmissionForm";

export function JoinSubscriptionForm({ labels }: { labels: string[] }) {
  const fields = labels.map((label) => ({ name: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, type: "checkbox" as const, fullWidth: true }));
  return <SubmissionForm apiPath="/subscriptions" submitLabel="Join the community" successMessage="Thank you. Your subscription has been saved." toPayload={(values) => ({ name: values.name, email: values.email, phone: values.phone, country: values.country, source: "join-page", interests: labels.filter((label) => values[label.toLowerCase().replace(/[^a-z0-9]+/g, "-")] === "true") })} fields={[{ name: "name", label: "Name" }, { name: "email", label: "Email address", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" }, { name: "country", label: "Country" }, ...fields]} />;
}
