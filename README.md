# Luxembourg City • Events & Guide (PWA)

A lightweight, offline-friendly **events calendar + tourist guide** for Luxembourg City.

## Run locally

Recommended (keeps PWA/service worker working correctly):

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Open `http://127.0.0.1:5173/`

Stop the server with **Ctrl + C**.

## Update the official list

This project is a static site, so it cannot fetch data from official websites directly (CORS).  
Instead, you generate `data/official.json` locally:

```powershell
python tools/import_official.py
```

Then click **Reload** in the app (top-right) to load the new data.

## How to use the app

- **Events tab**
  - Month filter + Area filter
  - Toggle **Year view**
- **Guide tab**
  - Pick a category, then you can filter by **Place area**
- **Saved tab**
  - Save items for offline use
  - Filter by **Saved area**
  - **Backup / Restore**: export/import your saved + custom items
- **Details**
  - Area notes, Getting there, Good to know
  - Lazy **Map preview** (click “Show map preview”)

## Install as an app (PWA)

- On supported browsers (Chrome/Edge), an **Install** button appears in the top bar.
- On iOS Safari: use **Share → Add to Home Screen**.

## Backup file format

Backups are JSON files downloaded from the **Saved → Backup** button. They include:
- `saved`: your saved events/places
- `custom`: your manually added items (events/places/categories)

Restoring will replace the current device data (a safety backup is downloaded first).

