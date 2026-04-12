# Render Deployment Guide — PEW Static Website

This guide explains how to deploy the **PEW-Static-Website** as a static site on [Render](https://render.com).

---

## Prerequisites

- A [Render](https://render.com) account
- This repository pushed to GitHub or GitLab

---

## Deployment Steps

### 1. Push to GitHub

Make sure your latest code is pushed to your GitHub repository:

```bash
git add .
git commit -m "chore: restructure to static site"
git push origin main
```

### 2. Create a New Static Site on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Static Site**
3. Connect your GitHub/GitLab repository
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | `pew-static-website` |
| **Branch** | `main` |
| **Root Directory** | _(leave blank)_ |
| **Build Command** | _(leave blank — no build needed)_ |
| **Publish Directory** | `public` |

5. Click **Create Static Site**

### 3. Configure render.yaml (Optional)

You can automate deployment using the `render.yaml` file at the root:

```yaml
services:
  - type: web
    name: pew-static-website
    env: static
    staticPublishPath: ./public
    branch: main
    buildCommand: ""
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### 4. Custom Domain (Optional)

1. In the Render dashboard, go to your site → **Settings** → **Custom Domains**
2. Add your domain (e.g., `www.pewvizag.com`)
3. Update your DNS records as directed by Render
4. Render auto-provisions an SSL certificate via Let's Encrypt

---

## Folder Structure Expected by Render

```
/                       ← repo root
├── public/             ← Render publishes THIS folder
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── html/
├── docs/
├── server/
└── render.yaml
```

---

## Updating the Site

Any `git push` to `main` will **auto-deploy** on Render. No manual steps needed after initial setup.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Broken images | Check paths use `assets/images/` not `/static/images/` |
| 404 on page refresh | Add a rewrite rule in `render.yaml` (see above) |
| CSS not loading | Confirm `public/css/styles.css` is committed |
| Video not showing | Check `public/assets/videos/media-hero.mp4` size (Render has 500MB limit) |
