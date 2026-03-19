# WEBAPP

Flask-based marine engineering website with:
- Public pages rendered from templates
- Static frontend assets (CSS, JS, images, videos)

Note: The project is currently in temporary static mode.
Admin and media CMS/database features have been intentionally removed and will be rebuilt later.

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
