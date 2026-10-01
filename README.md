# The Complete Clergyman — frontend

An editorial, mobile-first Next.js prototype for `completeclergyman.org`. It is intentionally built as a complete publishing experience before the Laravel API is connected.

## Run it

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

The development server is available at `http://localhost:3000` by default.

## Architecture

- `src/app` — App Router routes and page-level metadata.
- `src/components/layout` — announcement, global navigation, desktop push drawer, mobile navigation, footer, section subnavigation.
- `src/components/editorial`, `books`, `advertising`, `forms` — reusable content and interactive components.
- `src/data/mock` — deterministic, seed-friendly prototype records; no content is embedded into JSX page layouts.
- `src/lib/data.ts` — the only page-facing content repository. Its async `ContentRepository` interface is the Laravel migration boundary.
- `src/types/content.ts` — stable DTO-shaped models shared by data and presentation layers.

## Design system

Global tokens live in `src/app/globals.css`: burgundy `#A00035`, gold `#C48B00`, warm off-white, restrained borders, editorial serif headings, and sharp surfaces. The primary logo is [logo-cleryman.png](public/images/logos/logo-cleryman.png) and is rendered with its original 1774×887 dimensions through `next/image`, then constrained by CSS in the header and footer.

## Mock data

The prototype includes realistic 2026 resource records: 20 articles, 10 authors, 10 messages, 6 themes, 30 books, 10 podcast episodes, 10 clergy answers, 15 moderated prayer requests, 6 events, 8 advertisements, and 7 team members. Temporary editorial photography is centrally declared in the mock records and uses the configured Unsplash host.

Forms, playback, donations, checkout, account library, and prayer interactions are deliberately simulated. They do not process payments, authenticate users, upload files, or persist private information.

## Laravel connection

`src/lib/laravelContentRepository.ts` preserves the page-facing `ContentRepository` contract while reading public editorial collections from Laravel whenever `NEXT_PUBLIC_API_URL` is set. Use `http://127.0.0.1:8765` with `php artisan serve`, or an XAMPP virtual host whose document root is `clergyman-lara/public`. The fixture repository remains only as an offline visual-development fallback; route components never consume raw API JSON. See [docs/BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md).

## Main route areas

- Editorial: `/`, `/articles`, `/messages`, `/podcasts`, `/search`
- Digital books: `/books`, `/books/[slug]`, `/books/[slug]/read`, `/books/[slug]/audio`, `/checkout`, `/account/library`
- Community: `/ask-the-clergy`, `/prayer-wall`, `/events`, `/community`, `/join`, `/give`
- Organisation: `/about` and its contextual subpages, `/features`, `/privacy`, `/terms`

All content pages retain public access. Future accounts add personal features rather than gating the resource library.
