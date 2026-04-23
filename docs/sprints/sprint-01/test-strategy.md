---
gse:
  type: test
  sprint: 1
  branch: gse/sprint-01/integration
  traces:
    derives_from: [TASK-002, PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-101, REQ-102, REQ-103]
    decided_by: [DEC-001]
  status: draft
  created: "2026-04-23"
  updated: "2026-04-23"
---

# Test Strategy — Sprint 1

## Test Strategy

- **Domain:** web (static HTML/CSS/JS)
- **Approach:** simple automated browser tests (E2E) + a few unit tests for filter/search logic
- **Framework (planned):** Playwright (`@playwright/test`)
- **Evidence:** screenshots on every E2E test (and screenshots on failure)

## Test pyramid (v1)

- **Unit:** 30% (filter/search/date-range logic)
- **E2E:** 65% (user flows in browser)
- **Policy:** 5% (simple checks like “no inline scripts loading from unknown sources” — optional)

## Test data

| Dataset | Purpose | Location |
|---|---|---|
| Sample events | predictable UI + filter/search tests | `data/events.sample.json` |
| Sample destinations | not used in Sprint 1 tests (later) | `data/destinations.sample.json` |

## End-to-End tests (browser)

### TST-020 — Home page shows events list first (cards default)

- **Implements:** REQ-001
- **User flow:** Open the site → see events list as first page
- **Preconditions:** site can load sample data
- **Steps:**
  1. Open `index.html`
  2. Verify events list is visible
  3. Verify Cards view is selected by default
- **Success criteria:** list renders and shows at least 1 event card

### TST-021 — Sorting is soonest upcoming first

- **Implements:** REQ-001
- **Steps:**
  1. Open home page
  2. Read the first 3 event dates displayed
  3. Verify they are ordered by earliest `startDate`
- **Success criteria:** displayed order matches date order from dataset

### TST-022 — Filters (Today / This week / This month)

- **Implements:** REQ-003
- **Steps:**
  1. Select “Today”
  2. Verify only events matching today are shown (or empty state is shown)
  3. Select “This week” and verify it means next 7 days rolling
  4. Select “This month” and verify results match current month
- **Success criteria:** list updates correctly for each date filter

### TST-023 — Filter by category and city

- **Implements:** REQ-003
- **Steps:**
  1. Pick category “Music” → only Music events show
  2. Pick city “Luxembourg” → only Luxembourg city events show
- **Success criteria:** list matches selected filters

### TST-024 — Search filters by title/description

- **Implements:** REQ-004
- **Steps:**
  1. Type a keyword that exists in a known sample event
  2. Verify only matching events are shown
- **Success criteria:** case-insensitive match on title/description

### TST-025 — Open event details and ticket button redirects

- **Implements:** REQ-002, REQ-005, REQ-102
- **Steps:**
  1. Open an event details page
  2. Verify details fields exist
  3. Click “Tickets / Book”
  4. Verify it opens `https://www.luxembourg-ticket.lu/` (new tab)
- **Success criteria:** correct redirect target, safe link attributes

## Unit tests (optional but helpful)

### TST-001 — Date range helper: “This week” means next 7 days rolling

- **Implements:** REQ-003
- **Component:** date filtering helper
- **Given:** today = fixed date
- **When:** compute the “this week” range
- **Then:** range end = today + 7 days (inclusive rules defined in implementation)

## Notes

- We’ll implement Playwright setup during PRODUCE (adds `package.json`, installs Playwright, and writes tests).
- First evidence target: at least one screenshot per E2E test run.
