from __future__ import annotations

import json
import re
import sys
import urllib.request
from dataclasses import dataclass
from datetime import date
from html import unescape
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUT_FILE = PROJECT_ROOT / "data" / "official.json"

VDL_EVENTS_INDEX = "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events"


@dataclass(frozen=True)
class Link:
    title: str
    url: str


# Fallback list (works even if the index page is JS-rendered).
# These URLs were validated from official sources.
FALLBACK_VDL_LINKS: list[Link] = [
    Link("Winterlights", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/winterlights-0"),
    Link("Éimaischen", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/eimaischen"),
    Link("Fréijoer op der Gëlle Fra", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/freijoer-op-der-gelle-fra"),
    Link("National Day (VDL page)", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/national-day"),
    Link("Schueberfouer (VDL page)", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/schueberfouer-old"),
    Link("Buergbrennen", "https://www.vdl.lu/en/visiting/leisure-and-recreation/festivals-fairs-and-events/buergbrennen"),
]


def fetch(url: str, timeout_s: int = 20) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; LuxGuideImporter/1.0; +https://localhost)"
        },
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        data = resp.read()
    # vdl.lu pages are utf-8
    return data.decode("utf-8", errors="replace")


def extract_links_from_vdl_index(html: str) -> list[Link]:
    """
    Very small HTML extraction:
    - Pull hrefs that look like vdl festival/event pages.
    - Use nearby link text as title.
    """
    links: list[Link] = []

    # Look for: <a ... href=".../festivals-fairs-and-events/slug">Title</a>
    pat = re.compile(
        r'<a[^>]+href="(?P<href>/en/visiting/leisure-and-recreation/festivals-fairs-and-events/[^"#?]+)"[^>]*>(?P<text>[^<]{2,120})</a>',
        re.IGNORECASE,
    )
    for m in pat.finditer(html):
        href = m.group("href")
        text = unescape(m.group("text")).strip()
        if not text:
            continue
        url = "https://www.vdl.lu" + href
        links.append(Link(title=text, url=url))

    # Deduplicate by url
    seen = set()
    out: list[Link] = []
    for l in links:
        if l.url in seen:
            continue
        seen.add(l.url)
        out.append(l)
    return out


def make_event_id(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
    return f"evt_official_{slug[:50] or 'event'}"


def build_official_payload(vdl_links: Iterable[Link]) -> dict:
    events = []
    for l in vdl_links:
        events.append(
            {
                "id": make_event_id(l.title),
                "title": l.title,
                "date": "See official link (dates vary)",
                "location": "Luxembourg City",
                "description": "Official event page (open the source link for latest schedule and details).",
                "sourceUrl": l.url,
            }
        )

    payload = {
        "generatedAt": date.today().isoformat(),
        "sources": [
            {"name": "Ville de Luxembourg — Festivals, fairs and events", "url": VDL_EVENTS_INDEX}
        ],
        "events": events,
        "categories": [],
        "places": [],
    }
    return payload


def main() -> int:
    try:
        html = fetch(VDL_EVENTS_INDEX)
    except Exception as e:
        print(f"[import_official] Failed to fetch VDL index: {e}", file=sys.stderr)
        html = ""

    links = extract_links_from_vdl_index(html) if html else []
    if not links:
        links = FALLBACK_VDL_LINKS
    payload = build_official_payload(links)

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[import_official] Wrote {OUT_FILE} with {len(payload['events'])} official event link(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

