---
gse:
  type: review
  sprint: 1
  branch: main
  status: draft
  created: "2026-04-23"
  updated: "2026-04-23"
  traces:
    derives_from: [TASK-002]
---

# Review — Sprint 1

Scope: TASK-002 (Events pages static site + Playwright E2E tests)

## Findings

RVW-001:
  severity: HIGH
  perspective: security-auditor
  location:
    branch: main
    file: app/js/views/eventsList.js
    line: "cardsHtml/listHtml + filter rendering"
  finding: "DOM XSS risk: event data (title/description/city/category) is inserted into HTML via template strings and assigned with innerHTML without escaping."
  suggestion: "Escape all data fields (and option values) or build DOM nodes and use textContent. Apply the same to filter <option> rendering and the search input value."
  tags: [DESIGN-SECURITY]
  task: TASK-002

RVW-002:
  severity: HIGH
  perspective: requirements-analyst
  location:
    branch: main
    file: docs/sprints/sprint-01/reqs.md
    line: "REQ-006"
  finding: "REQ-006 (multilingual UI) is not implemented and conflicts with the design choice (v1 English-only)."
  suggestion: "Either (A) change Sprint 1 scope to English-only and defer multilingual to a later sprint, OR (B) implement multilingual strings + language switcher now."
  tags: []
  task: TASK-002

RVW-003:
  severity: MEDIUM
  perspective: requirements-analyst
  location:
    branch: main
    file: app/js/views/eventsList.js
    line: "week range calculation"
  finding: "“This week” is implemented as today..today+7 inclusive (8 days). Requirement says next 7 days rolling."
  suggestion: "Use today..today+6 inclusive, or switch to an exclusive end boundary; document the choice."
  tags: []
  task: TASK-002

RVW-004:
  severity: MEDIUM
  perspective: security-auditor
  location:
    branch: main
    file: app/js/views/eventDetails.js
    line: "ticketProvider.url link"
  finding: "Ticket provider URL is not validated; a malicious value like javascript: could be used if data source becomes untrusted."
  suggestion: "Allow only http/https URLs (and optionally allowlist known hosts). If invalid, hide/disable the Tickets button."
  tags: []
  task: TASK-002

RVW-005:
  severity: MEDIUM
  perspective: ux-advocate
  location:
    branch: main
    file: app/index.html
    line: "Destinations nav link"
  finding: "“Destinations” is visually disabled but may still be keyboard-focusable; confusing for keyboard users."
  suggestion: "Remove href and set tabindex=-1 when disabled, or route to a clear “Coming soon” page."
  tags: [UX-HEURISTIC]
  task: TASK-002

RVW-006:
  severity: MEDIUM
  perspective: ux-advocate
  location:
    branch: main
    file: app/css/styles.css
    line: "global styles"
  finding: "No explicit focus-visible styles; keyboard focus may be hard to see on the dark theme."
  suggestion: "Add :focus-visible outline styles for buttons, links, inputs, and selects."
  tags: [UX-HEURISTIC]
  task: TASK-002

RVW-007:
  severity: LOW
  perspective: code-reviewer
  location:
    branch: main
    file: tests/e2e/events.spec.js
    line: "missing assertions"
  finding: "Tests don’t directly assert soonest-first ordering or the date filters’ semantics (today/week/month)."
  suggestion: "Add at least one ordering assertion and one date-filter test (even with sample data)."
  tags: [IMPL]
  task: TASK-002

