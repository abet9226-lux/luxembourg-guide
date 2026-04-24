---
id: PLAN-001
artefact_type: plan
sprint: 1
status: draft
created: 2026-04-24
---

## Goal
Build a **mobile-friendly Annual Events + Tourist Guide** for the public, starting with **Luxembourg City (Luxville)**, with **offline access to saved content**.

## Scope (Sprint 1)
- **Events**
  - Show a simple yearly view of events (list + month grouping).
  - Event details: title, date(s), location, short description, source link (if available).
- **Tourist guide**
  - Show places in categories (e.g., landmarks, museums, parks, food).
  - Place details: name, address/area, opening hours (if known), short description, map link (optional), photos (optional later).
- **Offline**
  - Allow saving selected events/places for offline viewing.
  - Offline includes text details (images optional later).

## Content policy
- Only **basic, clear, relevant** public information.
- No hidden/undisclosed/private information.

## Proposed build order
1. **Define content sources + target area**
   - Luxembourg City first.
   - Decide: manual entry vs importing from websites/APIs (or both).
2. **Build the data model + basic screens**
   - Tabs: **Events** / **Guide** / **Saved (Offline)**.
3. **Events MVP**
   - Event list + event detail.
4. **Tourist guide MVP**
   - Category list + place list + place detail.
5. **Offline saved content MVP**
   - Save/unsave items.
   - View saved items offline.
6. **Polish**
   - Search, filters (optional), better layout.

## Open decisions (we will answer next)
- What are the **content sources** (manual / web / both)?
- What must work **offline** (events, places, images, maps)?
