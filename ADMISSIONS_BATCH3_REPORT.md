# Study OS — Batch 3 / local launch / Git / cards

Verified locally on 10 October 2026. Factual audit date: 4 October 2026.
Source: the user-supplied combined `OFFICIAL_2027-10-04.md`; no new admissions research.

## Data

- Imported only CMU-Q, Qatar University, UDST, NYU Abu Dhabi and Nazarbayev University.
- All 15 records now have `checkedAt: 2026-10-04`, with their own evidence status.
- Ten Batch 1/2 JSON files remain byte-for-byte identical to the protected hashes.
- Existing twelve detail tabs, aggregated deadlines/documents and personal-progress schema retained.
- Every nonstructural university source line/table cell is preserved in structured fields; shared Common App seven-option appendix added to the two relevant essay tabs as **paraphrases**, not exact official quotations or seven required essays.
- RU/EN fields extend the existing localization catalog; original programme/platform names and source wording remain accessible.
- An in-memory IndexedDB test verifies that notes, application status, document and essay states, teacher names, personal targets and completed deadlines survive rebuilding official records. Real browser stores were not cleared or migrated.

## Superseded September current facts / important clarifications

- CMU-Q: October re-verification of ED eligibility, RD credentials and separate QF grant workflow; unpublished supplement and grant-renewal terms remain unresolved rather than guessed.
- QU: previous-cycle document/decision references corrected to 26 March / 19 May 2026; scholarship-only visa route, Talent requirements and attested-copy/original conflict preserved. These dates are **not** new 2027 deadlines.
- UDST: advance tuition deposit is credited to tuition, not an extra visa charge; admission and Amiri minima distinguished; current housing package retained as reference.
- NYUAD: both computing degrees are BS; optional current supplement is 250 words maximum; STARS and Applicant Profile are separate; CSS renewal policy and selected IDOC 2025 income-year instructions replace old conflated explanations.
- NU: regular offer followed by separate Financial Support Application; paid acceptance stops funding consideration; regular NIS BBB differs from grant ABB. Certificate-year and ACT-date conflicts remain explicit.

## Remaining critical unknowns

- QU / UDST Fall 2027 calendars and permission for predicted NIS / June final results.
- CMU-Q exact supplement, NIS mapping/final-document date, renewal terms and current COA.
- NYUAD exact live form wording, NIS/ECE final verification and 2027 post-offer calendar; linked income PDF has a year conflict.
- NU exact category/report deadlines, eligibility of NIS certificates issued in 2027, disputed ACT date, grant stipend/renewal and housing for Kazakhstan citizens.
- Individual funding awards, summer coverage and family gaps are not invented.

## Launch and Git

Fresh `npm run dev` started successfully on 5173; direct main/admissions/document/university routes returned HTTP 200. Duplicate startup correctly detects the running Study OS. A bookmark alone cannot start a stopped development server. Portable Windows launchers use the same origin so restarting does not select a new IndexedDB store.

`.gitignore` excludes dependencies, build output, caches, raw supplied audits, environments and local backups. `.gitattributes` preserves JSON LF bytes across Windows checkout. Source hygiene scan found no known token/private-key/literal-credential patterns in tracked candidates; this is a scoped automated scan, not a guarantee against every possible secret. Applicant-tailored strategy remains in structured source: review before making a public repository.

Git initialized locally on `main`. No remote was configured and nothing was pushed. Existing configured Git author identity was used, not invented. Owner checks use a command-scoped exception for this exact trusted directory only; no global security setting changed.

## UI and verification

Cards show location, evidence, personal status, programme, at most two distinct actionable deadlines, native fee/platform and at most three requirement chips. Funding data/filters remain but the breakdown no longer dominates cards. KZT rates are empty until a dated source is supplied; future helper displays `≈`, date and source. Dates remain ISO internally and human-readable in presentation, including official EST/KST rather than a guessed local conversion.

Admissions tests: 28 passing. Typecheck, lint, production build and source hygiene passed. Build emits a non-fatal large-chunk warning. HTTP navigation/startup was verified. **Visual browser/mobile inspection and a real browser refresh/progress check could not be completed**: the browser-control runtime failed with the Windows sandbox helper error. Responsive structure was checked in code; do not treat that as screenshot-based QA.
