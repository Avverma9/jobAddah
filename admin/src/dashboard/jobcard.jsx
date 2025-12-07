import React, { useEffect, useState, useCallback } from "react"; 
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob, markFav } from "../../redux/slices/job";
import toast from 'react-hot-toast';
import { StarIcon, StarIcon as StarIconSolid } from "@heroicons/react/24/outline";

export default function JobCard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs: jobData, loading } = useSelector((state) => state.job);

  // NEW: Local state for instant UI updates
  const [localJobs, setLocalJobs] = useState([]);

  // NEW: Optimistic update function for instant star toggle
  const updateLocalJobFav = useCallback((jobId, newFavValue) => {
    setLocalJobs(prevJobs => 
      prevJobs.map(job => 
        (job._id || job.id) === jobId 
          ? { ...job, fav: newFavValue }
          : job
      )
    );
  }, []);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  // NEW: Sync localJobs with redux jobData when redux data changes
  useEffect(() => {
    if (Array.isArray(jobData)) {
      setLocalJobs(jobData);
    }
  }, [jobData]);

  // UPDATED: Same mapper as AllJobs - API response ko UI-friendly format me convert
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
      fav: job.fav || false  // Ensure fav key exists
    };
  };

  const handleEditClick = (id) => {
    navigate(`/dashboard/job-edit/${id}`);
  };

  // UPDATED: Mark/Unmark Favorite function with INSTANT optimistic update + toast
  const toggleFavorite = async (id, currentFav) => {
    const newFavValue = !currentFav;
    
    // OPTIMISTIC UPDATE - Instant UI change
    updateLocalJobFav(id, newFavValue);
    
    try {
      await dispatch(markFav({ id, fav: newFavValue })).unwrap();
      toast.success(
        newFavValue 
          ? 'Added to favorites' 
          : 'Removed from favorites',
        { duration: 2000 }
      );
    } catch (err) {
      // REVERT on error
      updateLocalJobFav(id, currentFav);
      console.error("Favorite toggle failed:", err);
      toast.error('Failed to update favorite status');
    }
  };

  // NEW: Custom delete confirmation with react-hot-toast
  const handleDelete = async (id) => {
    const confirmed = await toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Delete this job?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await dispatch(deleteJob(id)).unwrap();
                  toast.success('Job deleted successfully');
                } catch (err) {
                  console.error("Delete failed:", err);
                  toast.error('Failed to delete job');
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-right',
        style: {
          maxWidth: '400px',
          padding: '16px',
        }
      }
    );
  };

  const JobRow = ({ id, title, category, date, status, fav }) => (
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
          {/* ✨ INSTANT Favorite Star Icon - NO reload needed */}
          <button
            onClick={() => toggleFavorite(id, fav)}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors group/star"
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            {fav ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400 group-hover/star:text-yellow-500" />
            ) : (
              <StarIcon className="w-5 h-5 text-slate-400 group-hover/star:text-yellow-400 transition-colors" />
            )}
          </button>
          
          <button
            onClick={() => handleEditClick(id)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
          {/* NEW: Custom toast delete instead of window.confirm */}
          <button
            onClick={() => handleDelete(id)}
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  // UPDATED: Normalize localJobs data before rendering - instant updates
  const normalizedJobs = Array.isArray(localJobs) 
    ? localJobs.map(mapApiJobToUI)
    : [];

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
                  fav={job.fav}
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
