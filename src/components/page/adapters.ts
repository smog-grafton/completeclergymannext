import type {
  ArticleWithRelations,
  Author,
  BookWithRelations,
  ClergyQuestionWithRelations,
  EventWithRelations,
  MessageWithRelations,
  PodcastWithRelations,
  RecentResource,
} from "@/types";
import type { EditorialAuthor, EditorialResource, PodcastResource } from "@/components/editorial";

export function toEditorialAuthor(author?: Author): EditorialAuthor | undefined {
  if (!author) return undefined;
  return {
    id: String(author.id),
    name: author.name,
    slug: author.slug,
    role: author.role,
    photo: author.portrait?.url,
    bio: author.shortBio,
  };
}

export function toArticleResource(article: ArticleWithRelations): EditorialResource {
  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage.url,
    imageAlt: article.coverImage.alt,
    kind: "article",
    author: toEditorialAuthor(article.author),
    category: article.category.name,
    topics: article.topics.map((topic) => topic.name),
    language: article.language,
    publishedAt: article.publishedAt,
    readingTime: article.readingTimeMinutes,
    audioUrl: article.audio?.url,
    audioDuration: article.audio?.durationSeconds,
    href: `/articles/${article.slug}`,
  };
}

export function toMessageResource(message: MessageWithRelations): EditorialResource {
  return {
    id: String(message.id),
    slug: message.slug,
    title: message.title,
    excerpt: message.excerpt,
    coverImage: message.coverImage.url,
    imageAlt: message.coverImage.alt,
    kind: "message",
    author: toEditorialAuthor(message.author),
    topics: message.topics.map((topic) => topic.name),
    language: message.language,
    publishedAt: message.publishedAt,
    readingTime: message.readingTimeMinutes,
    audioUrl: message.audio?.url,
    audioDuration: message.audio?.durationSeconds,
    href: `/messages/${message.slug}`,
  };
}

export function toPodcastResource(podcast: PodcastWithRelations): PodcastResource {
  return {
    id: String(podcast.id),
    slug: podcast.slug,
    title: podcast.title,
    description: podcast.description,
    artwork: podcast.artwork.url,
    imageAlt: podcast.artwork.alt,
    kind: "podcast",
    episodeNumber: podcast.episodeNumber,
    host: podcast.host.name,
    guest: podcast.guestName,
    duration: podcast.durationSeconds,
    publishedAt: podcast.publishedAt,
    href: `/podcasts/${podcast.slug}`,
    youtubeUrl: podcast.youtubeUrl,
  };
}

export function toQuestionResource(question: ClergyQuestionWithRelations): EditorialResource {
  return {
    id: String(question.id),
    slug: question.slug,
    title: question.shortQuestion,
    excerpt: question.excerpt,
    kind: "answer",
    author: toEditorialAuthor(question.answeredBy),
    category: question.category.name,
    topics: question.topics.map((topic) => topic.name),
    publishedAt: question.publishedAt,
    href: `/ask-the-clergy/${question.slug}`,
  };
}

export function toEventResource(event: EventWithRelations): EditorialResource {
  return {
    id: String(event.id),
    slug: event.slug,
    title: event.title,
    excerpt: event.shortDescription,
    coverImage: event.image.url,
    imageAlt: event.image.alt,
    kind: "event",
    publishedAt: event.startsAt,
    href: `/events/${event.slug}`,
  };
}

export function recentToEditorialResource(resource: RecentResource): EditorialResource {
  return {
    id: String(resource.resourceId),
    slug: resource.href.split("/").pop() ?? String(resource.resourceId),
    title: resource.title,
    excerpt: resource.excerpt,
    kind: resource.type === "clergy-answer" ? "answer" : resource.type,
    coverImage: resource.image?.url,
    imageAlt: resource.image?.alt,
    publishedAt: resource.publishedAt,
    author: resource.authorName ? { id: resource.authorName, name: resource.authorName } : undefined,
    href: resource.href,
  };
}

export function toBookResource(book: BookWithRelations): EditorialResource {
  return {
    id: String(book.id),
    slug: book.slug,
    title: book.title,
    excerpt: book.shortDescription,
    kind: "book",
    authors: book.authors.map(toEditorialAuthor).filter((author): author is EditorialAuthor => Boolean(author)),
    category: book.categories[0]?.name,
    topics: book.topics.map((topic) => topic.name),
    language: book.language,
    publishedAt: book.publishedAt,
    href: `/books/${book.slug}`,
  };
}
