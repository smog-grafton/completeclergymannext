import { AccountProfileForm } from "@/components/page/AccountProfileForm";
import { PageIntro } from "@/components/page/PageIntro";
export default function AccountProfilePage() { return <section className="page"><div className="content-width"><PageIntro eyebrow="Account" title="Profile and access" description="Update your account information and password securely." /><AccountProfileForm /></div></section>; }
