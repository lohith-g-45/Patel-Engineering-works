# Project Structure

This project follows a Flask-first layout with clear separation of templates, static assets, and backend logic.
Current mode is a temporary static public site (admin/media CMS removed for rebuild).

## Folder Tree

```text
WEBAPP/
├── app.py
├── models.py
├── README.md
├── requirements.txt
├── structure.md
├── static/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   │   ├── media-placeholder.svg
│   │   └── pew-vizag-logo.svg
│   ├── videos/
│   │   └── media-hero.mp4
│   └── uploads/
├── templates/
│   ├── index.html
│   ├── about.html
│   ├── about-values.html
│   ├── about-leadership.html
│   ├── about-certifications.html
│   ├── about-milestones.html
│   ├── divisions.html
│   ├── media.html
│   ├── partners.html
│   ├── careers.html
│   └── contact.html
├── instance/
└── venv/
```

## Folder Purpose

- `app.py`: Flask application entry point with static page routes.
- `models.py`: Data model definitions retained for future CMS rebuild.
- `requirements.txt`: Python dependency list for reproducible environments.
- `static/`: Frontend assets served by Flask.
- `templates/`: Jinja/HTML views rendered by Flask routes.
- `instance/`: Runtime app data (typically SQLite DB or environment-specific files).
- `venv/`: Local virtual environment (not production source code).

## Where to Add New Work

- New page:
  - Add HTML file under `templates/`.
  - Add a matching route in `app.py` using `render_template("page-name.html")`.
  - Use `url_for(...)` for all internal links.

- New image:
  - Add under `static/images/`.
  - Reference as `{{ url_for("static", filename="images/your-file.ext") }}`.

- New script:
  - Add under `static/js/`.
  - Include from templates using `{{ url_for("static", filename="js/your-file.js") }}`.

- New styles:
  - Add or split files under `static/css/`.
  - Include from templates using `{{ url_for("static", filename="css/your-file.css") }}`.

- Backend logic:
  - Route/controller logic in `app.py`.
  - Data schema updates in `models.py`.
  - Admin/CMS APIs are intentionally removed for now and will be reintroduced later.

## Naming and Structure Standards

- Use kebab-case for HTML templates and static filenames.
- Keep one responsibility per JS module when possible:
  - `main.js`: shared site behaviors
- Keep routes clean and avoid hardcoded file paths in templates.
- Prefer `url_for(...)` for all internal links and static references.
