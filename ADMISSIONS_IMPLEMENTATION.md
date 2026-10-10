# Study OS — Admissions update, 4 October 2026

This document records the previous Batch 1 stage. The current bilingual/date/Batch 2 update and verification are documented in [ADMISSIONS_BATCH2_REPORT.md](./ADMISSIONS_BATCH2_REPORT.md); ten universities now use October data and five await Batch 3.

## Routes

- `/` retains tasks, SAT/IELTS countdowns, calendar/timer links and adds an admissions preparation summary.
- `/universities` displays all 15 universities with search, country/programme/application/evidence/funding/deadline filters and sorting.
- `/university/[id]` is a university workspace with 12 tabs: Overview, Deadlines, Application, Requirements, Documents, Essays, Recommendations, Funding, Programs, Housing, After Admission and Sources.
- `/applications` is the Admissions Overview, with preparation, outstanding materials, upcoming dates, funding actions, TBA and the structured cross-university audit summary.
- `/deadlines` is new: table/timeline, university/country/type/month/completion/official-target/evidence filters, 7/30-day, later, TBA and past views.
- `/documents` is new: derived document/essay/recommendation preparation, grouped recurring materials, shared statuses and notes, plus previously saved personal documents.
- `/projects` and `/results` are no longer routed or offered in desktop/mobile navigation. The projects database store and backups are preserved.
- Planner, tasks, competitions, resources, settings and profile editing are preserved.

## Components and data

New reusable admissions components: AdmissionsNav, EvidenceBadge, Choice, StatusChoice, Fact, FactsTable, AuditSection, PreparationItem, LocalNotes, AfterChecklist, DeadlineList and AdmissionsSummary. Existing cards, tables, Radix tabs/selects/dialogs, inputs and progress components are reused.

Official university data lives in `data/universities/*.json`, with shared summary data in `data/admissions-overview.json`. `lib/admissions-types.ts` defines evidence, structured sections/records, deadlines and separate personal progress. `lib/admissions-data.ts` owns the common date/progress engine.

`scripts/import-admissions.mjs` deterministically converts the supplied audit. All source paragraphs, list items and table cells are preserved in structured sections. The full university source section and original audit files are retained as backup/traceability, not used as the primary Markdown page interface.

October Batch 1: KAIST, POSTECH, DGIST, UNIST and GIST. All sections are preserved: snapshot, changes, programmes, official rounds, recommended timeline, platform/fees/editing, documents, NIS route, official minimums, test policies, competitive analysis, exams/interviews, recommendations, essays, scholarship awards, coverage/renewal/gaps, housing, after admission, strategic assessment, unresolved questions, email drafts and official sources. Shared executive summary, calendar, recommendation/test matrices, action plan and quality-control sections are retained.

Other ten universities retain September 13 facts and are explicitly marked awaiting October Batch 2/3 re-audit. Their detailed new checklist work remains pending that audit; previous-cycle or missing information is not turned into a confirmed 2027 requirement.

## Personal data and migration

IndexedDB `study-os` advances additively to version 6 with an `admissionsProgress` store. Application status, document/essay/recommendation readiness, teacher names, personal targets, completed deadlines and notes are separate from official facts.

Existing university/application data remains in its original stores and is retained in the migration snapshot. Matching document readiness and notes are migrated; user-created deadlines survive. Obsolete seeded deadline dates do not override October official dates. Saved projects remain exportable. Runtime profile clearing and repeated seed-ID deletion were removed.

Progress edits use an atomic IndexedDB read/modify/write transaction. Export includes the new store. Restore validates records before writing and uses one atomic multi-store transaction; older backup files do not erase stores they do not contain.

## Date and evidence rules

- Confirmed, partial, TBA and previous-cycle evidence are distinct from personal application status.
- Exact known times retain the published time and timezone. KAIST 22 October 18:00 KST = 09:00 UTC.
- A date without a published time does not acquire an invented 23:59 deadline. GIST's unpublished closing time/zone remains unknown.
- Published windows preserve both endpoints. Upcoming calculations use the end of the window and keep the full window visible.
- TBA/relative dates remain null and do not become next confirmed deadlines.
- Completed official events and their linked targets are excluded from upcoming preparation summaries.
- Analysis stays explicitly labelled and does not become an official minimum or acceptance statistic.

Notable TBA items: POSTECH exact 2027 guide/application/essay/recommendation rules, GIST fee/prompts and NIS diploma/apostille clarification, offer-specific final-document dates, interview details, 2027 housing allocations/rates and some claim/deposit procedures. Each university retains its audit's full unresolved-question list.

## Verification

- Build: `npm run build`.
- TypeScript: `npm run typecheck`.
- ESLint: `npm run lint`.
- Automated audit/date/migration/backup tests: `npm run test:admissions` (8 tests).
- Browser checks: university detail tabs, KAIST document-status save/reload, restoration of the temporary test mark, published essay prompts/limits, deadline TBA/search filters and responsive tablet layout.

The supplied audits are the factual source of truth. No fresh admissions research, external database, authentication, AI assistant, hosting or publishing was added. Sites guidance was used for the existing local preview and UI primitives only. No commit was created because the project folder is not a Git repository.
