---
gse:
  type: preview
  sprint: 1
  branch: gse/sprint-{NN}/integration    # replaced at instantiation by /gse:preview
  preview_variant: ""                    # static | scaffold
  scaffold_path: ""                      # only if preview_variant=scaffold, e.g., "./", "frontend/"
  traces:
    derives_from: []                     # e.g., [REQ-001, DES-002] — what this preview illustrates
    implements: []                       # requirements visualized
  status: draft                          # draft | reviewed | approved
  created: ""
  updated: ""
---

# Preview — Sprint {sprint}

> Visual / structural preview produced before code. For `preview_variant: static`,
> contains wireframes, ASCII diagrams, and user-story walkthroughs. For
> `preview_variant: scaffold`, points to the runnable minimal scaffold at
> `scaffold_path` and captures its `PREVIEW:` placeholder markers.

## Preview Variant

- **Variant:** {static | scaffold}
- **Rationale:** {why this variant for this sprint — domain, tooling, throwaway-vs-continuity}
- **Scaffold path:** {path if scaffold; empty if static}

## UI Previews

_Wireframes or scaffold component references for UI-bearing TASKs._

### TASK-{ID} — {short title}

```
{ASCII wireframe or scaffold component path}
```

Interactions:
- {interaction 1}
- {interaction 2}

Responsive: {if applicable}

## API Previews

_Request/response examples for API-bearing TASKs._

### TASK-{ID} — {endpoint or operation name}

```
{HTTP method} {path}
Headers:
  {relevant headers}

Request:
  {body or params}

Response (200):
  {body}

Errors:
  - {error case 1}
  - {error case 2}
```

## Architecture Previews

_Component diagrams or dataflow sketches for architecture-shaping TASKs._

## Data Previews

_Sample records, schema snippets, entity relationships for data-bearing TASKs._

## Feature Walkthroughs

_Step-by-step user-perspective scenarios covering end-to-end usage._

## Import Previews

_If importing external sources: list of imported items with sanity checks._

## Inform-tier Decisions

> Low-risk autonomous decisions made during preview (Step 4 closure).
> Each was individually below the Gate threshold (P7). Reviewed as a batch
> at activity closure — the user can promote any to a Gate decision.

- _{decision 1}_
- _{decision 2}_
