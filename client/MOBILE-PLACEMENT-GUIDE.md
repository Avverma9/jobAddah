# Mobile Placement Guide — Quick Commands

Ye guide chhote, seedhe commands aur JSX snippets deta hai — bina paths ke. Sirf component ke naam bataiye aur kaha lagana hai. Har snippet mobile-only behavior ensure karta hai (desktop kuch bhi render nahi karega).

Note: assume a `isMobile` boolean (hook) available: `const isMobile = useIsMobile();`

---

## Basic rule (single source of truth)
- Command: "Mobile-only rendering — use `isMobile` as guard"
- Snippet:

```jsx
if (!isMobile) return null; // render nothing on desktop
return (
  <MobileLayout>
    {/* mobile components here */}
  </MobileLayout>
);
```

---

## 1) Top header
- Component: `MobileHeader`
- Command: "Always render at top inside `MobileLayout`, sticky"
- Snippet:

```jsx
<MobileLayout>
  <MobileHeader onSearchToggle={openSearch} />
  {/* rest */}
</MobileLayout>
```

---

## 2) Hero banner (mobile home)
- Component: `GovtHeroSection` (mobile) or `PrivateHeroSection` when showing private jobs
- Command: "Put immediately below `MobileHeader` on home"
- Snippet:

```jsx
<MobileHeader />
<GovtHeroSection />
```

---

## 3) Expiring / Reminders carousel
- Component: `ExpiringSoonSection`
- Command: "Below hero; pass `reminders` object and `loading` flag"
- Snippet:

```jsx
<ExpiringSoonSection reminders={reminders} loading={remindersLoading} />
```

Behavior note: show skeleton only if `loading` AND combined reminders array is empty.

---

## 4) Section tabs (govt sections)
- Component: `SectionTabs`
- Command: "After `ExpiringSoonSection`, add `SectionTabs` to switch categories"
- Snippet:

```jsx
<SectionTabs sections={sections} activeTab={tab} onTabChange={setTab} />
```

---

## 5) Job list
- Components: `JobListSection` (renders `JobListItem`)
- Command: "Below tabs, render `JobListSection` for active tab's jobs"
- Snippet:

```jsx
<JobListSection jobs={currentJobs} loading={sectionsLoading} />
```

UX tip: use `showSkeleton = loading && (!currentJobs || currentJobs.length === 0)` (stale-while-revalidate).

---

## 6) Bottom navigation
- Component: `BottomNav`
- Command: "Always rendered inside `MobileLayout` at bottom; provides view switch callbacks"
- Snippet:

```jsx
<MobileLayout>
  {/* header + content */}
  <BottomNav activeView={view} onViewChange={setView} />
</MobileLayout>
```

---

## 7) Private jobs
- Component: `PrivateJobsView` (composed: hero + tabs + list)
- Command: "When mobile view is Private, render this one component"
- Snippet:

```jsx
if (activeView === 'pvt') {
  return <PrivateJobsView categories={cats} loading={catsLoading} sectionsByLink={map} />;
}
```

Implementation note: `PrivateJobsView` manages `activeTab` internally.

---

## 8) Deadlines / Full reminders list
- Component: `DeadlinesView`
- Command: "When user selects Deadlines tab, render `DeadlinesView` with reminders and loading"
- Snippet:

```jsx
if (activeView === 'deadlines') {
  return <DeadlinesView reminders={reminders} loading={remindersLoading} />;
}
```

---

## 9) Tools landing (mobile)
- Component: `ToolsView`
- Command: "When Tools tab active, render `ToolsView` — card list linking to tools"
- Snippet:

```jsx
if (activeView === 'tools') return <ToolsView />;
```

---

## 10) Mobile post details
- Pattern: wrap mobile post content inside `MobileLayout` to show mobile header and bottom nav
- Command: "If mobile, render `MobileLayout` with mobile post markup"
- Snippet:

```jsx
if (isMobile) {
  return (
    <MobileLayout title={postTitle} showBack>
      {/* mobile-specific post details UI */}
    </MobileLayout>
  );
}
```

---

## 11) Skeletons & stale-while-revalidate (always)
- Command: "Show skeleton only when no previous data"
- Snippet:

```jsx
const showSkeleton = loading && (!data || data.length === 0);
return showSkeleton ? <Skeleton/> : <Content data={data} />;
```

---

## 12) Defensive field access
- Command: "Always read job/reminder fields defensively to support different API shapes"
- Snippet:

```jsx
const title = job?.title || job?.postTitle || 'Job';
const link = job?.link || job?.id || job?._id;
```

---

## 13) Ensure no desktop elements mount on mobile
- Command: "Wrap any Desktop-only UI with `!isMobile` check"
- Snippet:

```jsx
{ !isMobile && <Header/> }
{ !isMobile && <Footer/> }
```

This ensures pure mobile view has NO desktop headers/ads.

---

## 14) Quick restore checklist (1-line commands)
- If a mobile component is deleted:
  - recreate the component with the same name and props
  - export default it
  - add it into `MobileLayout` or the page's mobile branch
  - restart dev server

Snippets (one-liners):

```jsx
// recreate and export
const ComponentName = (props) => ( <div>...</div> );
export default ComponentName;

// add to mobile page
if (isMobile) return <MobileLayout><ComponentName /></MobileLayout>;
```

---

## Final micro-rule (remember)
- Command: "Use `isMobile` as the single source of truth for mobile-only rendering."

```jsx
// single rule
return isMobile ? <MobileLayout>...mobile...</MobileLayout> : <DesktopApp/>;
```

---

Kuch aur chahiye ho to bol do — main yeh file repo mein bhi save kar sakta hoon (kar dun?).