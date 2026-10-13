import { AccountCommerceList } from "@/components/page/AccountCommerceList";
import { PageIntro } from "@/components/page/PageIntro";
export default function AccountSubscriptionsPage() { return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Account" title="Your memberships" description="Current and past membership access." /><AccountCommerceList kind="subscriptions" /></div></section>; }
