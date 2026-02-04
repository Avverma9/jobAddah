# JobsAddah Client

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - run the built app
- `npm run lint` - lint
- `npm run verify` - SSR verification checklist (requires the app running)

## Local Verification Checklist

1. Start the app: `npm run dev`.
2. Run the scripted checks: `npm run verify`.
3. Manual QA:
   - `/view-all` shows at least 20 posts in the HTML source (no "Loading posts").
   - `/search?q=ssc` shows results in the HTML source (no "Loading search").
   - `/resume-maker` returns `301` -> `/tools/resume`.
   - `/post?url=<source-url>` returns `301` -> `/post/<slug>`.
   - `/post?id=<id>` returns `301` -> `/post/<slug>`.
   - Post pages include a TL;DR box + "Report an error" link.
   - `/tools/image` and `/tools/resume` are tool-first and concise.
   - `/sitemap.xml` lists only canonical `/post/<slug>` URLs (no query variants).
   - `/robots.txt` allows indexing of posts and key listing pages.

## Notes

- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` in `.env` if running against a non-production backend or custom domain.
- The SSR verification script uses `BASE_URL` and `SEARCH_QUERY` env vars if you need to override defaults.
