import type { Metadata } from "next";
import Link from "next/link";
import { SubmissionForm } from "@/components/page/SubmissionForm";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 680 }}><PageIntro eyebrow="Account" title="Welcome back" description="Sign in to continue with your Complete Clergyman account." /><div className="surface-panel"><SubmissionForm apiPath="/auth/login" submitLabel="Sign in" successMessage="Your credentials were verified. Account-specific features will be available as they are enabled." fields={[{ name: "email", label: "Email address", type: "email", required: true, fullWidth: true }, { name: "password", label: "Password", type: "password", required: true, fullWidth: true }]} /><p className="field-help" style={{ marginTop: 24 }}>New to the community? <Link className="text-link" href="/register">Create an account</Link></p></div></div></section>;
}
