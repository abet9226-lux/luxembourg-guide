---
gse:
  type: design
  sprint: 1
  branch: gse/sprint-01/integration
  status: draft
  created: "2026-04-23"
  updated: "2026-04-23"
  traces:
    derives_from: [TASK-002, PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-101, REQ-102, REQ-103]
    tested_by: []
    decided_by: [DEC-001]
---

# Design — Sprint 1 (Static Website)

## Scope (what this design covers)

This design covers:
- Events-first home page (list view) + sorting (REQ-001)
- Event details page (REQ-002)
- Filters (today / next 7 days / this month), city, category (REQ-003)
- Search box (REQ-004)
- Ticket provider redirect button (REQ-005)
- Multilingual UI (REQ-006) — **v1 languages: English only** (expand later)

## Component decomposition

Component: `DataStore`
- **Responsibility**: Load `data/events.sample.json` and provide normalized event objects.
- **Dependencies**: `fetch`, `Date` (browser)
- **Files**: `app/js/data.js`
- **Requirements**: REQ-001..REQ-005

Component: `Router`
- **Responsibility**: Switch between views (events list vs event details vs destinations later) without a server.
- **Mechanism**: `location.hash` routes, e.g. `#/events`, `#/events/evt-2026-0002`
- **Files**: `app/js/router.js`
- **Requirements**: REQ-001, REQ-002

Component: `EventsListView`
- **Responsibility**: Render list, filters, and search; apply sorting and filtering.
- **Files**: `app/js/views/eventsList.js`
- **Requirements**: REQ-001, REQ-003, REQ-004

Component: `EventDetailsView`
- **Responsibility**: Render event detail and “Tickets / Book” redirect button when present.
- **Files**: `app/js/views/eventDetails.js`
- **Requirements**: REQ-002, REQ-005, REQ-102

Component: `I18n`
- **Responsibility**: Provide UI strings in multiple languages and a language switcher.
- **Mechanism**: dictionary JSON per language; store selected language in `localStorage`.
- **Files**: `app/i18n/en.json`, `app/js/i18n.js`
- **Requirements**: REQ-006

Component: `UI`
- **Responsibility**: Shared UI helpers (DOM creation, escaping, formatting).
- **Files**: `app/js/ui.js`
- **Requirements**: cross-cutting

## Shared State

| Name | Scope (components) | Mechanism | Rationale | Traces |
|------|-------------------|-----------|-----------|--------|
| `route` | Router + views | `location.hash` | Controls which view is shown | REQ-001, REQ-002 |
| `events_filters` | EventsListView | in-memory + URL query params | Allows shareable filtered links and consistent list behavior | REQ-003, REQ-004 |
| `lang` | I18n + all views | `localStorage` + in-memory cache | Language must persist between pages | REQ-006 |

## Interface contracts

### `DataStore`

- `loadEvents(): Promise<Event[]>`
  - Loads and parses JSON dataset
  - Normalizes dates to `Date` objects
  - Errors: network error, JSON parse error

- `getEventById(id: string): Event | null`

### `Router`

- `start(): void` — attaches hashchange listener, renders the correct view
- Route formats:
  - `#/events`
  - `#/events/<eventId>`

### `EventsListView`

- `render(container: HTMLElement, state: ViewState): void`
- Filtering rules:
  - **Today**: startDate is today (local time) OR the date range includes today
  - **This week**: next 7 days rolling (today..today+7)
  - **This month**: events that start in the current month OR overlap the current month
  - City/category/search are applied on top
- Sorting: soonest upcoming first using startDate

### `EventDetailsView`

- `render(container: HTMLElement, eventId: string): void`
- Tickets button:
  - Only show if `ticketProvider.url` is present
  - Open in a new tab with `rel="noopener noreferrer"`

## Dependency graph

```
index.html
  └─ app/js/main.js
        ├─ router.js
        │    └─ views/*
        │         ├─ eventsList.js ── data.js, i18n.js, ui.js
        │         └─ eventDetails.js ─ data.js, i18n.js, ui.js
        ├─ data.js
        ├─ i18n.js ── app/i18n/en.json
        └─ ui.js
```

## Security notes

- External links (tickets/maps) must be taken only from trusted dataset fields.
- For ticket provider redirects, always open in new tab and prevent access to `window.opener` (`noopener`).

## Inform-tier Decisions

- Use hash-based routing (`location.hash`) instead of a server router for a zero-backend static site.
- Store language preference in `localStorage` so it persists across refreshes.
