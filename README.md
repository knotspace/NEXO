# NEXO

A personal learning workspace for planning, tracking, and reflecting on daily study.

## Features
- Dashboard for daily study time, completion, weekly activity, and subject breakdown
- Date-based study planning and task checklist
- Study log with subject filters and deletion
- Daily reflection and reflection archive
- Personal pathway research notes
- Skill roadmap for mathematics, information/AI, economics/finance, and English
- Personal notes with categories and editing
- Dark/light theme
- JSON backup export and import
- Responsive layout and installable PWA

## Deploy with GitHub Pages
1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/(root)`, then save.
4. Wait for the Pages deployment to finish.

## Privacy

- The app shell is hosted as a public-facing static frontend; HTML, CSS and JavaScript can be viewed by anyone.
- Personal notes and workspace data are fetched only after server-side authentication through the sync API. Keep credentials and personal details out of hard-coded frontend defaults.
- Search indexing is disabled for the workspace pages, but `noindex` is not access control.
- Never treat browser storage, hidden UI elements, or a public repository as a secure place for passwords or confidential records.
