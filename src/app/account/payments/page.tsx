import { AccountCommerceList } from "@/components/page/AccountCommerceList";
import { PageIntro } from "@/components/page/PageIntro";
export default function AccountPaymentsPage() { return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Account" title="Payment history" description="Provider-verified payments and any pending attempts." /><AccountCommerceList kind="payments" /></div></section>; }
