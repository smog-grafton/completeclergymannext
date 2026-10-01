/**
 * Domain models shared by Laravel API resources and frontend components.
 */

export type IsoDateString = string;

export type PublicationStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type ModerationStatus = "pending" | "approved" | "rejected" | "hidden";

export type EventRegistrationStatus = "open" | "waitlist" | "closed" | "cancelled";

export type ContentLanguageCode = "en" | "lg" | "sw";

export type ResourceType =
  | "article"
  | "message"
  | "book"
  | "podcast"
  | "clergy-answer"
  | "event";

export interface BaseModel<TStatus extends string = PublicationStatus> {
  /** Stable, seed-friendly primary key. */
  id: number;
  /** Stable public identifier for future API resources. */
  uuid: string;
  status: TStatus;
  sortOrder: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Optional attribution that can be rendered where editorially appropriate. */
  credit?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
}

export interface AudioAsset {
  url: string;
  durationSeconds: number;
  transcript?: string;
}

export interface VideoAsset {
  url: string;
  provider: "youtube" | "vimeo" | "other";
  videoId?: string;
  durationSeconds?: number;
}

export interface Money {
  amount: number;
  currency: "UGX" | "USD";
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: MediaAsset;
}

export interface ContentLanguage {
  code: ContentLanguageCode;
  label: string;
  nativeLabel: string;
}

export type RichTextBlock =
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "scripture"; text: string; reference: string }
  | { type: "list"; items: string[] };

export interface SocialLink {
  label: string;
  href: string;
  platform: "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "website" | "email";
}

export interface Author extends BaseModel {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  biography: RichTextBlock[];
  portrait?: MediaAsset;
  location?: string;
  email?: string;
  website?: string;
  socialLinks: SocialLink[];
  isClergy: boolean;
  specialties: string[];
}

export interface ArticleCategory extends BaseModel {
  slug: string;
  name: string;
  description: string;
}

export interface Topic extends BaseModel {
  slug: string;
  name: string;
  description: string;
}

export interface MonthlyTheme extends BaseModel {
  slug: string;
  title: string;
  eyebrow: string;
  introduction: string;
  description: string;
  startDate: IsoDateString;
  endDate: IsoDateString;
  isCurrent: boolean;
  heroImage?: MediaAsset;
  topicIds: number[];
}

export interface Article extends BaseModel {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  body: RichTextBlock[];
  coverImage: MediaAsset;
  authorId: number;
  categoryId: number;
  topicIds: number[];
  language: ContentLanguageCode;
  publishedAt: IsoDateString;
  pdfUrl?: string;
  audio?: AudioAsset;
  featured: boolean;
  readingTimeMinutes: number;
  relatedArticleIds: number[];
  seo: SeoMetadata;
}

export interface ArticleWithRelations extends Article {
  author: Author;
  category: ArticleCategory;
  topics: Topic[];
}

export type MessageKind = "teaching" | "reflection" | "community-submission" | "ministry-report";

export interface Message extends BaseModel {
  slug: string;
  title: string;
  excerpt: string;
  body: RichTextBlock[];
  coverImage: MediaAsset;
  authorId: number;
  themeId?: number;
  topicIds: number[];
  language: ContentLanguageCode;
  kind: MessageKind;
  publishedAt: IsoDateString;
  video?: VideoAsset;
  audio?: AudioAsset;
  featured: boolean;
  readingTimeMinutes: number;
  seo: SeoMetadata;
}

export interface MessageWithRelations extends Message {
  author: Author;
  theme?: MonthlyTheme;
  topics: Topic[];
}

export type BookFormatKind = "pdf" | "online-reader" | "audio";

export interface BookFormat {
  kind: BookFormatKind;
  label: string;
  isAvailable: boolean;
  fileUrl?: string;
  sampleAvailable: boolean;
}

export interface BookAudioChapter {
  url: string;
  durationSeconds: number;
  narrator: string;
}

export interface BookChapter {
  id: number;
  uuid: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  body: RichTextBlock[];
  estimatedReadingMinutes: number;
  isSample: boolean;
  audio?: BookAudioChapter;
}

/** Values used by the BookCover UI to make intentional CSS cover art. */
export interface BookCoverDesign {
  background: string;
  accent: string;
  ink: string;
  motif: "cross" | "column" | "flame" | "path" | "window" | "seed" | "river" | "compass";
}

export interface Book extends BaseModel {
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  description: RichTextBlock[];
  coverImage?: MediaAsset;
  coverDesign: BookCoverDesign;
  authorIds: number[];
  categoryIds: number[];
  topicIds: number[];
  language: ContentLanguageCode;
  publishedAt: IsoDateString;
  price: Money;
  formats: BookFormat[];
  isbn?: string;
  pageCount: number;
  chapters: BookChapter[];
  featured: boolean;
  relatedBookIds: number[];
  seo: SeoMetadata;
}

export interface BookWithRelations extends Book {
  authors: Author[];
  categories: BookCategory[];
  topics: Topic[];
}

export interface BookCategory extends BaseModel {
  slug: string;
  name: string;
  description: string;
}

export interface PodcastEpisode extends BaseModel {
  slug: string;
  showTitle: string;
  episodeNumber: number;
  title: string;
  description: string;
  showNotes: RichTextBlock[];
  artwork: MediaAsset;
  hostAuthorId: number;
  guestName?: string;
  guestRole?: string;
  topicIds: number[];
  language: ContentLanguageCode;
  publishedAt: IsoDateString;
  durationSeconds: number;
  /** Delivery details are selected by an editor in Filament, never inferred from fixtures. */
  episodeFormat?: "audio" | "video";
  sourceType?: "upload" | "remote" | "youtube" | "embed";
  mediaUrl?: string;
  embedUrl?: string;
  youtubeUrl: string;
  trailerUrl?: string;
  youtubeVideoId: string;
  qrDestination: string;
  featured: boolean;
  seo: SeoMetadata;
}

export interface PodcastWithRelations extends PodcastEpisode {
  host: Author;
  topics: Topic[];
}

export type ClergyAnswerFormat = "written" | "video" | "written-and-video";

export interface ClergyQuestion extends BaseModel<ModerationStatus> {
  slug: string;
  question: string;
  shortQuestion: string;
  excerpt: string;
  answer: RichTextBlock[];
  categoryId: number;
  topicIds: number[];
  submittedBy: string;
  submittedCountry: string;
  submittedDistrict?: string;
  answeredByAuthorId?: number;
  answerFormat: ClergyAnswerFormat;
  video?: VideoAsset;
  askedAt: IsoDateString;
  publishedAt?: IsoDateString;
  featured: boolean;
  seo: SeoMetadata;
}

export interface ClergyQuestionWithRelations extends ClergyQuestion {
  answeredBy?: Author;
  category: ArticleCategory;
  topics: Topic[];
}

export interface PrayerRequest extends BaseModel<ModerationStatus> {
  publicDisplayName: string;
  country: string;
  district?: string;
  request: string;
  isAnonymous: boolean;
  prayerCount: number;
  submittedAt: IsoDateString;
  approvedAt?: IsoDateString;
}

export interface EventContact {
  name: string;
  email: string;
  phone: string;
}

export interface Event extends BaseModel<EventRegistrationStatus> {
  slug: string;
  title: string;
  shortDescription: string;
  description: RichTextBlock[];
  image: MediaAsset;
  startsAt: IsoDateString;
  endsAt: IsoDateString;
  city: string;
  country: string;
  venue: string;
  address: string;
  capacity?: number;
  registeredCount: number;
  organiser: string;
  contact: EventContact;
  registrationUrl?: string;
  featured: boolean;
  topicIds: number[];
  seo: SeoMetadata;
}

export interface EventWithRelations extends Event {
  topics: Topic[];
}

export type AdvertisementPlacement =
  | "HOME_BANNER_PRIMARY"
  | "HOME_BANNER_SECONDARY"
  | "ARTICLE_INLINE"
  | "BOOKS_BANNER"
  | "PODCAST_BANNER";

export interface Advertisement extends BaseModel<PublicationStatus> {
  title: string;
  advertiser: string;
  desktopImage: MediaAsset;
  mobileImage: MediaAsset;
  altText: string;
  destinationUrl: string;
  placement: AdvertisementPlacement;
  activeFrom: IsoDateString;
  activeUntil?: IsoDateString;
  isActive: boolean;
  /** Explicit CMS ordering alias retained alongside the common sortOrder. */
  order: number;
}

export interface TeamMember extends BaseModel {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  biography: RichTextBlock[];
  photo?: MediaAsset;
  socialLinks: SocialLink[];
  location?: string;
}

export interface DonationCampaign extends BaseModel {
  slug: string;
  title: string;
  description: string;
  suggestedAmounts: Money[];
  defaultCurrency: Money["currency"];
  acceptsMonthlyGiving: boolean;
}

export interface CommunityBenefit {
  title: string;
  description: string;
}

export interface CommunityOffering extends BaseModel {
  title: string;
  description: string;
  benefits: CommunityBenefit[];
  signupLabels: string[];
}

export interface Announcement extends BaseModel {
  text: string;
  href: string;
  ctaLabel: string;
  isVisible: boolean;
}

export type NavigationMenuKey =
  | "primary"
  | "features"
  | "drawer"
  | "footer-explore"
  | "footer-features"
  | "footer-organisation"
  | "footer-account";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  children?: NavigationItem[];
}

export interface NavigationMenu extends BaseModel {
  key: NavigationMenuKey;
  label: string;
  items: NavigationItem[];
}

export interface FooterConfig {
  missionStatement: string;
  logoText: string;
  copyright: string;
  legalLinks: NavigationItem[];
  socialLinks: SocialLink[];
  newsletterHeading: string;
  newsletterDescription: string;
}

export interface SiteConfig extends BaseModel {
  organizationName: string;
  shortName: string;
  domain: string;
  logoText: string;
  logoMarkLabel: string;
  logoSrc?: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  defaultSeo: SeoMetadata;
  announcement?: Announcement;
  footer: FooterConfig;
  currentThemeId: number;
}

export interface PageCallToAction {
  label: string;
  href: string;
  external?: boolean;
}

/** A backend-editable page slice rather than presentation-specific JSX content. */
export interface SitePageSection {
  id: string;
  key: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  body: RichTextBlock[];
  image?: MediaAsset;
  callToAction?: PageCallToAction;
  sortOrder: number;
}

export interface SitePage extends BaseModel {
  slug: string;
  /** Optional display fields for a controlled editorial page introduction. */
  eyebrow?: string;
  title: string;
  excerpt: string;
  description?: string;
  body: RichTextBlock[];
  sections: SitePageSection[];
  sectionSubnav?: NavigationItem[];
  seo: SeoMetadata;
}

export interface ArticleFilters {
  query?: string;
  category?: string;
  topic?: string;
  language?: ContentLanguageCode;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export interface MessageFilters {
  query?: string;
  theme?: string;
  topic?: string;
  author?: string;
  language?: ContentLanguageCode;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export interface BookFilters {
  query?: string;
  category?: string;
  author?: string;
  topic?: string;
  language?: ContentLanguageCode;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export interface PodcastFilters {
  query?: string;
  topic?: string;
  page?: number;
  perPage?: number;
}

export interface ClergyQuestionFilters {
  query?: string;
  category?: string;
  topic?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export interface EventFilters {
  query?: string;
  topic?: string;
  upcomingOnly?: boolean;
  page?: number;
  perPage?: number;
}

export interface PrayerRequestFilters {
  query?: string;
  country?: string;
  page?: number;
  perPage?: number;
}

export interface PageResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextPage: number | null;
  };
}

export interface SearchResult {
  id: number;
  uuid: string;
  type: ResourceType;
  title: string;
  excerpt: string;
  href: string;
  image?: MediaAsset;
  publishedAt?: IsoDateString;
  authorName?: string;
  matchedTerms: string[];
}

export interface SearchFilters {
  types?: ResourceType[];
  limit?: number;
}

export interface RecentResource {
  type: ResourceType;
  title: string;
  excerpt: string;
  href: string;
  image?: MediaAsset;
  publishedAt?: IsoDateString;
  authorName?: string;
  resourceId: number;
}

/**
 * Contract consumed by pages. A Laravel-backed implementation can preserve
 * these async signatures while keeping route components independent of API details.
 */
export interface ContentRepository {
  getSiteConfig(): Promise<SiteConfig>;
  getNavigation(menuKey: NavigationMenuKey): Promise<NavigationMenu | undefined>;
  getSitePageBySlug(slug: string): Promise<SitePage | undefined>;
  getAboutPages(): Promise<SitePage[]>;
  getAuthors(): Promise<Author[]>;
  getAuthorBySlug(slug: string): Promise<Author | undefined>;
  getThemes(): Promise<MonthlyTheme[]>;
  getCurrentTheme(): Promise<MonthlyTheme | undefined>;
  getArticles(filters?: ArticleFilters): Promise<PageResult<ArticleWithRelations>>;
  getArticleBySlug(slug: string): Promise<ArticleWithRelations | undefined>;
  getFeaturedArticle(): Promise<ArticleWithRelations | undefined>;
  getRelatedArticles(articleId: number, limit?: number): Promise<ArticleWithRelations[]>;
  getMessages(filters?: MessageFilters): Promise<PageResult<MessageWithRelations>>;
  getMessageBySlug(slug: string): Promise<MessageWithRelations | undefined>;
  getBooks(filters?: BookFilters): Promise<PageResult<BookWithRelations>>;
  getBookBySlug(slug: string): Promise<BookWithRelations | undefined>;
  getRelatedBooks(bookId: number, limit?: number): Promise<BookWithRelations[]>;
  getBookCategories(): Promise<BookCategory[]>;
  getPodcasts(filters?: PodcastFilters): Promise<PageResult<PodcastWithRelations>>;
  getPodcastBySlug(slug: string): Promise<PodcastWithRelations | undefined>;
  getClergyQuestions(filters?: ClergyQuestionFilters): Promise<PageResult<ClergyQuestionWithRelations>>;
  getClergyQuestionBySlug(slug: string): Promise<ClergyQuestionWithRelations | undefined>;
  getPrayerRequests(filters?: PrayerRequestFilters): Promise<PageResult<PrayerRequest>>;
  getEvents(filters?: EventFilters): Promise<PageResult<EventWithRelations>>;
  getEventBySlug(slug: string): Promise<EventWithRelations | undefined>;
  getAdvertisements(placement: AdvertisementPlacement): Promise<Advertisement[]>;
  getTeamMembers(): Promise<TeamMember[]>;
  getDonationCampaign(): Promise<DonationCampaign>;
  getCommunityOffering(): Promise<CommunityOffering>;
  getAboutPage(slug: string): Promise<SitePage | undefined>;
  getRecentResources(limit?: number): Promise<RecentResource[]>;
  searchResources(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
}
