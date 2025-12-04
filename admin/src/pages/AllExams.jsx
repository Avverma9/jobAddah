import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getExams, deleteExam } from "../../redux/slices/resources";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function AllExams() {
  const dispatch = useDispatch();
  const { exams } = useSelector((state) => state.resource);
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(getExams());
  }, [dispatch]);

  const items = (exams?.data || []).filter((it) =>
    (it.postTitle || it.title || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Upcoming Exams</h2>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exams..."
          className="w-full rounded border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        {exams?.loading && (
          <div className="p-4 text-slate-500">Loading exams...</div>
        )}

        {!exams?.loading && items.length === 0 && (
          <div className="p-4 text-slate-400">No exams found.</div>
        )}

        {!exams?.loading && items.length > 0 && (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Source</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item, idx) => {
                const id = item.id || item._id || item.slug || idx;
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 align-middle">
                      <div className="text-sm font-medium text-slate-800">{item.postTitle || item.title || item.slug}</div>
                      {item.excerpt && <div className="text-xs text-slate-500 line-clamp-2">{item.excerpt}</div>}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-600">{item.date || item.publishedAt || "-"}</td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-600">{item.source || item.sourceName || "-"}</td>
                    <td className="px-4 py-3 align-middle text-right space-x-2">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-slate-50 border border-transparent"
                        >
                          View
                        </a>
                      ) : (
                        <button className="inline-block rounded px-3 py-1 text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed" disabled>
                          View
                        </button>
                      )}

                      <Link
                        to={`/dashboard/job-edit/${encodeURIComponent(id)}`}
                        className="inline-block rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          const ok = window.confirm("Delete this exam?");
                          if (!ok) return;
                          try {
                            await dispatch(deleteExam(id)).unwrap();
                            alert("Exam deleted");
                          } catch (err) {
                            console.error('Delete failed', err);
                            alert('Failed to delete exam: ' + (err?.message || err));
                          }
                        }}
                        className="inline-block rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
