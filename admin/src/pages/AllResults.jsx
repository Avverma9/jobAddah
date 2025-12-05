import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getResults } from "../../redux/slices/resources";
import { Link } from "react-router-dom";
import {
  Award, // Results के लिए trophy icon
  Search,
  Loader2,
  Trash2,
  Pencil,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { deleteJob } from "../../redux/slices/job";

export default function AllResults() {
  const dispatch = useDispatch();
  const { results } = useSelector((state) => state.resource);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(getResults());
  }, [dispatch]);

  const loading = results?.loading;
  const list = results?.data || [];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((it) =>
      (it.postTitle || it.title || "").toLowerCase().includes(q)
    );
  }, [list, query]);

  // search change par page reset
  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const currentPageItems = filteredItems.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this result?");
    if (!ok) return;
    try {
      await dispatch(deleteJob(id)).unwrap();
      alert("Result deleted");
      dispatch(getResults());
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete result: " + (err?.message || err));
    }
  };

  const getStatusBadge = (item) => {
    const now = new Date();
    const dateStr = item.date || item.publishedAt;
    if (!dateStr)
      return {
        label: "Recent",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (d < now) {
      return {
        label: "Published",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return {
        label: "This week",
        className: "bg-sky-50 text-sky-700 border-sky-200",
      };
    }

    return {
      label: "Upcoming",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Award className="h-4 w-4" />
            <span>Resources</span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            All Results
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor all published result notifications.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="hidden text-xs text-slate-400 sm:inline">
            Total: {list.length}
          </span>
        </div>
      </div>

      {/* Search + meta */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search results by title..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400 sm:justify-end">
          <span className="hidden sm:inline">
            Showing {currentPageItems.length} of {totalItems}
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </span>
          )}
        </div>
      </div>

      {/* Card + table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Top strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              RS
            </span>
            <span>Results table</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Edit any entry to view & update full details.
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching results…
          </div>
        )}

        {!loading && totalItems === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Award className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">
              No results found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search keywords or check again later.
            </p>
          </div>
        )}

        {!loading && totalItems > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-slate-100 text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Result</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium text-center">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentPageItems.map((item, idx) => {
                    const id = item.id || item._id || item.slug || idx;
                    const title = item.postTitle || item.title || item.slug;
                    const date = item.date || item.publishedAt || "-";
                    const source = item.source || item.sourceName || "-";
                    const status = getStatusBadge(item);

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <Award className="h-3.5 w-3.5" />
                              </span>
                              <span className="line-clamp-2 text-sm font-medium text-slate-900">
                                {title}
                              </span>
                            </div>
                            {item.excerpt && (
                              <p className="pl-8 text-xs text-slate-500 line-clamp-2">
                                {item.excerpt}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-middle text-xs text-slate-600">
                          {date}
                        </td>

                        <td className="px-4 py-3 align-middle text-xs text-slate-600">
                          {source}
                        </td>

                        <td className="px-4 py-3 align-middle text-center text-xs">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-middle text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/dashboard/job-edit/${encodeURIComponent(
                                id
                              )}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              View & Edit
                            </Link>

                            <button
                              onClick={() => handleDelete(id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + pageSize, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalItems}
                </span>{" "}
                results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    page === 1
                      ? "cursor-not-allowed border-slate-100 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                <span className="text-[11px] text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-700">{page}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {totalPages}
                  </span>
                </span>

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    page === totalPages
                      ? "cursor-not-allowed border-slate-100 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
