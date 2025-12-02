import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Code, X } from "lucide-react";
import { getJobById, updateJob } from "../../redux/slices/job";

export default function JobEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentJob, loading, error } = useSelector((s) => s.job);

  const [formData, setFormData] = useState({});
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonOutput, setJsonOutput] = useState("");

  // --- Load job on mount ---
  useEffect(() => {
    dispatch(getJobById(id));
  }, [id]);

  // --- Load formData when currentJob loads ---
  useEffect(() => {
    if (currentJob) {
      setFormData(JSON.parse(JSON.stringify(currentJob))); // deep clone
    }
  }, [currentJob]);

  // --- Update field helper (supports nested paths) ---
  const updateField = (path, value) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = copy;

      keys.forEach((k, i) => {
        if (i === keys.length - 1) cur[k] = value;
        else {
          if (!cur[k]) cur[k] = {};
          cur = cur[k];
        }
      });

      return copy;
    });
  };

  // --- Add item in array ---
  const addArrayItem = (path) => {
    updateField(path, [...(evalPath(formData, path) || []), {}]);
  };

  // --- Remove item in array ---
  const removeArrayItem = (path, index) => {
    const arr = [...evalPath(formData, path)];
    arr.splice(index, 1);
    updateField(path, arr);
  };

  // --- Utility to read nested path value ---
  const evalPath = (obj, path) => {
    return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
  };

  // --- Export JSON (just clean metadata) ---
  const handleExportJson = () => {
    const cleaned = JSON.parse(JSON.stringify(formData));
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    setJsonOutput(JSON.stringify(cleaned, null, 2));
    setShowJsonModal(true);
  };

  // --- Save / Update API ---
  const handleUpdate = () => {
    const cleaned = JSON.parse(JSON.stringify(formData));
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;

    dispatch(updateJob({ id, jobData: cleaned }))
      .unwrap()
      .then(() => {
        alert("Updated Successfully!");
        navigate("/dashboard/all-jobs");
      })
      .catch(() => alert("Failed to update"));
  };

  // --- Dynamic renderer ---
  const renderField = (key, value, path = "") => {
    const fullPath = path ? `${path}.${key}` : key;

    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;

    // If value is array
    if (Array.isArray(value)) {
      return (
        <div key={fullPath} className="bg-white border rounded-lg p-4 my-4">
          <h3 className="font-semibold mb-2 capitalize">{key}</h3>

          {value.map((item, i) => (
            <div key={i} className="border p-3 rounded mb-2 relative">
              <button
                className="absolute right-2 top-2 text-red-600"
                onClick={() => removeArrayItem(fullPath, i)}
              >
                X
              </button>

              {typeof item === "object"
                ? Object.keys(item).map((sub) =>
                    renderField(sub, item[sub], `${fullPath}.${i}`)
                  )
                : renderField(i, item, fullPath)}
            </div>
          ))}

          <button
            onClick={() => addArrayItem(fullPath)}
            className="mt-2 text-blue-600 underline"
          >
            + Add Item
          </button>
        </div>
      );
    }

    // If object
    if (typeof value === "object" && value !== null) {
      return (
        <div key={fullPath} className="bg-white border rounded-lg p-4 my-4">
          <h3 className="font-semibold mb-2 capitalize">{key}</h3>
          {Object.keys(value).map((sub) =>
            renderField(sub, value[sub], fullPath)
          )}
        </div>
      );
    }

    // Boolean
    if (typeof value === "boolean") {
      return (
        <div key={fullPath} className="my-4 bg-white p-4 border rounded-lg">
          <label className="font-medium capitalize">{key}</label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateField(fullPath, e.target.checked)}
            className="ml-2"
          />
        </div>
      );
    }

    // Default text/number/date field
    return (
      <div key={fullPath} className="my-4 bg-white p-4 border rounded-lg">
        <label className="block mb-1 font-medium capitalize">{key}</label>
        <input
          type={
            key.toLowerCase().includes("date")
              ? "date"
              : typeof value === "number"
              ? "number"
              : "text"
          }
          value={value}
          onChange={(e) => updateField(fullPath, e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
    );
  };

  // ----------------------------------

  if (loading)
    return (
      <div className="p-10">
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-red-600">
        <p>Error loading job.</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft /> Back
      </button>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleExportJson}
          className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Code size={18} /> Export JSON
        </button>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>

      {Object.keys(formData).map((key) =>
        renderField(key, formData[key], "")
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-auto relative">
            <button
              onClick={() => setShowJsonModal(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>
            <textarea
              value={jsonOutput}
              readOnly
              className="w-full h-[400px] border p-3"
            ></textarea>
          </div>
        </div>
      )}
    </div>
  );
}
