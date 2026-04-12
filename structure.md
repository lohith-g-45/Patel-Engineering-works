# Project Structure

Patel Engineering Works (Vizag) has been completely migrated to a pure static frontend architecture. All production-ready code resides strictly within the `public/` directory. Legacy Flask components have been deprecated or are pending cleanup.

## Folder Tree

```text
Patel-Engineering-Works/
├── public/                 # PRODUCTION SOURCE CODE (Static site)
│   ├── index.html          # Main landing page
│   ├── html/               # All subsidiary static pages
│   │   ├── about.html
│   │   ├── about-certifications.html
│   │   ├── about-leadership.html
│   │   ├── about-milestones.html
│   │   ├── about-values.html
│   │   ├── apply.html
│   │   ├── careers.html
│   │   ├── clients.html
│   │   ├── contact.html
│   │   ├── divisions-repair.html
│   │   ├── divisions-shipbuilding.html
│   │   ├── media.html
│   │   ├── media-article-detail.html
│   │   ├── partners.html
│   │   ├── privacy-policy.html
│   │   ├── repair-detail-*.html (x8) # Specific repair division detail pages
│   │   └── terms.html
│   ├── css/
│   │   └── styles.css      # Core unified stylesheet (~4,600+ lines of global style logic)
│   ├── js/
│   │   ├── main.js         # Core functionality (UI, Carousels, Scroll, Rotators)
│   │   └── media-center.js # Media categorization logic
│   └── assets/             # Media and iconography
│       ├── icons/          # SVG UI icons
│       ├── images/         # Static imagery, photographs, and logos
│       └── videos/         # Hero background videos (e.g., media-hero.mp4)
│
├── docs/                   # Setup and operations documentation
│   ├── ADMIN_SETUP.md      
│   ├── RENDER_DEPLOYMENT.md# Guide for deploying `public/` to Render
│   └── SMTP_SETUP.md       # Contact form integration guide
│
├── structure.md            # This topology document
│
└── Legacy Architecture (Pending Cleanup / Deprecated):
    ├── app.py              # Old Flask backend router
    ├── models.py           # Old database schemas
    ├── instance/           # Old SQLite runtime data
    └── .venv/              # Previous Python environment
```

## Folder Purpose & Conventions

### `public/` (Production Root)
The `public` folder acts as the root of the web server (e.g., configuring Render's Publish Directory).
- **`index.html`**: The unified site entry point featuring the dynamic Hero Rotator.
- **`html/`**: Contains all interior pages. These pages use relative pathing to reference global assets (e.g., `../css/styles.css`).
- **`css/`**: The backbone of the specific premium aesthetic created for this site.
- **`js/`**: Contains pure DOM-manipulation logic, free from any backend templating constraints.
- **`assets/`**: Central storage for graphics, ensuring separation of design logic from binary assets.

### `docs/`
Guides and notes established to safely hand off deployment, form configuration, and administrative operations.

## Where to Add New Work

- **Adding a new section/page**:
  1. Create a `your-page.html` file in the `public/html/` directory.
  2. Copy the structure (Nav, Hero, Footer) from an existing modern file like `clients.html` or `divisions-shipbuilding.html`.
  3. Ensure all links to the CSS/JS point *up* one level (`../css/styles.css`).

- **Updating the design**:
  - Modify `public/css/styles.css`. No further template complication exists; CSS classes directly reflect HTML elements site-wide.

- **Dynamic Interactive Content**:
  - Place your JS logic in `public/js/main.js` and initialize it via `document.addEventListener('DOMContentLoaded', ...)`.

## Architectural Notes
- **Serverless Paradigm**: The site operates entirely independent of Python, Node, or database constraints. 
- **Contact Routing**: Set to use static form handlers (like Formspree/EmailJS) rather than an intricate server mailer.
- **Media Optimization**: Images and videos within `public/assets/` are direct resources without backend routing overhead.
