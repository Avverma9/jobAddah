# SEO Guide for JobsAddah

This file summarizes what was implemented and recommended next steps to get the site ranking for keywords like "govt job", "sarkari result", "naukri", etc.

## What I implemented

- Added keyword-rich `<title>` and `<meta name="description">`, Open Graph and Twitter tags to `index.html`.
- Added `Organization` and `WebSite` JSON-LD in `index.html`.
- Added dynamic per-post `JobPosting` JSON-LD and dynamic meta (title/description/og/twitter/canonical) in `src/pages/post.jsx`.
- Added dynamic meta for the homepage and category pages (`homescreen.jsx`, `view-all.jsx`).
- Created `public/robots.txt` and `public/sitemap.xml` with base entries.
- Added `scripts/generate-sitemap.js` and `npm run generate-sitemap` to create sitemap from your API posts list.
- Added a GitHub Actions workflow to regenerate and commit `public/sitemap.xml` daily and on pushes: `.github/workflows/generate-sitemap.yml`.
- Added Google Analytics placeholder (replace the ID in `index.html`).

## Required manual actions (please do these now)

- Replace every `https://yourdomain.com` placeholder with your real production domain (`https://jobaddah.onrender.com` is used in some places already).
- Replace the Google Analytics ID `G-XXXXXXXXXX` in `index.html` with your real measurement ID.
- Upload `logo.png` and `og-image.png` to the referenced paths or update the paths in `index.html`.
- Verify your site in Google Search Console and submit `https://<your-domain>/sitemap.xml`.

## Prerendering / SSR (recommended)

Why: client-only SPA pages can be indexed by Google, but prerendered or server-side-rendered pages give more reliable indexing and better performance for crawlers.

Two recommended options:

1) Vite SSG (recommended)
- Install: `npm i -D vite-plugin-ssg`
- Minimal changes: wrap your app with an SSG entry and update `vite.config.js` to include the plugin. This will pre-render configured routes at build time.
- I can implement this for you (it requires installing the dev dependency and a small code change). If you want me to proceed, say "Enable SSG".

2) Puppeteer prerender script
- Build the app, run a headless Chromium to render routes, and write HTML snapshots into `dist`. Works without framework changes but requires a CI step and Chromium dependency.

## Sitemap automation

A GitHub Action (`.github/workflows/generate-sitemap.yml`) was added. It runs daily and on push, calls `npm run generate-sitemap` inside the `client` folder, and commits `public/sitemap.xml` back to the `main` branch.

Note: The sitemap generator fetches your API `posts` endpoint. If your API path differs, update `scripts/generate-sitemap.js` to point to the correct posts endpoint.

## Performance improvements (quick wins I can implement)

- Convert images to WebP / AVIF and serve responsive sizes.
- Add `loading="lazy"` to images and `decoding="async"` where applicable.
- Add caching headers via your hosting/CDN and enable a CDN (Cloudflare, Fastly, etc.).
- Remove unused JS, split large bundles, and enable HTTP/2.

I can implement automatic image conversion scripts and add a few helpers for lazy-loading.

## Monitoring & Analytics

- Add your GA4 ID to `index.html` (done placeholder). After you verify traffic, add Google Search Console and link property to Analytics.
- Use Lighthouse and PageSpeed Insights for Core Web Vitals improvements.

## Off-site SEO recommendations

- Create profiles on high-authority sites (e.g., Naukri employer pages, government exam forums, education blogs) and list JobsAddah.
- Outreach to exam-focused blogs and colleges for backlinks.
- Post consistent content: exam analysis, application how-tos, and notification roundups.

---

If you want me to continue, pick one of the following and I will implement it now:

- "Enable SSG" — I will add `vite-plugin-ssg` and modify app entry files (requires installing a dev dependency).
- "Add prerender script" — I will implement a Puppeteer-based prerender script and a workflow to run it after `npm run build`.
- "Optimize images" — I will add an `images` script to convert images in `assets/` to WebP and update references automatically.
- "Fix sitemap endpoint" — I will update `scripts/generate-sitemap.js` to point to your real posts endpoint (tell me the endpoint or I can try `https://jobaddah.onrender.com/api/v1/posts`).
- "Do all remaining changes" — I will proceed to enable SSG (option A) and add image optimization and CI prerender steps.

Reply with which option you want me to implement next or say "Do all" to proceed with SSG + image optimization + CI prerendering (I will run installs and create workflows).