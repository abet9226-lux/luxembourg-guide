---
gse:
  type: test
  sprint: 1
  branch: main
  traces:
    derives_from: [TASK-002]
    implements: [REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-102]
    decided_by: [DEC-001]
  status: approved
  created: "2026-04-23"
  updated: "2026-04-23"
---

# Test Definitions — Sprint 1

## End-to-End Tests (Playwright)

### TST-020 — Home shows events list first (cards default)

- **Implements:** REQ-001
- **Given:** The site is opened
- **When:** The visitor loads `app/index.html#/events`
- **Then:** Events list is visible and Cards view is default

### TST-021 — List toggle shows table view

- **Implements:** REQ-001
- **Given:** Events page is open
- **When:** Visitor switches to List view
- **Then:** A table/list view is shown

### TST-022 — Search filters by keywords

- **Implements:** REQ-004
- **Given:** Events page is open
- **When:** Visitor searches for a keyword
- **Then:** Only matching events are shown

### TST-023 — Category filter works

- **Implements:** REQ-003
- **Given:** Events page is open
- **When:** Visitor selects category “Music”
- **Then:** Only Music events are shown

### TST-024 — Event details + ticket link

- **Implements:** REQ-002, REQ-005, REQ-102
- **Given:** Events page is open
- **When:** Visitor opens an event and clicks Tickets / Book
- **Then:** Ticket provider link opens as an external https/http URL in a new tab

## Notes

- Test execution evidence is recorded in `docs/sprints/sprint-01/test-reports/`.
