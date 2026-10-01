import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/page/JsonLd";
import { RichText } from "@/components/page/RichText";
import { contentRepository } from "@/lib/data";
import { dateLabel } from "@/lib/route-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await contentRepository.getEventBySlug((await params).slug);
  return event ? { title: event.seo.title ?? event.title, description: event.seo.description ?? event.shortDescription } : { title: "Event not found" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await contentRepository.getEventBySlug((await params).slug);
  if (!event) notFound();
  return <article className="page"><div className="content-width"><div className="two-column-detail"><aside className="sticky-column"><Image src={event.image.url} alt={event.image.alt} width={event.image.width} height={event.image.height} sizes="(max-width: 767px) 100vw, 34vw" style={{ width: "100%", height: "auto", display: "block" }} /><div className="surface-panel" style={{ marginTop: 18 }}><p className="eyebrow">Date and place</p><p style={{ margin: "0 0 12px", fontFamily: "var(--heading-font)", fontSize: "1.6rem" }}>{dateLabel(event.startsAt)}</p><p style={{ margin: 0 }}>{event.venue}<br />{event.address}<br />{event.city}, {event.country}</p></div></aside><div><p className="eyebrow">Event · {event.status === "open" ? "Registration open" : event.status}</p><h1 className="detail-title">{event.title}</h1><p className="detail-subtitle">{event.shortDescription}</p><div className="metadata"><span>{dateLabel(event.startsAt)}</span><span>{event.organiser}</span>{event.capacity ? <span>{Math.max(event.capacity - event.registeredCount, 0)} places currently available</span> : null}</div><p style={{ marginTop: 32 }}><Link className="button" href={`/events/${event.slug}/register`}>{event.status === "open" ? "Register for this event" : "View registration details"}</Link></p><div className="rule" /><RichText blocks={event.description} /><div className="surface-panel" style={{ marginTop: 42 }}><p className="eyebrow">Need help?</p><p style={{ margin: 0 }}>Contact {event.contact.name} at <a className="text-link" href={`mailto:${event.contact.email}`}>{event.contact.email}</a> or {event.contact.phone}.</p></div></div></div></div><JsonLd data={{ "@context": "https://schema.org", "@type": "Event", name: event.title, description: event.shortDescription, startDate: event.startsAt, endDate: event.endsAt, image: event.image.url, location: { "@type": "Place", name: event.venue, address: event.address }, organizer: { "@type": "Organization", name: event.organiser } }} /></article>;
}
