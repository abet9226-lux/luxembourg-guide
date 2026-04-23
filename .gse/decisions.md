# Decision Journal
#
# Append DEC-NNN entries below. Gate/Inform: full format. Auto-tier: logged in decisions-auto.log.

### DEC-001 — Map feature approach (v1)

- **Sprint:** 1
- **Type:** architectural
- **Tier:** Gate
- **Date:** 2026-04-23
- **Decision:** Use map links only (open in Google Maps / OpenStreetMap), no embedded map in v1.
- **Context:** A simple static website should stay lightweight; embedded maps add complexity and dependency risk.
- **Options considered:** (A) Links only (B) Embedded interactive map (C) No map
- **Rationale:** Links are fast to build, easy to maintain, and still give directions to visitors.
- **Consequences:** Now: simple implementation. 3 months: can upgrade to embedded maps if needed. 1 year: minimal maintenance burden.
- **Traces:** derives_from: [OQ-004, REQ-002]
