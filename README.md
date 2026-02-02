# IBADAT Travel Website

A small static website for IBADAT - Umrah & Zayarat Group.

## Goal
Make the project easy to maintain and contribute to by using a simple, conventional folder layout and by adding helpful comments.

## New structure
- /index.html — Main homepage
- /pages/umrah-packages.html — Packages page (moved from project root)
- /css/style.css — Main stylesheet
- /js/script.js — Main JavaScript
- /assets/images — Place project images here

## How to run locally
Easy quick test using Python's simple server (Windows):

    python -m http.server 8000

Then open http://localhost:8000

## Notes
- CSS and JS files include small header comments to indicate intent and sectioning.
- Root `umrah-packages.html` now redirects to the source at `pages/umrah-packages.html` to avoid duplication.

## Admin (local, client-side)
- Admin interface is available at `/pages/admin.html` (no navigation link; access via URL).
- Login uses a simple client-side **username + password** (default: `admin` / `admin123`, configurable in `js/admin.js`).
- The admin dashboard allows Create, Read, Update, Delete (CRUD) of Umrah packages and includes an upload option for images.
- Images uploaded are converted to data URLs and stored in `localStorage` with package data — this is convenient for demos but increases browser storage usage and is not suitable for production.
- Data is stored in `localStorage` under the key `umrah_packages_v1`. This is for convenience and testing — not secure for production.

## Next improvements
- Add a linter (ESLint / stylelint) and formatter (Prettier)
- Add simple tests or CI to validate builds
- Consider a proper backend + authentication for secure admin operations
- Consider lazy-loading heavy images for mobile performance

If you'd like, I can add linting config and a basic `package.json` with formatting scripts next.