---
gse:
  type: requirement
  sprint: 1
  branch: gse/sprint-01/integration
  elicitation_summary: |
    You want an events-first Luxembourg guide web app. Visitors should browse events, open event details,
    and filter by date (today / this week / this month), city (Luxembourg), and category (Music / Cultural festival / Seasonal event).
    The events list should be sorted by soonest upcoming first. Tickets are v1 redirect-only via official providers
    (Luxembourg Ticket: https://www.luxembourg-ticket.lu/). You also want multilingual UI and a search box on the events list.
  traces:
    derives_from: [PLN-001, INT-001, TASK-002]
    decided_by: []
  status: draft
  created: "2026-04-23"
  updated: "2026-04-23"
---

# Requirements — Sprint 1

## Functional Requirements

### REQ-001 — Events-first home page (list view)

- **Type:** functional
- **Actor:** Visitor (tourist or local)
- **Capability:** See an events list as the first page, sorted by soonest upcoming first
- **Rationale:** Visitors quickly find what’s happening next
- **Priority:** Must
- **Acceptance Criteria:**
  1. When the visitor opens the app, the first page shows an events list.
  2. The list is sorted by the earliest upcoming `startDate` first (soonest first).
  3. Each list item shows: title, date(s), city, category, and a short description.
- **Traces:** implements (—) | tested_by (—)

### REQ-002 — Event details page

- **Type:** functional
- **Actor:** Visitor
- **Capability:** Open an event and view full details
- **Rationale:** Visitors need enough information to decide to attend
- **Priority:** Must
- **Acceptance Criteria:**
  1. From the events list, the visitor can open an event details page.
  2. The details page shows: title, date range, city, venue, category, description, and tags (if present).
- **Traces:** implements (—) | tested_by (—)

### REQ-003 — Filters (date range, city, category)

- **Type:** functional
- **Actor:** Visitor
- **Capability:** Filter events by date range, city, and category
- **Rationale:** Visitors can quickly narrow the list
- **Priority:** Must
- **Acceptance Criteria:**
  1. The visitor can select a date filter: Today / This week / This month.
  2. The visitor can filter by city (starting with “Luxembourg” for v1).
  3. The visitor can filter by category: Music / Cultural festival / Seasonal event.
  4. Changing any filter updates the visible list to match the selected filters.
- **Traces:** implements (—) | tested_by (—)

### REQ-004 — Search box on events list

- **Type:** functional
- **Actor:** Visitor
- **Capability:** Search events by keywords (title/description)
- **Rationale:** Quick finding without browsing long lists
- **Priority:** Should
- **Acceptance Criteria:**
  1. The events list page has a search input.
  2. Typing a query filters results to events whose title or description contains the query (case-insensitive).
- **Traces:** implements (—) | tested_by (—)

### REQ-005 — Ticket booking link (redirect)

- **Type:** functional
- **Actor:** Visitor
- **Capability:** Go to an official ticket provider website to book/buy tickets
- **Rationale:** Safe v1 booking approach without payment/security scope
- **Priority:** Should
- **Acceptance Criteria:**
  1. On an event details page, if `ticketProvider.url` exists, show a clear “Tickets / Book” button.
  2. Clicking the button opens the provider website (e.g., Luxembourg Ticket: https://www.luxembourg-ticket.lu/).
- **Traces:** implements (—) | tested_by (—)

### REQ-006 — Multilingual UI (v1)

- **Type:** functional
- **Actor:** Visitor
- **Capability:** Use the app in multiple languages
- **Rationale:** Visitors from any country can use it easily
- **Priority:** Should
- **Acceptance Criteria:**
  1. The app supports more than 2 UI languages (exact list to be decided in DESIGN/implementation).
  2. The visitor can switch language in the UI.
- **Traces:** implements (—) | tested_by (—)

## Non-Functional Requirements

### REQ-101 — Performance

- **Type:** non-functional
- **Metric:** Page load and filtering responsiveness
- **Target:** Events list renders and responds to filter changes within 1 second on a typical laptop
- **Measurement:** Manual check during development + simple performance measurement in browser devtools
- **Priority:** Should

### REQ-102 — Security (redirect booking)

- **Type:** non-functional
- **Metric:** Safe external redirects
- **Target:** Only open URLs from the event data’s `ticketProvider.url` (no arbitrary user input)
- **Measurement:** Code review + tests (later) verifying link handling
- **Priority:** Must

### REQ-103 — Accessibility

- **Type:** non-functional
- **Metric:** Keyboard and screen-reader basics
- **Target:** All main interactions (open event, filters, search, tickets button) are keyboard usable
- **Measurement:** Manual keyboard test + browser accessibility checks
- **Priority:** Should

## Traceability Matrix

| Req ID  | Design | Tests | Status |
|---------|--------|-------|--------|
| REQ-001 |        |       | draft  |
| REQ-002 |        |       | draft  |
| REQ-003 |        |       | draft  |
| REQ-004 |        |       | draft  |
| REQ-005 |        |       | draft  |
| REQ-006 |        |       | draft  |
| REQ-101 |        |       | draft  |
| REQ-102 |        |       | draft  |
| REQ-103 |        |       | draft  |

## Open Questions

1. Which exact UI languages should v1 include (e.g., English/French/German)?
2. Should “This week” mean Monday–Sunday, or the next 7 days?
