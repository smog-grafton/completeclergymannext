# Laravel integration contract

`src/lib/laravelContentRepository.ts` is the live Laravel adapter. Set `NEXT_PUBLIC_API_URL` to activate it; when the value is absent, the fixture repository remains available for isolated visual-development work.

## Global configuration

The frontend expects backend-editable site data rather than fixed JSX:

- `GET /api/v1/settings` — backend-editable public settings.
- `GET /api/v1/navigation/{location}` — `primary`, `features`, `drawer`, and footer menus; items should retain stable IDs, labels, hrefs, descriptions, and order.
- `GET /api/v1/pages/{slug}` — About page copy, controlled page sections, and contextual secondary navigation.

Public media should be returned as full URLs. Do not make frontend components build `/storage/...` URLs themselves.

## Editorial endpoints

The repository shapes map directly to the frontend DTOs:

- `GET /api/v1/home`
- `GET /api/v1/articles`, `GET /api/v1/articles/{slug}`
- `GET /api/v1/messages`, `GET /api/v1/messages/{slug}`
- `GET /api/v1/books`, `GET /api/v1/books/{slug}`
- `GET /api/v1/podcasts`, `GET /api/v1/podcasts/{slug}`
- `GET /api/v1/ask`, `GET /api/v1/ask/{slug}`
- `GET /api/v1/prayer-requests`, `GET /api/v1/events`, `GET /api/v1/events/{slug}`
- `GET /api/v1/search?q=`

Lists should expose pagination metadata (`page`, `per_page`, `total`, `last_page`, `next_page_url` or their existing repository equivalent). This is especially important for the infinite book catalogue.

## Public write endpoints

Connect these only when Laravel validation and rate limits exist:

- `POST /api/v1/submissions/messages`
- `POST /api/v1/submissions/questions`
- `POST /api/v1/submissions/prayer-requests`
- `POST /api/v1/prayer-requests/{id}/pray`
- `POST /api/v1/events/{slug}/registrations`
- `POST /api/v1/subscriptions`
- `POST /api/v1/partner-applications`
- `POST /api/v1/donation-intents`

Return structured validation errors keyed by input name. Never expose submitted prayer contact details, unpublished questions, rejected submissions, or draft content through public resources.

## Storage

Use Laravel disks and paths, never machine-specific absolute paths. Public images may use the `public` disk and `storage:link`; paid book files must remain private and be served only after entitlement checks. Suggested directories: `articles/images`, `articles/pdfs`, `articles/audio`, `books/covers`, `books/samples`, `podcasts/artwork`, `events/images`, `advertisements`, and `team`.

## Migration order

1. Create relationships, policies, RBAC, migrations, and deterministic seeders from `src/data/mock`.
2. Seed and verify public API Resources and media URL responses.
3. Enable the API adapter through `NEXT_PUBLIC_API_URL` while preserving `ContentRepository` methods.
4. Verify all frontend routes, filters, forms, search, and infinite loading against Laravel.
5. Remove obsolete production mock arrays only after the API path is complete. Keep test fixtures separate.
