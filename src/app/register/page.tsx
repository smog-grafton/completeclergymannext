import type { Metadata } from "next";
import { SubmissionForm } from "@/components/page/SubmissionForm";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 760 }}><PageIntro eyebrow="Account" title="Create your account" description="Accounts support future protected libraries, registrations, and preferences." /><div className="surface-panel"><SubmissionForm apiPath="/auth/register" submitLabel="Create account" successMessage="Your account has been created. Keep your credentials safe and sign in when you return." fields={[{ name: "name", label: "Full name", required: true }, { name: "email", label: "Email address", type: "email", required: true }, { name: "password", label: "Choose a password", type: "password", required: true, help: "Use at least 12 characters." }]} /></div></div></section>;
}
