import type { Metadata } from "next";
import { AccountDashboard } from "@/components/page/AccountDashboard";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() { return <section className="page"><div className="content-width"><PageIntro eyebrow="Account" title="Your account" description="Your personal library, event registrations, and contact details in one place." /><AccountDashboard /></div></section>; }
