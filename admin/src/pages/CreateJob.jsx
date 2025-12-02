import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Code,
  X,
  Upload,
} from "lucide-react";
import { createJob, bulkInsert } from "../../redux/slices/job"; // 👈 make sure bulkInsert thunk exists

export default function CreateJobPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // rawData = ya to ek object hoga (single insert) ya ek array (bulk)
  const [rawData, setRawData] = useState(null);
  const [mode, setMode] = useState("none"); // "none" | "single" | "bulk"

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");

  // -------- JSON IMPORT --------
  const handleImportJson = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(jsonInput);

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          setJsonError("Array is empty. Add at least one item.");
          return;
        }
        setMode("bulk");
        setRawData(parsed);
      } else if (typeof parsed === "object" && parsed !== null) {
        setMode("single");
        setRawData(parsed);
      } else {
        setJsonError("JSON must be either an object or an array of objects.");
        return;
      }

      setShowJsonModal(false);
      setJsonInput("");
      alert("JSON imported successfully!");
    } catch (err) {
      console.error(err);
      setJsonError("Invalid JSON format. Please check and try again.");
    }
  };

  // -------- Helper: nested path read/write --------
  const updateField = (path, value) => {
    if (mode !== "single" || !rawData || typeof rawData !== "object") return;

    setRawData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = copy;
      keys.forEach((k, i) => {
        if (i === keys.length - 1) cur[k] = value;
        else {
          if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
          cur = cur[k];
        }
      });
      return copy;
    });
  };

  const evalPath = (obj, path) =>
    path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);

  const addArrayItem = (path) => {
    if (mode !== "single") return;
    const existing = evalPath(rawData, path);
    const baseItem =
      Array.isArray(existing) && existing.length > 0 && typeof existing[0] === "object"
        ? { ...existing[0] }
        : {};
    const newArr = [...(existing || []), baseItem];
    updateField(path, newArr);
  };

  const removeArrayItem = (path, index) => {
    if (mode !== "single") return;
    const existing = evalPath(rawData, path);
    if (!Array.isArray(existing)) return;
    const newArr = existing.filter((_, i) => i !== index);
    updateField(path, newArr);
  };

  // -------- Dynamic renderer (for SINGLE mode only) --------
  const renderField = (key, value, path = "") => {
    const fullPath = path ? `${path}.${key}` : key;

    // meta fields agar skip karne ho to idhar add kar sakte ho
    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;

    // Array
    if (Array.isArray(value)) {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200 my-4">
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </h3>
            <button
              onClick={() => addArrayItem(fullPath)}
              className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              + Add Item
            </button>
          </div>

          <div className="p-4 space-y-3">
            {value.length === 0 ? (
              <div className="text-slate-400 text-sm text-center">
                No items yet. Click "Add Item" to add.
              </div>
            ) : (
              value.map((item, index) => (
                <div
                  key={index}
                  className="relative border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <button
                    onClick={() => removeArrayItem(fullPath, index)}
                    className="absolute top-2 right-2 text-xs text-red-500 hover:bg-red-50 rounded px-2 py-1"
                  >
                    Remove
                  </button>

                  {typeof item === "object" && item !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                      {Object.keys(item).map((subKey) =>
                        renderField(subKey, item[subKey], `${fullPath}.${index}`)
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item ?? ""}
                      onChange={(e) =>
                        updateField(`${fullPath}.${index}`, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Object
    if (typeof value === "object" && value !== null) {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200 my-4">
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(value).map((subKey) =>
              renderField(subKey, value[subKey], fullPath)
            )}
          </div>
        </div>
      );
    }

    // Boolean
    if (typeof value === "boolean") {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200 my-4 p-4">
          <label className="flex items-center gap-2 text-sm font-medium capitalize">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateField(fullPath, e.target.checked)}
            />
            {key.replace(/([A-Z])/g, " $1").trim()}
          </label>
        </div>
      );
    }

    // Primitive text/number
    return (
      <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200 my-4 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
          {key.replace(/([A-Z])/g, " $1").trim()}
        </label>
        <input
          type={
            key.toLowerCase().includes("date")
              ? "date"
              : typeof value === "number"
              ? "number"
              : "text"
          }
          value={value ?? ""}
          onChange={(e) => updateField(fullPath, e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    );
  };

  // -------- CREATE / SUBMIT --------
  const handleCreate = () => {
    if (!rawData) {
      alert("Please import JSON first.");
      return;
    }

    if (mode === "single") {
      dispatch(createJob(rawData))
        .unwrap()
        .then(() => {
          alert("Job created successfully (single)!");
          navigate("/dashboard/all-jobs");
        })
        .catch((err) => {
          alert("Failed to create job: " + (err?.message || "Unknown error"));
        });
    } else if (mode === "bulk") {
      if (!Array.isArray(rawData) || rawData.length === 0) {
        alert("No records found for bulk insert.");
        return;
      }
      dispatch(bulkInsert(rawData))
        .unwrap()
        .then(() => {
          alert(`Bulk insert successful! (${rawData.length} posts)`);
          navigate("/dashboard/all-jobs");
        })
        .catch((err) => {
          alert("Failed to bulk insert: " + (err?.message || "Unknown error"));
        });
    } else {
      alert("Import JSON first.");
    }
  };

  // -------- UI --------
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJsonModal(true)}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md"
            >
              <Code size={18} /> Import JSON
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md"
            >
              <Save size={18} />{" "}
              {mode === "bulk" ? "Bulk Insert" : "Create Post"}
            </button>
          </div>
        </div>

        {/* Main Body */}
        {mode === "none" && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 p-12 text-center">
            <Code size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No JSON Loaded
            </h3>
            <p className="text-slate-500 mb-6">
              Click &quot;Import JSON&quot; to paste your job/answer key
              structure.
            </p>
            <button
              onClick={() => setShowJsonModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md"
            >
              <Upload size={18} />
              Import JSON Data
            </button>
          </div>
        )}

        {mode === "single" && typeof rawData === "object" && rawData !== null && (
          <>
            <div className="text-sm text-slate-500">
              Mode: <span className="font-semibold text-blue-600">Single Insert</span>
            </div>
            {Object.keys(rawData).map((key) => renderField(key, rawData[key]))}
          </>
        )}

        {mode === "bulk" && Array.isArray(rawData) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Bulk Insert Preview
              </h3>
              <span className="text-sm text-slate-500">
                Total records:{" "}
                <span className="font-semibold text-blue-600">
                  {rawData.length}
                </span>
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto border border-slate-100 rounded-lg">
              {rawData.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-slate-100 text-sm flex justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {item.postTitle || item.postName || item.slug || `Item ${index + 1}`}
                    </div>
                    <div className="text-slate-500 text-xs truncate max-w-[400px]">
                      {item.shortInfo || JSON.stringify(item).slice(0, 120) + "..."}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Note: Bulk mode does not provide field editing. If you want to edit fields,
              import a single object instead of an array.
            </p>
          </div>
        )}
      </div>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Import JSON Data
                  </h2>
                  <p className="text-sm text-slate-500">
                    Paste a single object for single insert or an array for bulk insert.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput("");
                  setJsonError("");
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError("");
                }}
                placeholder="Paste your JSON here..."
                className="w-full h-96 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs resize-none"
              />

              {jsonError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {jsonError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput("");
                  setJsonError("");
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md"
              >
                <Upload size={18} />
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
