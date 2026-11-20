# Mental Wellness — Render deployment

This repository is a static HTML/CSS/JavaScript website. It does not require Flask,
Python, or a frontend framework. The `npm run build` script copies the website files
from `Templates/` into `dist/`.

## Render settings
- Service type: Static Site
- Branch: main
- Build command: `npm install && npm run build`
- Publish directory: `dist`

The mood, journal, stress, and sleep entries currently use browser `localStorage`.
They are saved only in the visitor's browser and are not synced to a server/database.
