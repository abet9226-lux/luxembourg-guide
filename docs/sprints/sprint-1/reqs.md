---
id: REQS-001
artefact_type: requirements
sprint: 1
status: draft
created: 2026-04-24
---

## Product summary
A **mobile-friendly** platform for the public, starting with **Luxembourg City (Luxville)**, that provides:
- an **Annual Events indicator** (events calendar/list + event details)
- a **Tourist guide** (places by category + place details)
- **Offline access** for saved content (as much as possible)

## Users
- Public users on mobile devices.

## Content policy (must)
- Only **basic, clear, relevant** public information.
- No hidden/undisclosed/private information.

## Assumptions (Sprint 1)
- Content sources are **both**:
  - Manual entry for the first version
  - Import from websites/APIs is “later”
- Offline goal is “**as much as possible**”:
  - Saved event/place details must be readable offline
  - Maps/navigation links may require internet (we will still show them, but they may not work offline)

## Requirements

### REQ-001 — Home navigation (must)
**Description:** The app provides clear navigation to Events, Guide, and Saved.

**Acceptance criteria**
- Given the app is opened, when the home screen loads, then the user can access:
  - Events
  - Guide
  - Saved (Offline)

### REQ-002 — Events list (must)
**Description:** Users can browse events for Luxembourg City.

**Acceptance criteria**
- Given the user opens Events, when the events list loads, then events are shown as a list.
- Given events exist, when the list is shown, then each event shows at least:
  - Title
  - Date (or date range)
  - Location/area (Luxembourg City)

### REQ-003 — Event details (must)
**Description:** Users can open an event and view details.

**Acceptance criteria**
- Given the events list is visible, when the user taps an event, then the event details screen opens.
- Given event details are shown, then the screen shows at least:
  - Title
  - Date(s)
  - Location
  - Short description
  - Source link (optional if unknown)

### REQ-004 — Tourist guide categories (must)
**Description:** Users can browse categories of places.

**Acceptance criteria**
- Given the user opens Guide, when the guide loads, then categories are shown (example categories: landmarks, museums, parks, food).
- Given categories are shown, when the user taps a category, then they see a list of places in that category.

### REQ-005 — Place details (must)
**Description:** Users can open a place and view details.

**Acceptance criteria**
- Given a place list is visible, when the user taps a place, then the place details screen opens.
- Given place details are shown, then the screen shows at least:
  - Name
  - Address/area (if known)
  - Short description
  - Opening hours (optional if unknown)
  - Map link (optional)

### REQ-006 — Save for offline (must)
**Description:** Users can save events and places, and view them offline.

**Acceptance criteria**
- Given an event details screen, when the user taps “Save”, then the event is added to Saved.
- Given a place details screen, when the user taps “Save”, then the place is added to Saved.
- Given the device has no internet, when the user opens Saved, then saved items and their details are still visible.

### REQ-007 — Remove saved items (must)
**Description:** Users can remove saved items.

**Acceptance criteria**
- Given an item is saved, when the user taps “Unsave” (or remove), then the item no longer appears in Saved.

### REQ-008 — Data entry (manual) for Sprint 1 (must)
**Description:** The first version supports manual entry of events and places (simple admin mode or local seed data).

**Acceptance criteria**
- Given the app is installed, when it runs the first time, then it contains a small starter dataset for Luxembourg City (events + places), OR there is a simple way for you to add them manually.

### REQ-009 — Import later (should)
**Description:** In a later version, the app can import events/places from websites/APIs.

**Acceptance criteria**
- Given an import feature is implemented later, when an import runs, then imported items must still follow the Content policy.

### REQ-010 — Basic search (should)
**Description:** Users can search events and places by name.

**Acceptance criteria**
- Given the user types in search, when they enter text, then results filter by title/name.

## Non-requirements (out of scope for Sprint 1)
- User accounts / login
- Payments
- Private data features
- Real-time chat/support

## Open questions (to resolve during build)
- **OQ-003 (REQS)**: Which content must be fully offline: text only vs text+images?
- Do you want the first version as:
  - a **mobile website** (works in a browser), or
  - a **real mobile app** (Android/iOS install)?
