---
gse:
  type: compound
  sprint: 1
  branch: main
  traces:
    derives_from: [PLN-001, TASK-002, RVW-001, RVW-002, RVW-003, RVW-004, RVW-005, RVW-006, RVW-007]
  status: approved
  created: "2026-04-23"
  updated: "2026-04-23"
---

# Capitalization — Sprint 1

## Axis 1: Production Learnings

_What was learned during this sprint that improves future production._

### What Went Well

| Item | Impact | Reusable? |
|------|--------|-----------|
| Full lifecycle through DELIVER with tagged release v0.1.0 | Shipped usable events-first site | Yes |
| Playwright E2E on list, filters, details, tickets link | Caught regressions before release | Yes |
| Review → FIX loop closed HIGH findings (DOM XSS, URL validation, focus) | Safer UX before users | Yes |
| Static JSON + hash routing | Simple deploy, fast iteration | Yes |

### What Could Be Improved

| Item | Root Cause | Action |
|------|------------|--------|
| REQ-006 vs English-only v1 | Requirements not reconciled with design freeze before build | Mark deferred REQs explicitly in REQS + plan-summary before PRODUCE |
| “This week” date span | Ambiguous wording in REQ vs implementation | Define inclusive/exclusive end in REQS; add one E2E per boundary |
| Health / traceability scores low vs tests green | Spec IDs not threaded into tests/docs | Add REQ/TASK references in `tests/e2e` and campaign reports |

### Patterns Discovered

1. **Static shell + hash routes** — Single `index.html`, load views from `app/js/views/*`, data from `data/*.json`; good for GitHub Pages–style hosting.
2. **Untrusted text → DOM APIs** — Prefer `textContent` / `createElement` or a single escaping helper over `innerHTML` for any field that can hold punctuation or future API data.
3. **Outbound tickets** — Validate `http/https`, `rel="noopener noreferrer"`, and hide the control when the URL is invalid.

### Learning Notes Generated

| Note | Topic | Trigger |
|------|-------|---------|
| _(see profile learning_goals)_ | Playwright + static hash URLs | Sprint 1 E2E campaign |

## Axis 2: Methodology Capitalization

_What worked and what did not in the GSE-One methodology this sprint._

### Observations Gathered

| Observation | Source | Theme | Severity |
|-------------|--------|-------|----------|
| Multilingual REQ remained while design chose English-only v1 | RVW-002, `reqs.md` REQ-006 | Requirements–design alignment | HIGH |
| Review caught XSS and URL issues post-PRODUCE | RVW-001, RVW-004, `review.md` | Security shift-left timing | HIGH |
| Plan-summary shows no scope changes though REQ drift existed | `plan-summary.md` vs `review.md` | Coherence logging | MEDIUM |
| Sprint completed full `expected` activities including PREVIEW/TESTS | `plan-summary.md` | Methodology fit | LOW (positive) |

### Themes (Consolidated)

| Theme | Effective practices | Friction points | Missing capabilities | Improvement proposal |
|-------|---------------------|-----------------|----------------------|------------------------|
| Requirements–design alignment | Full REQS/DESIGN pipeline before code | Deferred scope (i18n) not marked in plan coherence | Explicit “deferred” REQ state | During PLAN, list non-goals; in REQS tag `status: deferred` with sprint target |
| Security shift-left | Formal REVIEW + FIX | Issues found late in cycle | Secure coding checklist at DESIGN | Add DESIGN-SECURITY checklist item: “no raw HTML interpolation from data” |

### Closure Gate Outcome

- **Observations collected:** 4
- **Themes identified:** 2
- **Route chosen:** local export (`github.enabled` is false; upstream tickets not offered)
- **References:**
  - `methodology-feedback.md`: **produced**
  - `compound-tickets-draft.yaml`: not produced

**Workflow ledger:** No raw `workflow_observations` entries for sprint 1 required condensation (ledger step skipped).

## Axis 3: Competency Capitalization

### Learning Notes Updated / Created

| LRN- | Topic | Source (sprint evidence) | Note file |
|------|-------|------------------------|-----------|
| — | Static site + hash routing | TASK-002 / `design.md` | `profile.yaml` → `competency_map` |
| — | Playwright E2E | Test campaign 2026-04-23 | `profile.yaml` → `competency_map` |

### Competency Map Updates

| Area | Before | After | Evidence |
|------|--------|-------|------------|
| Static web delivery | _(unset)_ | practicing | Shipped v0.1.0 events UI |
| Browser E2E (Playwright) | _(unset)_ | practicing | 5/5 tests after FIX |

### Proactive LEARN Proposals

1. **DOM XSS and safe rendering** — You fixed real HIGH findings this sprint; a short OWASP “DOM based XSS” overview would reinforce the pattern for TASK-003.
2. **Playwright + hash routers** — Optional deep-dive on stable `page.goto` URLs and waiting for client-rendered content.

## Summary

### Key Metrics

| Metric | Value |
|--------|-------|
| Items completed (sprint) | 1 TASK delivered (TASK-002) |
| Complexity consumed (plan) | 0 recorded consumed / budget 10 |
| Review findings resolved | HIGH/MEDIUM addressed in FIX |
| Learning notes generated | 2 competency topics |
| Health score delta | _(unchanged this run; recompute on next `/gse:go`)_ |

### Top 3 Takeaways

1. **Align REQS with explicit deferrals** before PRODUCE to avoid scope drift (REQ-006 lesson).
2. **Treat all dynamic HTML as untrusted** until escaped or built with DOM APIs.
3. **Thread traceability** through tests (REQ IDs) so green CI matches requirements coverage metrics.
