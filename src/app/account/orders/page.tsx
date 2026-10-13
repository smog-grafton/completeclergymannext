import { AccountCommerceList } from "@/components/page/AccountCommerceList";
import { PageIntro } from "@/components/page/PageIntro";
export default function AccountOrdersPage() { return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Account" title="Your orders" description="A record of every book, episode, and membership order." /><AccountCommerceList kind="orders" /></div></section>; }
