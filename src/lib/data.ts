/**
 * Public content access point. Laravel is the sole implementation behind this
 * module; route components keep a stable, framework-neutral display contract.
 */
import { laravelContentRepository as contentRepository } from "@/lib/laravelContentRepository";

export { contentRepository };

export const getHomePage = async () => ({
  featuredArticle: await contentRepository.getFeaturedArticle(),
  recentResources: await contentRepository.getRecentResources(),
  currentTheme: await contentRepository.getCurrentTheme(),
});

export const getArticles = contentRepository.getArticles.bind(contentRepository);
export const getArticleBySlug = contentRepository.getArticleBySlug.bind(contentRepository);
export const getMessages = contentRepository.getMessages.bind(contentRepository);
export const getBooks = contentRepository.getBooks.bind(contentRepository);
export const getPodcasts = contentRepository.getPodcasts.bind(contentRepository);
export const getClergyQuestions = contentRepository.getClergyQuestions.bind(contentRepository);
export const getPrayerRequests = contentRepository.getPrayerRequests.bind(contentRepository);
export const getEvents = contentRepository.getEvents.bind(contentRepository);
export const getAdvertisements = contentRepository.getAdvertisements.bind(contentRepository);
export const searchContent = contentRepository.searchResources.bind(contentRepository);
