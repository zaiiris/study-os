# Study OS

Local-first personal dashboard for ZIYADA's study planning, exam preparation, university applications, competitions, projects, resources, and deadlines.

## Highlights

- English and Russian interface with a persistent language switcher
- Live editable countdowns for SAT, IELTS, and the main application deadline
- Editable monthly calendar, Monday-to-Sunday weekly view, and focus timer
- Tasks, universities, admissions timeline, competitions, projects, and resources
- Detailed university pages with deadlines, requirements, tests, scholarships, notes, and document checklists
- Complete Fall 2027 admissions audit for ZIYADA's 15 universities, including the original university-by-university research and official links
- University filters for country, Fall 2027 publication status, funding strength, test policy, application platform, and personal status
- Chronological confirmed-deadline timeline plus the audit's master calendar, test comparison, fees, funding comparison, and document checklist
- Competition table with search, filters, inline editing, statistics, and bulk text import
- IndexedDB persistence: personal data stays in the browser
- Task and record creation, editing, completion, and deletion
- JSON backup and restore
- Responsive desktop and mobile layouts
- Offline service worker and installable web-app manifest
- No authentication and no external database

## Technology

- React 19
- TypeScript
- Tailwind CSS 4
- Vinext / Vite
- IndexedDB
- Shadcn-compatible accessible UI primitives

## How to run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

Windows: double-click `START_STUDY_OS.bat` in this folder. It works after moving
the project, reuses an already-running Study OS, and reports a conflicting port
instead of silently changing the address. Keep its window open while using the
site. Node.js 22.13+ and an initial `npm install` are required.

`localhost` needs the local server to be running; a bookmark does not start it.
Connection refused normally means the server stopped. This launcher is not an
installer and does not configure Windows auto-start. Existing `Open Study OS.cmd`
and autostart helper files remain portable, but no new scheduled task was created.

Always use **http://localhost:5173**, the same browser and browser profile. IndexedDB
is tied to that origin/profile; `127.0.0.1`, another port or a private window has
separate storage. Server restart and code updates do not clear IndexedDB. Do not
clear site data to fix a startup problem. Export a Settings JSON backup before
moving browsers/devices. Production offline support caches visited routes;
first install/build needs dependencies, and development is not a substitute for
a running local server.

Build the production version:

```bash
npm run build
```

## Privacy

Study OS is designed as a device-local application. Study records are stored in IndexedDB and are not sent to an external service. Use the JSON backup feature to move or protect your data.

## Admissions data and privacy

All 15 universities use the supplied October 4, 2026 audits. A current audit date
does not mean all Fall 2027 deadlines are published: TBA remains TBA and old-cycle
dates are labelled references. Batch 3 updates only CMU-Q, Qatar University,
UDST, NYU Abu Dhabi and Nazarbayev University. Batch 1/2 JSON bytes are protected
by `data/batch12-integrity.json`. The twelve detail tabs and aggregates read the
same records; personal progress lives in the separate IndexedDB progress store.

Batch 3 import (local supplied source, not admissions research):

```powershell
node scripts/admissions-batch3.mjs "C:\path\to\OFFICIAL_2027-10-04.md"
```

Reviewed source fingerprints protect positional translations from reuse against
changed text. Legacy full import/localization scripts refuse to run after Batch 3
because they would restore older records. Tests rebuild Batch 3 from the retained
structured source text in memory, so they need no ignored audit file and do not
write to the real browser database.

Fees stay in university currency. `lib/admissions-currency.ts` centralises optional
KZT display; its rates are deliberately empty until a reliable source and rate
date are supplied. Approximate conversions use `≈`, date and source, never replace
the native fee. Conditional tariffs/waivers remain explicit.

Original supplied Markdown audits, backups, caches and build outputs are ignored
by Git. Structured records contain public admission facts plus applicant-tailored
NIS/Kazakhstan strategy and draft questions. Review them before making a public
repository. They do **not** contain browser progress, entered recommender names,
document readiness or personal notes. Git is not an IndexedDB backup.

## Verification

```bash
npm run typecheck
npm run lint
npm run test:admissions
npm run build
```

## First GitHub push

No repository is published automatically. After creating your GitHub repository,
use its exact URL (prefer an empty repository without a second initial README):

```bash
git remote -v
git remote add origin <YOUR_EXACT_GITHUB_REPOSITORY_URL>
git push -u origin main
```

If `origin` already exists, verify it belongs to the intended repository before
changing it or pushing. Never commit `.env`, tokens, local backups or browser data.

If Git reports **dubious ownership** for this trusted local checkout, use a
per-command exception rather than disabling the check for all repositories:

```powershell
$studyRepo = (Get-Location).Path
git -c "safe.directory=$studyRepo" remote -v
git -c "safe.directory=$studyRepo" remote add origin <YOUR_EXACT_GITHUB_REPOSITORY_URL>
git -c "safe.directory=$studyRepo" push -u origin main
```

Use this only while inside the intended project. No global ownership-check
setting is modified by the project or its launchers.
