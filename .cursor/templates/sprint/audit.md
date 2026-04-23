---
gse:
  type: audit
  sprint: {sprint}                       # numeric sprint number (0 if no sprint active)
  trigger: manual                        # manual | auto-trigger | scheduled
  audit_version: ""                      # from @gse-tool header of project-audit.py
  phase: "Phase 1 deterministic"         # Phase 1 deterministic | Phase 1 + Phase 2 hybrid
  traces:
    derives_from: []                     # typically empty (audit observes state, not derived)
    related: []                          # e.g., [RVW-NNN] if audit confirms review findings
  findings:
    critical: 0
    high: 0
    medium: 0
    low: 0
    total: 0
  actions:
    applied: 0
    deferred: 0
  status: draft                          # draft | reviewed | applied
  created: ""                            # ISO 8601 timestamp
  updated: ""
---

# Methodology Audit — {YYYY-MM-DDThh:mm}

**Sprint:** {sprint}  
**Trigger:** {manual | auto-trigger | scheduled}  
**Audit engine:** project-audit {audit_version}  
**Phase:** {Phase 1 deterministic | Phase 1 + Phase 2 hybrid}

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL |       |
| HIGH     |       |
| MEDIUM   |       |
| LOW      |       |
| **Total**|       |

_CRITICAL is reserved for P15 escalation cases (e.g., silently corrupted state file, diverging git history). Baseline severity for drift detection: HIGH / MEDIUM / LOW._

## Deterministic findings (Phase 1)

_Findings emitted by `plugin/tools/project-audit.py`. Each follows the canonical format `AUD-NNN [SEVERITY] — title` per design §3.4 Dashboard parser format contracts._

### CRITICAL

_(none)_

### HIGH

_(none)_

### MEDIUM

_(none)_

### LOW

_(none)_

## Semantic findings (Phase 2 — deferred)

_When Phase 2 ships, findings from the `project-reviewer` sub-agent will appear here. These cover semantic drift (P9 jargon in beginner output, P14 learning sessions not delivered, REQ/DESIGN coherence gaps, etc.) that deterministic checks cannot catch._

In Phase 1, this section is intentionally empty; the Inform note in the activity log records the deferral.

## Actions taken

_Corrections applied during this audit (see activity Step 5)._

| Finding | Severity | Action | Outcome | DEC ref |
|---------|----------|--------|---------|---------|
|         |          |        |         |         |

## Deferred findings

_Findings not acted on during this audit. Persist for the next `/gse:audit` invocation._

| Finding | Severity | Reason deferred |
|---------|----------|-----------------|
|         |          |                 |

## Notes

_Audit-level observations, patterns, recommendations for next sprint or for /gse:compound Axe 3 integration._
