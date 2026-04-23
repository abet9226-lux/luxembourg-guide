---
gse:
  type: preview
  sprint: 1
  branch: gse/sprint-01/integration
  status: draft
  created: "2026-04-23"
  updated: "2026-04-23"
  traces:
    derives_from: [TASK-002, PLN-001]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006]
    decided_by: [DEC-001]
preview_variant: static
---

# Preview — Sprint 1 (Events pages)

## Pages & navigation (static site)

- **Home**: Events list (default view: **Cards**)
- **Event details**: open a specific event
- **Destinations**: (later sprint) link in the top navigation

Top navigation:
- Logo / title: “Luxembourg Guide”
- Links: Events, (later) Destinations
- Controls (right side): Language (v1: EN), View toggle (Cards / List)

## Events list (Home) — Cards view (default)

Layout:

```
┌──────────────────────────────────────────────────────────────┐
│ Luxembourg Guide                      [EN]  [Cards|List]     │
├──────────────────────────────────────────────────────────────┤
│ Search: [____________________]                                │
│ Date:   (Today) (This week) (This month)                      │
│ City:   [Luxembourg ▼]   Category: [All ▼]                     │
├──────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌───────────────────────┐        │
│  │ Summer Jazz Night      │  │ Winter Lights Festival │        │
│  │ Jun 18, 2026           │  │ Dec 05–Dec 20, 2026    │        │
│  │ Esch-sur-Alzette       │  │ Luxembourg City        │        │
│  │ Category: Music        │  │ Category: Cultural     │        │
│  │ Evening jazz concert…  │  │ Light installations…   │        │
│  │ [View details]         │  │ [View details]         │        │
│  └───────────────────────┘  └───────────────────────┘        │
│  ... more cards ...                                           │
└──────────────────────────────────────────────────────────────┘
```

Behavior:
- Default sort: **soonest upcoming first**
- Search matches **title + description** (case-insensitive)
- Filters update list immediately
- Category dropdown: All / Music / Cultural festival / Seasonal event

## Events list — List/Table view (toggle)

Layout:

```
┌──────────────────────────────────────────────────────────────┐
│ Luxembourg Guide                      [EN]  [Cards|List]     │
├──────────────────────────────────────────────────────────────┤
│ Search + filters (same as cards)                              │
├──────────────────────────────────────────────────────────────┤
│ Date        Title                    City            Category │
│ 2026-05-10  Spring Food Market       Luxembourg City  Seasonal │
│ 2026-06-18  Summer Jazz Night        Esch-sur-Alzette Music    │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

Behavior:
- Clicking a row opens Event details

## Event details page

Layout:

```
┌──────────────────────────────────────────────────────────────┐
│ Luxembourg Guide                      [EN]  [Cards|List]     │
├──────────────────────────────────────────────────────────────┤
│ ← Back to events                                              │
│ Title: Summer Jazz Night                                      │
│ Date:  2026-06-18                                             │
│ City:  Esch-sur-Alzette                                       │
│ Venue: Cultural Hall                                          │
│ Category: Music                                               │
│ Tags: music, night                                            │
│                                                              │
│ Description: ...                                              │
│                                                              │
│ [Tickets / Book]  → opens https://www.luxembourg-ticket.lu/    │
│ [Open map]        → opens Google Maps / OpenStreetMap         │
└──────────────────────────────────────────────────────────────┘
```

## UX Notes

- Filters and search stay visible and easy on mobile (stack vertically).
- Buttons large enough for touch (tourists on phones).

## Inform-tier Decisions

- Default view is **Cards**, with a toggle to List view.
- Preview is a static wireframe (no scaffold) to keep setup simple for a static-site build.
