---
gse:
  type: release
  sprint: 1
  branch: main
  traces:
    implements: [TASK-002]
  status: approved
  version: "0.1.0"
  tag: "v0.1.0"
  commit: "1432b43a2982a4177b8d2e95d94e10e502bd3646"
  created: "2026-04-23"
  updated: "2026-04-23"
---

# Release Notes — 0.1.0

## Overview

First usable version of the Luxembourg Guide static website with an events-first experience.

## What's New

### Features

- **Events-first browsing** — Cards (default) + List view, soonest-first sorting, event details.
- **Filters + search** — Date (today / next 7 days / this month), city, category, and keyword search.
- **Tickets link-out** — “Tickets / Book” opens the official provider website.

### Improvements

- **Accessibility & safety improvements** — visible focus styles, safer external links, and safer rendering of event data.

## Quality Summary

| Metric | Value |
|---|---|
| Tests passed | 5/5 (Playwright E2E) |
| Review findings open | 0 |
| Health score | 4.4/10 |

## Installation / Run

```bash
npm install
npm run serve
```

Open: `http://127.0.0.1:5173/app/index.html#/events`

