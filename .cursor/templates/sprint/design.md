---
gse:
  type: design
  sprint: 1
  branch: gse/sprint-{NN}/integration    # replaced at instantiation by /gse:design
  traces:
    derives_from: []                   # e.g., [TASK-005] — task that triggered this design work
    implements: []                     # e.g., [REQ-001, REQ-002] — requirements addressed
    tested_by: []                      # e.g., [TST-007] — tests verifying the design
    decided_by: []                     # e.g., [DEC-001] — shaping decisions
  status: draft                        # draft | reviewed | approved
  created: ""
  updated: ""
---

# Design Decisions — Sprint {sprint}

## Architecture Overview

_High-level description of the system architecture for this sprint's scope._

## Design Decisions

### DES-001 — {decision title}

- **Context:** {what situation or requirement drives this decision}
- **Options Considered:**
  1. {Option A} — {pros / cons}
  2. {Option B} — {pros / cons}
  3. {Option C} — {pros / cons}
- **Decision:** {chosen option}
- **Rationale:** {why this option was chosen over alternatives}
- **Trade-offs:** {what is sacrificed or accepted}
- **Implements:** REQ-001, REQ-002
- **Status:** proposed | accepted | superseded

### DES-002 — {decision title}

- **Context:** {what situation or requirement drives this decision}
- **Options Considered:**
  1. {Option A} — {pros / cons}
  2. {Option B} — {pros / cons}
- **Decision:** {chosen option}
- **Rationale:** {why this option was chosen}
- **Trade-offs:** {what is sacrificed or accepted}
- **Implements:** REQ-003
- **Status:** proposed | accepted | superseded

## Component Diagram

_Description or diagram of component structure and dependencies._

```
[Component A] --> [Component B]
[Component A] --> [Component C]
[Component B] --> [Component D]
```

## Interface Contracts

### Interface: {name}

- **Provider:** {component}
- **Consumer:** {component}
- **Contract:**
  - Input: {type and constraints}
  - Output: {type and constraints}
  - Errors: {error cases and responses}
  - Invariants: {conditions that always hold}

## Data Model

_Key entities and their relationships for this sprint's scope._

| Entity       | Key Fields              | Relationships          |
|-------------|-------------------------|------------------------|
|             |                         |                        |

## Shared State

_State that must be visible or consistent across multiple components/pages.
Formalize each piece: what it is, who reads/writes it, how it's stored, why it's shared.
This section is **mandatory**: if no shared state exists, write the explicit disclaimer line below._

| Name | Scope (components) | Mechanism | Rationale | Traces |
|------|-------------------|-----------|-----------|--------|
|      |                   |           |           |        |

_If no shared state applies to this sprint: replace the table with:_
**_No shared state identified — components are independent._**

## Technology Choices

| Area          | Choice       | Rationale                        | Alternatives Considered |
|---------------|-------------|----------------------------------|------------------------|
|               |             |                                  |                        |

## Open Design Questions

1. {question needing resolution}

## Inform-tier Decisions

> Low-risk autonomous decisions made during design (Step 7 closure).
> Each was individually below the Gate threshold (P7). Reviewed as a batch
> at activity closure — the user can promote any to a Gate decision.

- _{decision 1}_
- _{decision 2}_
