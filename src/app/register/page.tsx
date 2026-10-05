import type { Metadata } from "next";
import { AccountAuthForm } from "@/components/page/AccountAuthForm";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() { return <section className="page page--muted"><div className="content-width" style={{ maxWidth: 760 }}><PageIntro eyebrow="Account" title="Create your account" description="Create a personal library, keep track of event registrations, and choose how we contact you." /><div className="surface-panel"><AccountAuthForm mode="register" /></div></div></section>; }
