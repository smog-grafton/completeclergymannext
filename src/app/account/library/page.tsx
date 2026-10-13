import { PageIntro } from "@/components/page/PageIntro";
import { AccountCommerceList } from "@/components/page/AccountCommerceList";

export default function LibraryPage() {
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Account" title="Your library" description="Verified content access appears after provider confirmation." /><AccountCommerceList kind="library" /></div></section>;
}
