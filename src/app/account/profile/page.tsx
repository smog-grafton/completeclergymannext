import { AccountDashboard } from "@/components/page/AccountDashboard";
import { PageIntro } from "@/components/page/PageIntro";
export default function AccountProfilePage() { return <section className="page"><div className="content-width"><PageIntro eyebrow="Account" title="Profile and access" description="Your account information and active access." /><AccountDashboard /></div></section>; }
