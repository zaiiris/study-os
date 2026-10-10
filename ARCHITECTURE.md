# Study OS architecture

- `app/`: Dashboard route, section route shell, layout, and theme.
- `components/ui/`: Accessible reusable UI primitives for cards, tables, dialogs, forms, badges, progress, and navigation.
- `components/study-os/`: Study OS controls and offline service worker registration.
- `hooks/`: Browser data state and WebMCP integration.
- `lib/models.ts`: Typed domain models for the complete specification.
- `lib/indexed-db.ts`: Versioned IndexedDB access, persistence, and backup/restore.
- `public/`: Favicon, install manifest, and offline service worker.

All personal records stay in the browser. No authentication or external database is used.
