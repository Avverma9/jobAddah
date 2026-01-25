# JobsAddah SEO Architecture

This document explains how the codebase keeps JobsAddah indexable, prevents thin/utility pages from ranking, and surfaces rich schema data for every recruitment alert.

This architecture directly addresses Google Search Console signals such as "Discovered – currently not indexed" by increasing content depth, reducing duplication, and tightening crawl paths.

## Metadata, keywords, and canonical URLs
- `lib/SEO.jsx` is the one-stop component that injects `<title>`, `<meta name="description">`, `<meta name="keywords">`, canonical links, Open Graph tags, and the `robots` directive.
- It delegates canonical resolution, keyword aggregation, and absolute URL enforcement to `lib/seo-utils`, so every page consistently resolves `/post/...` slugs back to `https://jobsaddah.com` and avoids duplicate URLs.
- Default values cover the entire domain, but callers (especially `generateMetadata` in `app/post/[...slug]/page.jsx`) can override the title, description, canonical, and robots policy when there is sufficient job detail.

## Dynamic job metadata from the catch-all route
- `app/post/[...slug]/page.jsx` fetches the scraped payload via `getJobDetails` and parses it through `util/post-helper.extractRecruitmentData`, which normalizes organization, important dates, vacancy counts, links, and more.
- `generateMetadata` uses that structured data to create page-specific titles/descriptions and sets the canonical to `/post/${slugPath}` so crawlers always see the friendly slug-version of the job link.
- The same component also renders `<script type="application/ld+json">` with the payload from `lib/seo-schemas`, guaranteeing structured data is present on every post detail.

## Structured data & schema support
- `lib/seo-schemas.js` exposes helpers for `JobPosting`, `FAQPage`, and `BreadcrumbList` JSON-LD whenever there is matching content. The job schema includes fields for salary, hiring organization, locations, and dates so Google sees rich snippets.
- Breadcrumbs and FAQs are rendered only when the data is available, keeping the schema valid and aligned with the page copy.

## Sitemap & crawl hygiene
- `app/sitemap.xml/route.js` now builds a focused list: only the home/about/contact/view-all routes plus `/post/...` pages that survive a thin-content filter.
- `collectIndexablePaths` rejects URLs missing a title or containing blocked titles like "Privacy Policy". The sitemap only includes each unique `/post/...` once, and it skips documents where the scraped post holds fewer than three valid job links (to avoid low-value pages).
- Every sitemap entry carries an accurate `lastmod` derived from the MongoDB timestamps and a weekly `changefreq`/`0.6` priority.
- The robots handler (`app/robots.txt/route.js`) explicitly allows `/` while pointing to the curated sitemap and defining the canonical host.

## Thin-content prevention
- `util/post-helper` is the normalization layer that discards placeholder strings (", `-`, `notify later`, etc.) before they reach the UI, ensuring only real recruitment data makes it onto a page.
- Since the post page relies on those sanitized fields to populate metadata and JSON-LD, the depth of the content (vacancy breakdowns, fees, date tables, and links) helps keep each `/post/...` page substantial.
- The sitemap threshold of three unique job links plus selective title filtering keeps utility pages, filter combos, and duplicate entries out of search engine indexes. In practice, only posts backed by real scraped jobs appear in the XML.
- The newly added “Preparing for the Recruitment” narrative section guarantees ~800+ words of crawlable text inside the `<article>`/`<section>` hierarchy, so Google sees meaningful paragraphs before rendering the tables or lists that summarize eligibility, dates, and salary.
- Every `/post/...` page is linked from at least one listing surface (e.g., `/view-all`, section pages, or the TrendingJobs component), ensuring Googlebot can discover posts through crawl paths, not only via the XML sitemap.
