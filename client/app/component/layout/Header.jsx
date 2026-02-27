import { ArrowRight, Briefcase, Landmark, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { buildCanonicalKey } from "../../lib/postFormatter";

function firstNonEmpty(values = []) {
  for (const value of values) {
    const text = String(value || "").trim();

    if (text) {
      return text;
    }
  }

  return "";
}

export default function Header({
  scrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  searchQuery = "",
  setSearchQuery,
  searchResults = [],
  showSearchResults = false,
  searchLoading = false,
  searchError = "",
}) {
  const hasSearch = typeof setSearchQuery === "function";
  const visibleResults = Array.isArray(searchResults) ? searchResults.slice(0, 8) : [];
  const menuItems = [
    { label: "Jobs", href: "/jobs" },
    { label: "Results", href: "/results" },
    { label: "Admit Cards", href: "/admit-cards" },
  ];

  return (
    <header
      className={`fixed top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 py-3 backdrop-blur-xl transition-all duration-500 ${
        scrolled ? "shadow-sm" : "shadow-none"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-2 transition-colors duration-500">
              <Landmark className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-xl leading-none font-black tracking-tight text-slate-900 sm:text-2xl">
                Jobs
                <span className="text-indigo-600">Addah</span>
              </h1>
            </div>
          </Link>

          {hasSearch ? (
            <div className="relative hidden min-w-0 flex-1 px-2 lg:block">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <Search className="mr-3 h-5 w-5 text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search jobs... Ex: SSC CGL, UP Police"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="ml-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {showSearchResults ? (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                    <p className="text-xs font-black tracking-wide text-slate-500 uppercase">
                      Search Results
                    </p>
                    {!searchLoading && !searchError ? (
                      <p className="text-[11px] font-bold text-slate-400">
                        {visibleResults.length} item{visibleResults.length === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2">
                    {searchLoading ? (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold text-slate-500">
                        <Search className="h-4 w-4 animate-pulse text-indigo-500" />
                        Searching jobs...
                      </div>
                    ) : searchError ? (
                      <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">
                        {searchError}
                      </div>
                    ) : visibleResults.length > 0 ? (
                      visibleResults.map((item, index) => {
                        const title = firstNonEmpty([item?.title, item?.jobTitle, "Untitled Job"]);
                        const jobUrl = firstNonEmpty([item?.jobUrl, item?.url, item?.link]);
                        const jobHref = jobUrl
                          ? `/post/${buildCanonicalKey({ title, jobUrl })}`
                          : "";
                        const key = `job-${title}-${index}`;

                        const content = (
                          <>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <Briefcase className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-extrabold text-slate-800">
                                {title}
                              </p>
                              <span className="mt-1 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black tracking-wide text-indigo-700">
                                JOB
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                          </>
                        );

                        if (jobHref) {
                          return (
                            <Link
                              key={key}
                              href={jobHref}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                            >
                              {content}
                            </Link>
                          );
                        }

                        return (
                          <div key={key} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                            {content}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold text-slate-500">
                        <Search className="h-4 w-4 text-slate-300" />
                        No result found
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <nav className="ml-auto hidden items-center gap-8 rounded-full border border-slate-200 bg-slate-50 px-6 py-2.5 shadow-sm lg:flex">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-bold tracking-wide text-slate-700 transition-colors hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            className="rounded-xl p-2 text-slate-800 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {hasSearch ? (
          <div className="relative mt-3 lg:hidden">
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search className="mr-3 h-5 w-5 text-indigo-500" />
              <input
                type="text"
                placeholder="Search jobs... Ex: SSC CGL, UP Police"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {showSearchResults ? (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                  <p className="text-xs font-black tracking-wide text-slate-500 uppercase">
                    Search Results
                  </p>
                  {!searchLoading && !searchError ? (
                    <p className="text-[11px] font-bold text-slate-400">
                      {visibleResults.length} item{visibleResults.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>

                <div className="max-h-72 overflow-y-auto p-2">
                  {searchLoading ? (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold text-slate-500">
                      <Search className="h-4 w-4 animate-pulse text-indigo-500" />
                      Searching jobs...
                    </div>
                  ) : searchError ? (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">
                      {searchError}
                    </div>
                  ) : visibleResults.length > 0 ? (
                    visibleResults.map((item, index) => {
                      const title = firstNonEmpty([item?.title, item?.jobTitle, "Untitled Job"]);
                      const jobUrl = firstNonEmpty([item?.jobUrl, item?.url, item?.link]);
                      const jobHref = jobUrl
                        ? `/post/${buildCanonicalKey({ title, jobUrl })}`
                        : "";
                      const key = `job-${title}-${index}`;

                      const content = (
                        <>
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-slate-800">
                              {title}
                            </p>
                            <span className="mt-1 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black tracking-wide text-indigo-700">
                              JOB
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                        </>
                      );

                      if (jobHref) {
                        return (
                          <Link key={key} href={jobHref} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        >
                          {content}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl px-3 py-4 text-sm font-semibold text-slate-500">
                      <Search className="h-4 w-4 text-slate-300" />
                      No result found
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {isMobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 absolute top-full left-0 w-full border-t border-slate-100 bg-white shadow-2xl md:hidden">
          <div className="space-y-4 px-6 py-6">
            <div className="grid grid-cols-3 gap-3 pt-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl bg-slate-50 p-3 text-center font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
