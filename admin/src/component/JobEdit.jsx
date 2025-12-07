import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Code, X, Copy, AlertCircle, CheckCircle,
  ChevronDown, Plus, Trash2, Calendar, Hash, Type, ToggleLeft,
  MoreVertical, FileText, Layers
} from "lucide-react";
import { getJobById, updateJob, deleteJob } from "../../redux/slices/job";

// --- Utility Functions ---

const formatLabel = (text) => {
  if (!text) return "";
  // Split camelCase, capitalize first letter
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const cleanData = (data) => {
  const copy = JSON.parse(JSON.stringify(data));
  ["_id", "__v", "createdAt", "updatedAt"].forEach((key) => delete copy[key]);
  return copy;
};

const getEmptySchema = (obj) => {
  const newObj = {};
  for (const key in obj) {
    if (typeof obj[key] === "number") newObj[key] = 0;
    else if (typeof obj[key] === "boolean") newObj[key] = false;
    else newObj[key] = "";
  }
  return newObj;
};

// --- Specialized Components ---

// 1. Professional Switch Component
const SwitchInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-700">{formatLabel(label)}</span>
      <span className="text-xs text-slate-400">{value ? "Enabled" : "Disabled"}</span>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        value ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

// 2. Compact Input Component
const SimpleInput = ({ label, value, path, onChange, error }) => {
  const isDate = label.toLowerCase().includes("date") || (!isNaN(Date.parse(value)) && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value));
  const isNumber = typeof value === "number";
  
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
        {formatLabel(label)}
        {error && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        <input
          type={isDate ? "date" : isNumber ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(path, isNumber ? Number(e.target.value) : e.target.value)}
          className={`w-full text-sm font-medium text-slate-800 bg-slate-50 border px-3 py-2.5 rounded-lg outline-none transition-all ${
            error
              ? "border-red-500 bg-red-50 focus:border-red-600"
              : "border-slate-200 focus:border-blue-500 focus:bg-white focus:shadow-sm group-hover:border-slate-300"
          }`}
          placeholder={`Enter ${formatLabel(label).toLowerCase()}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-50">
          {isDate ? <Calendar size={14} /> : isNumber ? <Hash size={14} /> : null}
        </div>
      </div>
      {error && <p className="text-red-600 text-[10px] mt-1 font-medium">{error}</p>}
    </div>
  );
};

// 3. Array Manager (New Items on TOP)
const ArrayField = ({ label, value, path, onChange, renderRecursive }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addItem = () => {
    let newItem = "";
    if (value.length > 0 && typeof value[0] === "object") {
      newItem = getEmptySchema(value[0]);
    } else if (value.length === 0) {
       // Best guess for empty array: object
       newItem = {}; 
    }
    // INSERT AT TOP (Spread newItem first)
    onChange(path, [newItem, ...value]);
    setIsExpanded(true);
  };

  const removeItem = (index) => {
    const newArr = [...value];
    newArr.splice(index, 1);
    onChange(path, newArr);
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden mb-4">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-blue-600" />
          <span className="font-semibold text-slate-700 text-sm">{formatLabel(label)}</span>
          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
            {value.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <button
            onClick={(e) => { e.stopPropagation(); addItem(); }}
            className="flex items-center gap-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors shadow-sm"
          >
            <Plus size={12} /> ADD NEW
          </button>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 bg-slate-50/50 space-y-3">
          {value.length === 0 && (
             <div className="text-center py-6 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
                No items in this list. Click "Add New" to start.
             </div>
          )}
          {value.map((item, index) => (
            <div key={index} className="relative group bg-white rounded border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-all hover:border-blue-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50 bg-slate-50/30">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Index {index}</span>
                 <button
                  onClick={() => removeItem(index)}
                  className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 gap-4">
                {typeof item === "object" && item !== null ? (
                  // If array contains objects, map keys
                  Object.keys(item).map((subKey) => (
                    renderRecursive(subKey, item[subKey], `${path}.${index}`)
                  ))
                ) : (
                  // If array contains primitives (strings/numbers)
                  renderRecursive(index, item, path) 
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. Object Wrapper
const ObjectField = ({ label, value, path, renderRecursive }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-slate-200 rounded-lg bg-white mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-slate-50 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
          <span className="font-semibold text-slate-700 text-sm">{formatLabel(label)}</span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
          {Object.keys(value).map((key) => renderRecursive(key, value[key], path))}
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

export default function JobEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJob, loading, error } = useSelector((state) => state.job);

  const [formData, setFormData] = useState({});
  const [modalState, setModalState] = useState({ showJson: false, showDelete: false });
  const [jsonOutput, setJsonOutput] = useState("");
  const [status, setStatus] = useState({ saving: false, copySuccess: false, message: "" });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) dispatch(getJobById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (currentJob) {
      setFormData(JSON.parse(JSON.stringify(currentJob)));
    }
  }, [currentJob]);

  const handleFieldChange = useCallback((path, newValue) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current = copy;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}; 
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = newValue;
      return copy;
    });
  }, []);

  // --- Recursive Render Logic ---
  const renderField = (key, value, parentPath = "") => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    
    // Ignore internal keys
    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;

    // 1. Handle Boolean (Switch)
    if (typeof value === "boolean") {
        return (
            <div key={currentPath} className="col-span-1 md:col-span-2">
                <SwitchInput label={key} value={value} onChange={(val) => handleFieldChange(currentPath, val)} />
            </div>
        );
    }

    // 2. Handle Arrays
    if (Array.isArray(value)) {
      return (
        <div key={currentPath} className="col-span-1 md:col-span-2">
            <ArrayField
            label={key}
            value={value}
            path={currentPath}
            onChange={handleFieldChange}
            renderRecursive={renderField}
            />
        </div>
      );
    }

    // 3. Handle Objects
    if (typeof value === "object" && value !== null) {
      return (
        <div key={currentPath} className="col-span-1 md:col-span-2">
            <ObjectField
            label={key}
            value={value}
            path={currentPath}
            renderRecursive={renderField}
            />
        </div>
      );
    }

    // 4. Handle Primitives (String/Number)
    return (
      <SimpleInput
        key={currentPath}
        label={key}
        value={value}
        path={currentPath}
        onChange={handleFieldChange}
        error={validationErrors[currentPath]}
      />
    );
  };

  const handleExportJson = () => {
    setJsonOutput(JSON.stringify(cleanData(formData), null, 2));
    setModalState({ ...modalState, showJson: true });
  };

  const handleUpdate = async () => {
    setStatus((prev) => ({ ...prev, saving: true }));
    try {
      const cleanedData = cleanData(formData);
      await dispatch(updateJob({ id, jobData: cleanedData })).unwrap();
      setStatus({ saving: false, message: "Saved successfully!", copySuccess: false });
      setTimeout(() => setStatus(prev => ({...prev, message: ""})), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ saving: false, message: "" });
      setValidationErrors({ general: "Failed to update." });
    }
  };

  const handleDelete = async () => {
    setStatus((prev) => ({ ...prev, saving: true }));
    try {
      await dispatch(deleteJob(id)).unwrap();
      navigate("/dashboard/all-jobs");
    } catch (err) {
      setStatus({ saving: false, message: "" });
      setValidationErrors({ general: "Delete failed." });
    }
  };

  // --- Render ---

  if (loading || !currentJob) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-2 border-blue-600 rounded-full border-t-transparent"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-20">
      
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Edit Job</h1>
                    <span className="text-[10px] text-slate-400 font-mono">{id}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={handleExportJson} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Export JSON">
                    <Code size={18} />
                </button>
                <button onClick={() => setModalState({...modalState, showDelete: true})} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                    <Trash2 size={18} />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button
                    onClick={handleUpdate}
                    disabled={status.saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
                    status.saving ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    <Save size={14} />
                    {status.saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
            </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {status.message && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce-in">
             <CheckCircle size={18} /> {status.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(formData).length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400">No data found</div>
                ) : (
                    Object.keys(formData).map((key) => renderField(key, formData[key]))
                )}
            </div>
        </div>
      </div>

      {/* JSON Modal */}
      {modalState.showJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700">JSON Data</h3>
                <button onClick={() => setModalState({ ...modalState, showJson: false })} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900 p-5">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">{jsonOutput}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalState.showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center">
             <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <AlertCircle size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Job?</h3>
             <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure?</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setModalState({ ...modalState, showDelete: false })} className="py-2.5 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} className="py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200/50">Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}