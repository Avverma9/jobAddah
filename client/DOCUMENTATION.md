# JobsAddah Technical Documentation

This document provides a comprehensive overview of the **JobsAddah** codebase, its architecture, data flow, and directory structure.

## 1. Project Overview
JobsAddah is a high-performance, SEO-optimized web application built with **Next.js 15 (App Router)**. It serves as a portal for government job notifications (Sarkari Results), offering job alerts, typing tests, and productivity tools for candidates.

---

## 2. Directory Tree Structure

```text
├── app/                        # Next.js App Router (Routing & Pages)
│   ├── api/                    # Backend API Routes (Next.js Edge/Serverless)
│   │   └── gov-post/           # Job-related API endpoints
│   ├── components/             # Reusable UI Components
│   │   ├── layout/             # Header, Footer, Navigation
│   │   ├── ReminderComponent/  # Deadline Alerts
│   │   └── TrendingJobs/       # Highlighted Job Vacancies
│   ├── post/                   # All Jobs listing page
│   ├── post/[...slug]/         # SEO-Optimized Catch-all route (Job Details)
│   ├── tools/                  # Utility tools (Typing, Resume, Image Master)
│   ├── globals.css             # Tailwind CSS & Global styles
│   └── layout.js               # Root layout with SEO and standard UI
├── lib/                        # Core Logic & Library Layer
│   ├── db/                     # MongoDB connection logic
│   ├── models/                 # Mongoose Schemas (Job, Section, JobList)
│   ├── services/               # Business logic / Service layer
│   ├── image-tool/             # Logic for Image Suite
│   ├── SEO.jsx                 # Dynamic Metadata & JSON-LD generator
│   └── job-url.js              # URL Sluggification & Cleaning utilities
├── util/                       # Helper functions
│   ├── post-helper.js          # Data extraction from raw HTML/Objects
│   └── post-helper.jsx         # React-specific UI helpers
└── public/                     # Static assets (images, icons)
```

---

## 3. Data Flow Architecture

### A. The Request Lifecycle (Job Details)
1.  **User Trigger**: User clicks a job link (processed via `getCleanPostUrl`).
2.  **Route Match**: Next.js hits `app/post/[...slug]/page.jsx`.
3.  **Data Fetching**: 
    *   The `JobDetailsPage` extracts the slug.
    *   It sends a request to `/api/gov-post/post-details?url=...`.
4.  **Backend Processing**:
    *   The API route calls `lib/services/govJob.service.js`.
    *   The service interacts with `lib/db/connectDB.js` to fetch raw data from MongoDB.
5.  **Data Transformation**:
    *   The raw data is sent back to the client.
    *   The client uses `util/post-helper.js` (`extractRecruitmentData`) to parse unstructured data into a clean JSON object for the UI.
6.  **UI Rendering**: The page renders the formatted table, important dates, and links.

### B. Search Flow
*   **Input**: User types in the `Header` search bar.
*   **Debounce**: Request is delayed (800ms) to prevent server overload.
*   **API**: Calls `/api/gov-post/find-by-title`.
*   **Output**: Returns partial job objects which are instantly sluggified for navigation.

---

## 4. Key Logic & Systems

### 1. SEO Optimized Routing
One of the most critical parts of the app is the transition from **Query Parameters** to **Slug Routes**:
*   **Old**: `/post-detail?url=/up-police-job/` (Bad for SEO).
*   **New**: `/post/up-police-job/` (Search Engine Friendly).
*   **Mechanism**: The `lib/job-url.js` utility strips domain names and cleans the path, which is then handled by the catch-all folder `[...slug]`.

### 2. SEO & Schema Integration
The application uses a "Hoisting" pattern for SEO:
*   **Component**: `lib/SEO.jsx`.
*   **Action**: It injects `<title>`, `<meta>`, and `application/ld+json` (Schema.org) directly into the page.
*   **Schema types**: `JobPosting`, `BreadcrumbList`, and `FAQPage`.

### 3. Data Extraction (`post-helper.js`)
Since government notifications differ in format, this utility acts as a **Normalization Layer**. It looks for specific keywords (e.g., "Age Limit", "Fee", "Last Date") within the source data and maps them to a consistent UI structure.

---

## 5. Technology Stack
*   **Frontend**: Next.js 15, React 19, Tailwind CSS.
*   **Icons**: Lucide React.
*   **Backend**: Next.js Route Handlers (Node.js).
*   **Database**: MongoDB with Mongoose.
*   **Formatting**: `date-fns` / Native Intl API for currency/dates.

---

## 6. How Components are Connected
*   **Layout**: `Header` and `Footer` are wrapped around every page in `layout.js`.
*   **Data Sharing**: Components like `TrendingJobs` and `ReminderComponent` are independent but utilize the same API patterns and utility functions (`job-url.js`).
*   **Tools**: Tools (Typing, Image) are modularized in the `lib/` folder so they can be easily reused or called within any page.

---

## 7. Development Guidelines

### Adding a New Tool
1. Create a route in `app/tools/your-tool/page.jsx`.
2. Add logic in `lib/your-tool-logic/`.
3. Register the link in `app/components/layout/Header.jsx` under the Tools dropdown.

### Modifying Job Data
* To change how jobs look: Edit `app/post/[...slug]/page.jsx`.
* To change how data is parsed: Edit `util/post-helper.js`.

## 8. SEO Strategy
* A new `seo.md` companion document walks through how metadata, canonical URLs, JSON-LD, and crawl hygiene are wired together (see [seo.md](seo.md)).
* Core pieces include `lib/SEO.jsx` for consistent `<head>` tags, `app/post/[...slug]/generateMetadata` for slug-specific descriptions, `lib/seo-schemas.js` for `JobPosting`/`FAQPage`/`BreadcrumbList`, and the focused `/sitemap.xml`/`robots.txt` handlers that only publish index-worthy URLs.
* The sitemap filter rejects posts with fewer than three unique job links and skips blocked titles (`Privacy Policy`, `Sarkari Result`), so only substantial recruitment alerts reach search engines.
