# CDEK Pickup Point Widget — MetalVal-style demo

A minimal, browser-based demonstration of a B2B pickup-point selector, based on the MetalVal popup interaction pattern. One modal, two lists, one JSON file. No dashboards, frameworks, maps or API keys.

## Features
- Country selector and city directory with office counts
- Search by city, address or pickup-point code
- Pickup-point details and selection confirmation
- LocalStorage persistence and `mv:cdek-selected` browser event
- Consultation draft via `mailto:` (demo only)
- Responsive modal, Escape key and focus trapping

## Start

Run `python3 -m http.server 8000` in this directory, then open `http://localhost:8000`.

## Files
- `index.html` — trigger button and original-style modal markup
- `style.css` — restrained MetalVal-style presentation
- `cdek-popup.js` — standalone widget logic, using the original UI IDs and event name
- `data/cdek-offices.json` — **small sample** drawn from the supplied reference directory

## Data and limitations
The JSON file is a static sample, **not live CDEK data**. Real-world pickup-point availability, addresses, prices and acceptance conditions must be verified before use. The sample is included for evaluation only. Confirm your rights to redistribute the source data before publishing it publicly, or replace it with fictional records.

This repository has no affiliation with CDEK. It is a frontend portfolio demo, not a shipping-rate or order-placement service.
