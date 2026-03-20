# WEBAPP

Flask-based marine engineering website with:
- Public pages rendered from templates
- Static frontend assets (CSS, JS, images, videos)

Note: The project is currently in temporary static mode.
Admin and media CMS/database features have been intentionally removed and will be rebuilt later.

## UI Refresh (2026)

- Unified design language across all pages (nav, hero, cards, CTAs).
- Shared hero banner uses a wave motif and supports per-page background imagery via CSS variable `--hero-image`.
- Icons and badges pull from `static/icons/` and shared image assets in `static/images/` and `static/uploads/`.

## Project Structure

- `app.py`: Flask app entry point and routes
- `models.py`: SQLAlchemy models
- `templates/`: HTML templates
- `static/`: CSS, JS, images, videos, uploads
- `requirements.txt`: Python dependencies
- `structure.md`: Detailed architecture notes

## Prerequisites

- Python 3.11+ (project is currently running on Python 3.13)
- macOS/Linux/Windows terminal

## Setup

1. Create a virtual environment:

```bash
python3 -m venv .venv
```

2. Activate it:

```bash
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run the App

Default run (as coded in `app.py`):

```bash
python app.py
```

By default, this starts on:
- Host: `0.0.0.0`
- Port: `5000`

### If Port 5000 Is Busy

Run on port 5001:

```bash
python -c "from app import app; app.run(host='127.0.0.1', port=5001, debug=False)"
```

Then open:
- `http://127.0.0.1:5001/`

## Quick Health Checks

After starting the app:

```bash
curl -I http://127.0.0.1:5001/
curl -I http://127.0.0.1:5001/media
```

Expected: HTTP `200` responses.

## Admin Notes (Temporary)

- `/admin` currently redirects to `/media`.
- CMS endpoints and DB-driven content are currently disabled.
- `media.html` is hardcoded static content for now.

## Troubleshooting

### 1) "Address already in use" on port 5000

Use the alternate port command above (`5001`), or free port 5000.

### 2) VS Code shows unresolved imports (Flask/Werkzeug)

Usually means interpreter mismatch. In VS Code, select the interpreter from `.venv` for this workspace.

### 3) Static asset not loading

- Confirm file exists under `static/`
- Confirm template uses Flask static URL pattern:

```jinja2
{{ url_for('static', filename='path/to/file.ext') }}
```

## Development Tips

- Keep page templates in `templates/`
- Keep JS modular in `static/js/`
- Keep all internal links via `url_for(...)` to avoid broken paths during refactors

## Current Status

- App routes verified
- Template/static links normalized
- Project structure standardized and documented in `structure.md`

## Render Deployment

This project now includes a Render blueprint at `render.yaml`.

### What Gets Provisioned

- One Python web service (Gunicorn)
- One managed PostgreSQL database
- One persistent disk mounted at `/opt/render/project/src/static/uploads`

### Deploy Steps

1. Push this repository to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select the repository and deploy.
4. Render will read `render.yaml` and create the web service + database.

### Environment Variables

The blueprint configures these automatically:

- `DATABASE_URL` (from Render Postgres)
- `JWT_SECRET_KEY` (generated value)
- `PYTHON_VERSION` (3.11.11)

### Notes

- The app normalizes `postgres://` to `postgresql://` automatically in `app.py`.
- Uploaded media files are stored under `static/uploads` and persist on Render via the attached disk.
- For larger scale and CDN delivery, migrate media storage from local disk to object storage (S3/R2/Cloudinary).
