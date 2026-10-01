/* The Laravel JSON boundary is intentionally decoded in this adapter. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Advertisement,
  AdvertisementPlacement,
  ArticleWithRelations,
  Author,
  BookCategory,
  BookWithRelations,
  ClergyQuestionWithRelations,
  CommunityOffering,
  ContentRepository,
  DonationCampaign,
  EventWithRelations,
  MessageWithRelations,
  MonthlyTheme,
  NavigationMenu,
  NavigationMenuKey,
  PageResult,
  PodcastWithRelations,
  PrayerRequest,
  RecentResource,
  RichTextBlock,
  SearchResult,
  SitePage,
  TeamMember,
} from "@/types";

type Relation = { id?: number; name: string; slug: string; role?: string; bio?: string; photo?: string | null };
type ApiCollection<T> = { data: T[]; meta: { current_page: number; per_page: number; total: number; last_page: number } };
type ApiPage = { id: number; slug: string; title: string; excerpt: string; body?: string; seo?: Record<string, string>; publishedAt?: string; sections?: Array<{ id: number; key: string; title?: string; content?: { eyebrow?: string; description?: string; body_html?: string }; sortOrder: number }> };
type ApiSettings = { data: Record<string, unknown> };

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const placeholderImage = "/images/logos/logo-cleryman.png";
const stableDate = "2026-01-05T08:00:00.000Z";
const stamp = (id: number, date?: string) => ({ id, uuid: `laravel-${id}`, status: "published" as const, sortOrder: id, createdAt: date ?? stableDate, updatedAt: date ?? stableDate });
const image = (url?: string | null, alt = "Complete Clergyman resource") => ({ id: url ?? `placeholder-${alt}`, url: url ?? placeholderImage, alt, width: 1774, height: 887 });

function htmlBlocks(value?: string): RichTextBlock[] {
  if (!value) return [];
  const matches = value.matchAll(/<(h[2-4]|p|blockquote|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi);
  const output: RichTextBlock[] = [];
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    if (tag.startsWith("h")) output.push({ type: "heading", level: Number(tag[1]) as 2 | 3, text });
    else if (tag === "blockquote") output.push({ type: "quote", text });
    else if (tag === "ul" || tag === "ol") output.push({ type: "list", items: [...match[2].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => item[1].replace(/<[^>]+>/g, "").trim()) });
    else output.push({ type: "paragraph", text });
  }
  return output.length ? output : [{ type: "paragraph", text: value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() }];
}

function toAuthor(item?: Relation): Author {
  return { ...stamp(item?.id ?? 0), slug: item?.slug ?? "complete-clergyman", name: item?.name ?? "Complete Clergyman", role: item?.role ?? "Contributor", shortBio: item?.bio?.replace(/<[^>]+>/g, " ") ?? "", biography: htmlBlocks(item?.bio), portrait: item?.photo ? image(item.photo, item.name) : undefined, socialLinks: [], isClergy: true, specialties: [] };
}
const toTopic = (item: Relation) => ({ ...stamp(item.id ?? 0), slug: item.slug, name: item.name, description: "" });
const toCategory = (item?: Relation) => ({ ...stamp(item?.id ?? 0), slug: item?.slug ?? "resources", name: item?.name ?? "Resources", description: "" });
const pageResult = <T, U>(source: ApiCollection<T>, map: (item: T) => U): PageResult<U> => ({ data: source.data.map(map), meta: { page: source.meta.current_page, perPage: source.meta.per_page, total: source.meta.total, totalPages: source.meta.last_page, hasMore: source.meta.current_page < source.meta.last_page, nextPage: source.meta.current_page < source.meta.last_page ? source.meta.current_page + 1 : null } });

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL is required. Configure the Laravel API origin before starting the frontend.");
  const response = await fetch(`${apiBase}/api/v1${path}`, { ...init, headers: { Accept: "application/json", ...(init?.headers ?? {}) }, next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`Laravel API request failed (${response.status}) for ${path}`);
  return response.json() as Promise<T>;
}

const query = (filters: object) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => value !== undefined && value !== false && params.set(key === "query" ? "q" : key === "perPage" ? "per_page" : key, String(value)));
  return params.size ? `?${params}` : "";
};

const toArticle = (item: any): ArticleWithRelations => ({ ...stamp(item.id, item.publishedAt), slug: item.slug, title: item.title, subtitle: item.subtitle, excerpt: item.excerpt ?? "", body: htmlBlocks(item.body), coverImage: image(item.heroImage, item.heroImageAlt ?? item.title), authorId: item.author?.id ?? 0, categoryId: item.category?.id ?? 0, topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), language: "en", publishedAt: item.publishedAt ?? stableDate, pdfUrl: item.pdfUrl, audio: item.audioUrl ? { url: item.audioUrl, durationSeconds: item.audioDurationSeconds ?? 0 } : undefined, featured: Boolean(item.isFeatured), readingTimeMinutes: item.readingTimeMinutes ?? 3, relatedArticleIds: [], seo: item.seo ?? {}, author: toAuthor(item.author), category: toCategory(item.category), topics: (item.topics ?? []).map(toTopic) });
const toMessage = (item: any): MessageWithRelations => ({ ...stamp(item.id, item.publishedAt), slug: item.slug, title: item.title, excerpt: item.excerpt ?? "", body: htmlBlocks(item.body), coverImage: image(item.thumbnail, item.title), authorId: item.author?.id ?? 0, themeId: item.theme?.id, topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), language: "en", kind: item.kind ?? "teaching", publishedAt: item.publishedAt ?? stableDate, video: item.videoUrl ? { url: item.videoUrl, provider: "other" } : undefined, audio: item.audioUrl ? { url: item.audioUrl, durationSeconds: Number.parseInt(item.duration ?? "0", 10) } : undefined, featured: Boolean(item.isFeatured), readingTimeMinutes: item.readingTimeMinutes ?? 4, seo: item.seo ?? {}, author: toAuthor(item.author), theme: item.theme ? { ...stamp(item.theme.id ?? item.id), slug: item.theme.slug, title: item.theme.name, eyebrow: "Monthly theme", introduction: "", description: "", startDate: stableDate, endDate: stableDate, isCurrent: false, topicIds: [] } : undefined, topics: (item.topics ?? []).map(toTopic) });
const toBook = (item: any): BookWithRelations => ({ ...stamp(item.id, item.publishedAt), slug: item.slug, title: item.title, subtitle: item.subtitle, shortDescription: item.description?.replace(/<[^>]+>/g, " ") ?? "", description: htmlBlocks(item.description), coverImage: image(item.cover, item.coverAlt ?? item.title), coverDesign: item.coverDesign ?? { background: "#26384a", accent: "#c48b00", ink: "#f6f5f1", motif: "column" }, authorIds: (item.authors ?? []).map((entry: Relation) => entry.id ?? 0), categoryIds: (item.categories ?? []).map((entry: Relation) => entry.id ?? 0), topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), language: "en", publishedAt: item.publishedAt ?? stableDate, price: { amount: Number(item.price ?? 0), currency: item.currency ?? "UGX" }, formats: item.formats ?? [{ kind: "online-reader", label: "Online reader", isAvailable: true, sampleAvailable: true }], isbn: item.isbn, pageCount: item.pageCount ?? 0, chapters: (item.chapters ?? []).map((chapter: any) => ({ id: chapter.id, uuid: `chapter-${chapter.id}`, slug: chapter.slug ?? `chapter-${chapter.number}`, number: chapter.number, title: chapter.title, summary: chapter.summary ?? "", body: htmlBlocks(chapter.body), estimatedReadingMinutes: chapter.estimatedReadingMinutes ?? 5, isSample: Boolean(chapter.isSample), audio: chapter.audioUrl ? { url: chapter.audioUrl, durationSeconds: chapter.audioDurationSeconds ?? 0, narrator: chapter.audioNarrator ?? "Complete Clergyman" } : undefined })), featured: Boolean(item.isFeatured), relatedBookIds: [], seo: item.seo ?? {}, authors: (item.authors ?? []).map(toAuthor), categories: (item.categories ?? []).map((entry: Relation) => ({ ...stamp(entry.id ?? 0), slug: entry.slug, name: entry.name, description: "" })), topics: (item.topics ?? []).map(toTopic) });
const toPodcast = (item: any): PodcastWithRelations => ({ ...stamp(item.id, item.publishedAt), slug: item.slug, showTitle: item.podcastName, episodeNumber: item.episodeNumber ?? item.id, title: item.title, description: item.excerpt ?? item.description?.replace(/<[^>]+>/g, " ") ?? "", showNotes: htmlBlocks(item.description), artwork: image(item.cover, item.title), hostAuthorId: item.author?.id ?? 0, guestName: item.guestName, guestRole: item.guestRole, topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), language: "en", publishedAt: item.publishedAt ?? stableDate, durationSeconds: item.durationSeconds ?? 0, episodeFormat: item.episodeFormat, sourceType: item.sourceType, mediaUrl: item.mediaUrl, embedUrl: item.embedUrl, youtubeUrl: item.youtubeUrl ?? "", trailerUrl: item.trailerUrl, youtubeVideoId: item.youtubeVideoId ?? "", qrDestination: item.qrDestination ?? `/podcasts/${item.slug}`, featured: Boolean(item.isFeatured), seo: item.seo ?? {}, host: toAuthor(item.author), topics: (item.topics ?? []).map(toTopic) });
const toAnswer = (item: any): ClergyQuestionWithRelations => ({ ...stamp(item.id, item.publishedAt), status: "approved", slug: item.slug, question: item.title, shortQuestion: item.title, excerpt: item.excerpt ?? "", answer: htmlBlocks(item.answer), categoryId: item.category?.id ?? 0, topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), submittedBy: "A reader", submittedCountry: "Uganda", answeredByAuthorId: item.author?.id, answerFormat: item.answerFormat ?? "written", video: item.videoUrl ? { url: item.videoUrl, provider: item.videoSourceType === "youtube" ? "youtube" : "other" } : undefined, askedAt: item.publishedAt ?? stableDate, publishedAt: item.publishedAt, featured: Boolean(item.isFeatured), seo: item.seo ?? {}, answeredBy: toAuthor(item.author), category: toCategory(item.category), topics: (item.topics ?? []).map(toTopic) });
const toEvent = (item: any): EventWithRelations => ({ ...stamp(item.id, item.startsAt), status: "open", slug: item.slug, title: item.title, shortDescription: item.summary ?? "", description: htmlBlocks(item.description), image: image(item.image, item.title), startsAt: item.startsAt ?? stableDate, endsAt: item.endsAt ?? item.startsAt ?? stableDate, city: item.city ?? "", country: item.country ?? "", venue: item.locationName ?? "", address: item.locationAddress ?? "", capacity: item.capacity, registeredCount: 0, organiser: item.organiser ?? "Complete Clergyman", contact: item.contact ?? { name: "Events", email: "", phone: "" }, featured: Boolean(item.isFeatured), topicIds: (item.topics ?? []).map((entry: Relation) => entry.id ?? 0), seo: item.seo ?? {}, topics: (item.topics ?? []).map(toTopic) });
const toPrayer = (item: any): PrayerRequest => ({ ...stamp(item.id, item.createdAt), status: "approved", publicDisplayName: item.publicDisplayName ?? (item.isAnonymous ? "Anonymous" : "Community member"), country: item.country ?? "", district: item.district, request: item.request, isAnonymous: Boolean(item.isAnonymous), prayerCount: item.prayerCount ?? 0, submittedAt: item.createdAt ?? stableDate, approvedAt: item.approvedAt });
const toPage = (item: ApiPage): SitePage => ({ ...stamp(item.id, item.publishedAt), slug: item.slug, title: item.title, excerpt: item.excerpt, description: item.excerpt, body: htmlBlocks(item.body), sections: (item.sections ?? []).map((section) => ({ id: String(section.id), key: section.key, eyebrow: section.content?.eyebrow, title: section.title, description: section.content?.description, body: htmlBlocks(section.content?.body_html), sortOrder: section.sortOrder })), seo: item.seo ?? {} });

export const laravelContentRepository: ContentRepository = {
  async getSiteConfig() { return (await request<ApiSettings>("/settings")).data["site.public"] as ContentRepository extends { getSiteConfig(): Promise<infer T> } ? T : never; },
  async getNavigation(key: NavigationMenuKey) { const response = await request<{ data: { id: number; name: string; items: Array<{ id: number; label: string; description?: string; url: string; target: string; children?: any[] }> } }>(`/navigation/${key}`); const items = (entries: any[]): NavigationMenu["items"] => entries.map((entry) => ({ id: String(entry.id), label: entry.label, description: entry.description, href: entry.url, external: entry.target === "_blank", children: entry.children?.length ? items(entry.children) : undefined })); return { ...stamp(response.data.id), key, label: response.data.name, items: items(response.data.items) }; },
  async getSitePageBySlug(slug) { return toPage((await request<{ data: ApiPage }>(`/pages/${slug}`)).data); },
  async getAboutPages() { return (await request<{ data: ApiPage[] }>("/pages")).data.map(toPage); },
  async getAuthors() { return (await request<{ data: Relation[] }>("/catalog/authors")).data.map(toAuthor); },
  async getAuthorBySlug(slug) { return toAuthor((await request<{ data: Relation }>(`/catalog/authors/${slug}`)).data); },
  async getThemes() { return (await request<{ data: any[] }>("/catalog/themes")).data.map((item): MonthlyTheme => ({ ...stamp(item.id), slug: item.slug, title: item.title, eyebrow: "Monthly theme", introduction: item.description ?? "", description: item.description ?? "", startDate: item.startsAt ?? stableDate, endDate: item.endsAt ?? stableDate, isCurrent: Boolean(item.isCurrent), heroImage: item.image ? image(item.image, item.title) : undefined, topicIds: [] })); },
  async getCurrentTheme() { return (await this.getThemes()).find((item) => item.isCurrent); },
  async getArticles(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/articles${query(filters)}`), toArticle); },
  async getArticleBySlug(slug) { return toArticle((await request<{ data: any }>(`/articles/${slug}`)).data); },
  async getFeaturedArticle() { return (await this.getArticles({ featured: true, perPage: 1 })).data[0]; },
  async getRelatedArticles(id, limit = 3) { return (await this.getArticles({ perPage: limit + 1 })).data.filter((item) => item.id !== id).slice(0, limit); },
  async getMessages(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/messages${query(filters)}`), toMessage); },
  async getMessageBySlug(slug) { return toMessage((await request<{ data: any }>(`/messages/${slug}`)).data); },
  async getBooks(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/books${query(filters)}`), toBook); },
  async getBookBySlug(slug) { return toBook((await request<{ data: any }>(`/books/${slug}`)).data); },
  async getRelatedBooks(id, limit = 4) { return (await this.getBooks({ perPage: limit + 1 })).data.filter((item) => item.id !== id).slice(0, limit); },
  async getBookCategories() { return (await request<{ data: Array<{ id: number; slug: string; name: string; description?: string }> }>("/catalog/book-categories")).data.map((item): BookCategory => ({ ...stamp(item.id), slug: item.slug, name: item.name, description: item.description ?? "" })); },
  async getPodcasts(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/podcasts${query(filters)}`), toPodcast); },
  async getPodcastBySlug(slug) { return toPodcast((await request<{ data: any }>(`/podcasts/${slug}`)).data); },
  async getClergyQuestions(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/ask${query(filters)}`), toAnswer); },
  async getClergyQuestionBySlug(slug) { return toAnswer((await request<{ data: any }>(`/ask/${slug}`)).data); },
  async getPrayerRequests(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/prayer-requests${query(filters)}`), toPrayer); },
  async getEvents(filters = {}) { return pageResult(await request<ApiCollection<any>>(`/events${query(filters)}`), toEvent); },
  async getEventBySlug(slug) { return toEvent((await request<{ data: any }>(`/events/${slug}`)).data); },
  async getAdvertisements(placement: AdvertisementPlacement) { return (await request<{ data: any[] }>(`/advertisements?placement=${placement}`)).data.map((item): Advertisement => ({ ...stamp(item.id), title: item.title, advertiser: item.advertiser ?? "", desktopImage: image(item.desktopImage, item.altText ?? item.title), mobileImage: image(item.mobileImage, item.altText ?? item.title), altText: item.altText ?? item.title, destinationUrl: item.destinationUrl ?? "/", placement, activeFrom: stableDate, isActive: true, order: item.sortOrder ?? 0 })); },
  async getTeamMembers() { return (await request<{ data: any[] }>("/team")).data.map((item): TeamMember => ({ ...stamp(item.id), slug: item.slug, name: item.name, role: item.role ?? "", shortBio: item.shortBio ?? "", biography: htmlBlocks(item.biography), photo: item.photo ? image(item.photo, item.name) : undefined, socialLinks: item.socialLinks ?? [], location: item.location })); },
  async getDonationCampaign() { return (await request<ApiSettings>("/settings")).data["donation.campaign"] as DonationCampaign; },
  async getCommunityOffering() { return (await request<ApiSettings>("/settings")).data["community.offering"] as CommunityOffering; },
  async getAboutPage(slug) { return this.getSitePageBySlug(slug); },
  async getRecentResources(limit = 8) { const [articles, messages, podcasts, answers] = await Promise.all([this.getArticles({ perPage: limit }), this.getMessages({ perPage: limit }), this.getPodcasts({ perPage: limit }), this.getClergyQuestions({ perPage: limit })]); return [...articles.data.map((item): RecentResource => ({ type: "article", title: item.title, excerpt: item.excerpt, href: `/articles/${item.slug}`, image: item.coverImage, publishedAt: item.publishedAt, authorName: item.author.name, resourceId: item.id })), ...messages.data.map((item): RecentResource => ({ type: "message", title: item.title, excerpt: item.excerpt, href: `/messages/${item.slug}`, image: item.coverImage, publishedAt: item.publishedAt, authorName: item.author.name, resourceId: item.id })), ...podcasts.data.map((item): RecentResource => ({ type: "podcast", title: item.title, excerpt: item.description, href: `/podcasts/${item.slug}`, image: item.artwork, publishedAt: item.publishedAt, authorName: item.host.name, resourceId: item.id })), ...answers.data.map((item): RecentResource => ({ type: "clergy-answer", title: item.shortQuestion, excerpt: item.excerpt, href: `/ask-the-clergy/${item.slug}`, publishedAt: item.publishedAt, authorName: item.answeredBy?.name, resourceId: item.id }))].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")).slice(0, limit); },
  async searchResources(search, filters = {}) { if (search.trim().length < 2) return []; const response = await request<{ data: Record<string, Array<{ id: number; type: SearchResult["type"]; title: string; excerpt: string; href: string }>> }>(`/search?q=${encodeURIComponent(search)}&per_type=${filters.limit ?? 10}`); return Object.values(response.data).flatMap((items) => Array.isArray(items) ? items.map((item): SearchResult => ({ ...item, uuid: `search-${item.id}`, matchedTerms: search.toLowerCase().split(/\s+/).filter(Boolean) })) : []).filter((item) => !filters.types?.length || filters.types.includes(item.type)).slice(0, filters.limit ?? 36); },
};
