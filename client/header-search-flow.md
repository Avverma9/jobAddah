# Header Search Flow (JobsAddah)

## Scope
Yeh document explain karta hai ki header se search karne par data kaise aata hai, kaun-si API call hoti hai, aur backend me data kahan se fetch hota hai.

## Main Files
- `app/components/layout/Header.jsx`
- `app/search/page.jsx`
- `app/search/SearchClient.jsx`
- `app/api/gov-post/find-by-title/route.js`
- `lib/job-url.js`

## 1) Header Search Input Se API Tak (Live Suggestions)
`Header.jsx` me desktop aur mobile dono search UI same logic use karte hain:

1. User input `handleSearchChange(value)` me aata hai.
2. Query trim hoti hai; agar length `< 2` ho to results clear ho jaate hain (API call nahi hoti).
3. Previous debounce timer clear hota hai.
4. Previous in-flight request `AbortController` se cancel hoti hai.
5. `800ms` debounce ke baad `fetchSearchResults(value)` call hota hai.
6. API call hoti hai:

```txt
GET /api/gov-post/find-by-title?title=<encodedQuery>&limit=8
```

7. Response ka `payload.data` array `searchResults` me set hota hai.
8. Agar results aate hain to dropdown show hota hai.

## 2) Result Click Ka Flow
Header dropdown me result click par:

1. `handleResultClick(result)` dropdown close karta hai aur state reset karta hai.
2. URL normalize hota hai via `getCleanPostUrl(result.url || result.link)`.
3. Router navigation hoti hai:
   - Prefer: clean internal path (generally `/post/...`)
   - Fallback: original `result.url`

## 3) Enter Press / Search Button Ka Flow (Full Search Page)
Header me Enter press (ya mobile overlay Search button) par:

1. `handleSearchSubmit()` query validate karta hai (`>= 2` chars).
2. Debounce timer + active request cancel hoti hai.
3. Page navigation hoti hai:

```txt
/search?q=<encodedQuery>
```

## 4) `/search` Page Par Data Kaise Aata Hai
`app/search/page.jsx` server-side initial fetch karta hai:

```txt
GET <baseUrl>/api/gov-post/find-by-title?title=<encodedQuery>&limit=20
```

- `getBaseUrl()` (`lib/server-url.js`) host/protocol resolve karta hai.
- `cache: "no-store"` use hua hai, isliye fresh data fetch hota hai.
- Results `SearchClient` ko `initialResults` ke form me milte hain.

`SearchClient.jsx` me query change hone par client-side fetch bhi hota hai:

```txt
GET /api/gov-post/find-by-title?title=<encodedQuery>&limit=24
```

## 5) Actual API Ka Backend Logic
Endpoint: `app/api/gov-post/find-by-title/route.js`

### Request Params
- `title` (required, min 2 chars)
- `limit` (optional, default 10)

### Backend Steps
1. Input validate hota hai (`title` minimum 2 chars).
2. Regex-safe query build hoti hai (special chars escaped).
3. DB connection: `connectDB()`.
4. Parallel me 2 sources query hote hain:
   - `joblist` collection (`jobs.title` match)
   - `Post` collection (`recruitment.title` match)
5. Dono sources flatten + normalize hote hain.
6. Combined list `updatedAt` desc me sort hoti hai.
7. Final JSON response:
   - `success`
   - `count`
   - `data` (array)

## 6) APIs Used Summary
Header/search flow me primary API yahi hai:

1. `GET /api/gov-post/find-by-title`

Different places par different limits use ho rahi hain:

1. Header live dropdown: `limit=8`
2. Search page server fetch: `limit=20`
3. Search page client fetch: `limit=24`

## 7) Quick End-to-End Sequence
1. User header me type karta hai.
2. Debounced call `/api/gov-post/find-by-title` hit karti hai.
3. Dropdown results render hote hain.
4. User:
   - result click kare -> post page open
   - Enter/Search kare -> `/search?q=...` open
5. `/search` page same API se full results fetch karke list show karta hai.

