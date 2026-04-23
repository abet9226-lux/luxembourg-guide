---
gse:
  type: methodology-feedback
  sprint: 1
  created: "2026-04-23"
  status: exported
---

# Sprint 1 — Methodology Feedback

## Summary

Sprint 1 followed the full GSE-One lifecycle through delivery successfully. Methodology friction centered on **requirements staying aligned with the frozen design** (notably multilingual scope) and on **catching security issues at review rather than earlier**. Four observations consolidated into **two themes**; feedback is **exported locally** only (`github.enabled: false`).

## Observations grouped by theme

### Theme 1: Requirements–design alignment

**Observation:** REQ-006 described multilingual UI while the design and implementation stayed English-only for v1. That mismatch surfaced as a HIGH review finding (RVW-002) even though plan-summary recorded no formal scope change.

**Source:** RVW-002, `docs/sprints/sprint-01/reqs.md` (REQ-006), `docs/sprints/sprint-01/plan-summary.md`

**Proposed improvement:** At PLAN/REQS boundary, mark out-of-scope or later-sprint REQs with explicit `deferred` status and mirror them in plan-summary “Scope changes” so coherence checks and REVIEW share the same truth.

---

### Theme 2: Security shift-left

**Observation:** DOM XSS and ticket URL validation issues were found in REVIEW/FIX (RVW-001, RVW-004). They were resolved before release, but earlier detection would shorten the FIX loop.

**Source:** RVW-001, RVW-004, `docs/sprints/sprint-01/review.md`

**Proposed improvement:** Add a short DESIGN-SECURITY checklist gate (“no `innerHTML` with unescaped external data; outbound links scheme-validated”) before PRODUCE.

## Totals

- **Observations collected:** 4
- **Themes produced:** 2
- **Severity split:** 2 HIGH / 1 MEDIUM / 1 LOW
- **Route chosen:** local export
- **Tickets proposed to upstream:** none (GitHub integration disabled)

## Next steps

- Optionally run `/gse:integrate` later if you enable `github` and want upstream methodology tickets.
- Revisit these themes at the end of sprint 2 to see if they recur.
