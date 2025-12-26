# Mobile Components Reference — JobsAddah

This document lists all mobile UI components in this project (`src/components/mobile` and the mobile layout wrapper), where they are used, their props/contracts, dependencies, and step-by-step restoration instructions in case a file is accidentally deleted. Use this as the single source-of-truth when restoring mobile UI code.

> Location note: paths are relative to the repository root `client/`.

---

## Quick inventory (files)

- `src/components/mobile/index.js` — barrel exports
- `src/components/mobile/MobileHeader.jsx` — mobile header (simple app header)
- `src/components/mobile/BottomNav.jsx` — fixed bottom navigation
- `src/components/mobile/HeroSection.jsx` — `GovtHeroSection`, `PrivateHeroSection`
- `src/components/mobile/SectionTabs.jsx` — tabs used on govt sections (desktop/mobile equivalent)
- `src/components/mobile/PrivateSectionTabs.jsx` — tabs for private jobs categories
- `src/components/mobile/JobList.jsx` — exports `JobListItem`, `JobListSection`, `PrivateJobsList`
- `src/components/mobile/ExpiringSoonSection.jsx` — horizontally scrollable expiring reminders
- `src/components/mobile/DeadlinesView.jsx` — list view for deadlines/reminders
- `src/components/mobile/PrivateJobsView.jsx` — full private jobs view (hero + tabs + list)
- `src/components/mobile/ToolsView.jsx` — mobile tools landing view

Also related (wrapper):
- `src/components/MobileLayout.jsx` — mobile page wrapper with header and bottom nav used by many pages

---

## How these are used in the app (where to check first)

Primary mobile entry(s) and pages that use mobile components:

- `src/pages/mobile/MobileHomeScreen.jsx` — main mobile home; imports many mobile components from `src/components/mobile`:
  - `MobileHeader`, `BottomNav`, `SectionTabs`, `GovtHeroSection`, `ExpiringSoonSection`, `JobListSection`, `ToolsView`, `DeadlinesView`, `PrivateJobsView`.
- Pages that use `MobileLayout` wrapper for mobile:
  - `src/pages/post.jsx` — uses `MobileLayout` on mobile post details view.
  - `src/pages/view-all.jsx` — uses `MobileLayout` for some uses.
  - Tools pages (`src/pages/tools/*`) — use `MobileLayout` when rendering on phone.
  - `src/pages/private-jobs.jsx` — uses `MobileLayout` for mobile private jobs view.

Search for `MobileLayout`, `components/mobile` imports to discover other usages.

---

## Component details, props, dependencies, and restoration steps

The pattern below is repeated for each component: what it does, exact props, where used, helper dependencies (functions or other components it calls), and how to recreate it if deleted.

### 1) `index.js` (barrel)
Path: `src/components/mobile/index.js`

Purpose:
- Central re-export file used by pages to import mobile components using a single path: `../../components/mobile`.

What it exports (current):
- `MobileHeader` (default)
- `BottomNav` (default)
- `SectionTabs` (default)
- `PrivateSectionTabs` (default)
- `GovtHeroSection`, `PrivateHeroSection` (named)
- `ExpiringSoonSection` (default)
- `JobListItem`, `JobListSection`, `PrivateJobsList` (named)
- `ToolsView` (default)
- `DeadlinesView` (default)
- `PrivateJobsView` (default)

Restoration steps if deleted:
1. Recreate the file with the exact export lines (no logic):
   - Import default exports from each component file and re-export them. Use the existing file list above for filenames.
2. Verify consumers (e.g., `MobileHomeScreen.jsx`) still import from `"../../components/mobile"` and fix import paths if needed.
3. Run the dev site and verify no missing module errors.

---

### 2) `MobileHeader.jsx`
Path: `src/components/mobile/MobileHeader.jsx`

Purpose:
- Top sticky header used on the mobile home. Shows logo/title and search / notifications buttons.

Props (contract):
- `onSearchToggle` (function) — optional; called when search button clicked.

Where used:
- `src/pages/mobile/MobileHomeScreen.jsx` (rendered at top of mobile home)
- It is also referenced by `src/components/MobileLayout.jsx` (slightly different internal component exists there; keep both consistent).

Dependencies:       
- `lucide-react` icons (Search, Bell, Briefcase)

Restore steps if deleted:
1. Create `MobileHeader.jsx` with a simple functional component that accepts `onSearchToggle` and renders the markup.
2. Use Tailwind classes for sticky header, and include the Search and Bell icon buttons.
3. Export default the component. Ensure `src/components/mobile/index.js` re-exports it.
4. Verify pages importing it compile.

Edge cases / notes:
- `MobileLayout.jsx` also defines a `MobileHeader` for inner pages — make sure not to confuse the two. The mobile folder’s `MobileHeader` is used in `MobileHomeScreen`.

---

### 3) `BottomNav.jsx`
Path: `src/components/mobile/BottomNav.jsx`

Purpose:
- Fixed bottom navigation bar with 4 tabs: Govt, Private, Tools, Deadlines. Designed for small screens (max width ~480px) and uses `pb-safe` (safe area padding).

Props:
- `activeView` (string) — currently applied to mark which icon is active
- `onViewChange` (function) — callback when user selects a tab (used in `MobileHomeScreen`)

Where used:
- `src/pages/mobile/MobileHomeScreen.jsx` — included at bottom of the mobile page

Dependencies:
- `lucide-react` for icons

Restore steps:
1. Recreate component as a sticky/fixed nav that renders buttons for each tab and calls `onViewChange`.
2. Use `pb-safe` style to account for iPhone notch.
3. Re-export in `index.js`.

Edge cases:
- May rely on `onViewChange` to switch the content, so ensure consumers pass a proper handler.

---

### 4) `HeroSection.jsx` (`GovtHeroSection`, `PrivateHeroSection`)
Path: `src/components/mobile/HeroSection.jsx`

Purpose:
- Hero/banner for the mobile home screen. Two exports:
  - `GovtHeroSection()` — static promotional hero for govt jobs
  - `PrivateHeroSection({ categoryCount, loading })` — shows private jobs hero and displays active categories count

Props:
- `categoryCount` (number) for `PrivateHeroSection`
- `loading` (boolean)

Where used:
- `MobileHomeScreen.jsx` (GovtHeroSection)
- `PrivateJobsView.jsx` (PrivateHeroSection)

Dependencies:
- Plain JSX, Tailwind classes

Restore steps:
1. Recreate two simple components with the named exports using `export const`.
2. Ensure `index.js` exports them by name (GovtHeroSection, PrivateHeroSection).

---

### 5) `SectionTabs.jsx` and `PrivateSectionTabs.jsx`
Path: `src/components/mobile/SectionTabs.jsx`, `src/components/mobile/PrivateSectionTabs.jsx`

Purpose:
- Tabs UI for switching between sections/categories on mobile.

Props (typical):
- `sections` (array) — list of sections
- `activeTab` (number) — index of active tab
- `onTabChange` (function) — callback when tab changes
- `loading` (optional boolean) — show skeleton while loading

Where used:
- `MobileHomeScreen.jsx` (SectionTabs for govt dynamic sections)
- `PrivateJobsView.jsx` (PrivateSectionTabs for categories)

Dependencies:
- They may use local utility helpers for formatting. Keep markup simple.

Restore steps:
1. Recreate a tabs component that maps `sections` and calls `onTabChange(index)` on click.
2. For accessibility, ensure `role="tablist"` and keyboard navigation is possible (if you want parity).

---

### 6) `JobList.jsx` (JobListItem, JobListSection, PrivateJobsList)
Path: `src/components/mobile/JobList.jsx`

Purpose:
- `JobListItem`: single job card used across Govt and Private lists.
- `JobListSection`: renders list of `JobListItem` with loading skeleton.
- `PrivateJobsList`: alternative list that links out to external private job links.

Props:
- `JobListItem`: `job` (object), `isHot` (bool), `isPvt` (bool)
- `JobListSection`: `jobs` (array), `loading` (bool), `isPvt` (bool)
- `PrivateJobsList`: `jobs`, `loading`, `categoryName`

Where used:
- `MobileHomeScreen.jsx` (JobListSection)
- `PrivateJobsView.jsx` (PrivateJobsList)
- Potentially other list pages (view-all mobile rendering)

Dependencies:
- `../../utils/helpers` — `getPostLink`, `formatJobDate`
- `../common/LoadingSkeleton` — `JobCardSkeleton`, `PrivateJobCardSkeleton`

Restore steps:
1. Recreate `JobListItem` with a `Link` or anchor that uses `getPostLink(job.id || job.link || job.url)`.
2. Implement `JobListSection` to render skeleton while `loading`.
3. Ensure `LoadingSkeleton` variants exist; if those are missing, create a minimal placeholder skeleton component.
4. Re-export named components in `index.js`.

Edge cases:
- `job` object shapes vary (some items use `postTitle`, `link`, `id`, etc.) — the component should defensively access fields.

---

### 7) `ExpiringSoonSection.jsx`
Path: `src/components/mobile/ExpiringSoonSection.jsx`

Purpose:
- Horizontally scrollable card list showing reminders that expire soon (combines `expiresToday` and `expiringSoon` arrays).

Props:
- `reminders` (object) — `{ expiresToday: [], expiringSoon: [] }`
- `loading` (bool) — shows `CardSkeleton` when true

Where used:
- `MobileHomeScreen.jsx` (as a prominent section under hero)

Dependencies:
- `getReminderLink` from `../../utils/helpers`
- `../common/LoadingSkeleton` — `CardSkeleton`

Restore steps:
1. Recreate the component to combine `reminders.expiresToday` and `reminders.expiringSoon` into a single array and map them into `Link` cards.
2. Add the `loading` branch to show `CardSkeleton` when loading is true.

Edge cases:
- Return `null` when combined reminders length is 0.

---

### 8) `DeadlinesView.jsx`
Path: `src/components/mobile/DeadlinesView.jsx`

Purpose:
- Full vertical view listing all upcoming reminders/deadlines.

Props:
- `reminders` (object)
- `loading` (bool)

Where used:
- `MobileHomeScreen.jsx` (as the Deadlines tab/content)

Dependencies:
- `getReminderLink`, `DeadlineCardSkeleton` from shared files

Restore steps:
1. Recreate the list rendering with `Link`s to `getReminderLink(reminder)`.
2. Handle the loading skeleton state and empty states.

---

### 9) `PrivateJobsView.jsx`
Path: `src/components/mobile/PrivateJobsView.jsx`

Purpose:
- Composed view: `PrivateHeroSection`, `PrivateSectionTabs`, and `PrivateJobsList` — manages local `activeTab` state and reads `sectionsByLink` to display jobs for the active category.

Props:
- `categories` (array)
- `loading` (bool)
- `sectionsByLink` (object mapping category link to {loading, jobs, error})

Where used:
- `MobileHomeScreen.jsx` when the user switches to private jobs

Dependencies:
- `PrivateSectionTabs`, `PrivateJobsList`, `PrivateHeroSection`

Restore steps:
1. Recreate component that accepts `categories, loading, sectionsByLink` and maintains a local `activeTab` state.
2. Compute `currentJobs` from `sectionsByLink` and pass to `PrivateJobsList`.

---

### 10) `ToolsView.jsx`
Path: `src/components/mobile/ToolsView.jsx`

Purpose:
- Mobile landing for the small tools (typing test, PDF tools, resume maker widgets, etc.) — shows cards/links to the various tools.

Props: none (usually static)

Where used:
- `MobileHomeScreen.jsx` under the Tools tab

Restore steps:
1. Create a simple list of tool cards linking to their routes.
2. Keep the visual style consistent with other mobile cards.

---

### 11) `MobileLayout.jsx` (wrapper)
Path: `src/components/MobileLayout.jsx`

Purpose:
- Generic mobile page wrapper used by several pages to render a page header/back button and bottom navigation. Exports `MobileHeader`, `MobileBottomNav`, and `MobileLayout`.

Props for `MobileLayout`:
- `children` (React nodes)
- `title` (string)
- `showBack` (bool)
- `showBottomNav` (bool)

Where used:
- `src/pages/post.jsx` (mobile variant of post)
- `src/pages/view-all.jsx` (mobile)
- Tools pages (`src/pages/tools/*`) for mobile
- `src/pages/private-jobs.jsx`

Restore steps:
1. Recreate `MobileHeader` (with `title`, `showBack`, `onSearchToggle`) and `MobileBottomNav` (navigation logic) and the `MobileLayout` wrapper that renders them and `children`.
2. Ensure `MobileBottomNav` uses `react-router` `navigate` to go to `private-jobs` and swaps to tools/deadlines via state or hash.

---

## General restoration checklist (common to all components)

If any mobile component file is deleted, follow these steps to restore the project to a working state quickly:

1. Identify the deleted file and the exports it provided. Use `git checkout -- <file>` if you have the previous commit; that's fastest.
2. If you must recreate manually, use the component name and the path listed above. Provide default exported function with the same name.
3. Ensure correct props signature is preserved (see the props listed above). Consumers depend on these contracts.
4. Re-export from `src/components/mobile/index.js` if the file provides a default export used by the barrel.
5. Verify helper imports exist and paths are correct:
   - `../../utils/helpers` — `getPostLink`, `formatJobDate`, `getReminderLink`
   - `../common/LoadingSkeleton` — `JobCardSkeleton`, `CardSkeleton`, `DeadlineCardSkeleton`, etc.
6. Run a quick type/syntax check: `npm run build` or `npm run dev` and look for module not found / import errors.
7. Validate UI manually: open the mobile home route or relevant page and confirm the component renders and no JS errors appear in console.

---

## Testing & QA steps after restoration

- Start dev server:

```powershell
npm run dev
```

- Use the browser responsive mode (device toolbar) and check:
  - Mobile Home renders: hero, expiring soon, section tabs, job list, bottom nav.
  - Click around tabs and ensure `onViewChange` / `onTabChange` callbacks switch content.
  - Open a post on mobile, ensure `MobileLayout` header/back button works.
  - Check loading states by simulating slow network (DevTools throttling) to confirm skeletons show.

- Check console for missing module errors or React warnings.

---

## Edge cases & gotchas to document for the team

- There are two `MobileHeader` definitions in the repo: one in `src/components/mobile/MobileHeader.jsx` (used by `MobileHomeScreen`) and another exported from `src/components/MobileLayout.jsx` (used inside the `MobileLayout`). Do not delete both without reconciling — they serve different layout contexts.

- Mobile components rely on `utils/helpers` for link generation. If that file is changed, mobile links may break (e.g., `getPostLink`, `getReminderLink`). Keep helper exports stable.

- Loading skeleton components live in `src/components/common/LoadingSkeleton.jsx`. If those are removed, mobile list components will throw. Provide simple fallback skeletons if required.

- `ExpiringSoonSection` and `DeadlinesView` expect `reminders` shaped like `{ expiresToday: [], expiringSoon: [] }`. Keep the shape consistent in the reminders slice of Redux.

- `JobListItem` defensively reads job fields (`job.title`, `job.link`, `job.id`, `job.createdAt`). When reconstructing, implement defensive fallbacks to avoid crashes if shapes vary.

---

## Contact / Ownership

If you're restoring components after accidental deletion, reach out to the original authors or the team owner for guidance on UI specifics (colors/text/spacing). For production deployments, run a smoke test on a staging site and confirm the sitemap and robots entries remain correct.

---

This document should be kept next to the code and updated when mobile components are added/renamed.

If you want, I can:
- Create a PR that adds `MOBILE-COMPONENTS.md` to the repo (already created in this workspace).
- Generate a short checklist script to run smoke tests automatically (a small Node script that navigates routes and checks HTTP 200 via fetch).

Which follow-up would you like? 
