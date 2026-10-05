import type { Metadata } from "next";
import Link from "next/link";
import { AccountAuthForm } from "@/components/page/AccountAuthForm";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() { return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 680 }}><PageIntro eyebrow="Account" title="Welcome back" description="Sign in to open your library, registrations, and personal settings." /><div className="surface-panel"><AccountAuthForm mode="login" /><p className="field-help" style={{ marginTop: 24 }}>New to the community? <Link className="text-link" href="/register">Create an account</Link></p></div></div></section>; }
