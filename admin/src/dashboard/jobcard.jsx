import React, { useEffect } from "react"; 
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob } from "../../redux/slices/job";

export default function JobCard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs: jobData, loading } = useSelector((state) => state.job);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  // NEW: Same mapper as AllJobs - API response ko UI-friendly format me convert
  const mapApiJobToUI = (job) => {
    // Title: postTitle first, fallback to old title
    const title = job.postTitle || job.title || job.name || "Untitled";

    // Category/Organization: organization first, fallback to old org/category
    const category = job.organization || job.org || job.category || "-";

    // Date priority: createdAt -> Application Start dates -> Result dates
    let displayDate = job.createdAt || "";
    if (!displayDate && Array.isArray(job.importantDates)) {
      const datePriority = [
        "Application Start", "Online Apply Start Date", "Application Start Date",
        "Batch Start", "Result Declared", "Result Date", "Merit List Released",
        "Certificate Issued", "Exam Date"
      ];
      
      for (const label of datePriority) {
        const found = job.importantDates.find(d => 
          (d.label || "").toLowerCase().includes(label.toLowerCase())
        );
        if (found?.value) {
          displayDate = found.value;
          break;
        }
      }
    }

    // Status logic based on new API structure
    let status = "Active";
    const postType = (job.postType || "").toUpperCase();
    
    if (postType === "RESULT") {
      status = "Expired";
    } else if (["JOB", "PRIVATEJOB"].includes(postType)) {
      status = job.isLive === false ? "Expired" : "Active";
    } else {
      status = job.status || "Active";
    }

    return {
      ...job,
      title,
      category,
      date: displayDate,
      status,
    };
  };

  const handleEditClick = (id) => {
    navigate(`/dashboard/job-edit/${id}`);
  };

  const JobRow = ({ id, title, category, date, status }) => (
    <tr className="group hover:bg-slate-50 transition-colors duration-200">
      <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
        {title}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {category}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-500">
        {date 
          ? new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-"
        }
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
            ${
              status === "Active"
                ? "bg-green-100 text-green-800"
                : status === "Expired"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }
          `}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEditClick(id)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={async () => {
              const ok = window.confirm("Delete this job?");
              if (!ok) return;
              try {
                await dispatch(deleteJob(id)).unwrap();
                alert("Job deleted");
              } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete: " + (err?.message || "Unknown"));
              }
            }}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  // NEW: Normalize jobs data before rendering
  const normalizedJobs = Array.isArray(jobData) ? jobData.map(mapApiJobToUI) : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Recent Job Posts
        </h3>
        <button
          onClick={() => navigate("/dashboard/all-jobs")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Post Name</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-6">
                  Loading...
                </td>
              </tr>
            ) : normalizedJobs.length > 0 ? (
              normalizedJobs.slice(0, 5).map((job) => (
                <JobRow
                  key={job._id || job.id}
                  id={job._id || job.id}
                  title={job.title}
                  category={job.category}
                  date={job.date}
                  status={job.status}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-6">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
