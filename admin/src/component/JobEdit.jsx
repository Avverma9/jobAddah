import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Code, X, Copy, AlertCircle, CheckCircle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { getJobById, updateJob } from "../../redux/slices/job";

export default function JobEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentJob, loading, error } = useSelector((state) => state.job);

  const [form_data, set_form_data] = useState({});
  const [show_json_modal, set_show_json_modal] = useState(false);
  const [json_output, set_json_output] = useState("");
  const [is_saving, set_is_saving] = useState(false);
  const [copy_success, set_copy_success] = useState(false);
  const [validation_errors, set_validation_errors] = useState({});
  const [success_message, set_success_message] = useState("");
  const [expanded_sections, set_expanded_sections] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getJobById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentJob) {
      set_form_data(JSON.parse(JSON.stringify(currentJob)));
      set_validation_errors({});
      set_success_message("");
    }
  }, [currentJob]);

  const eval_path = (obj, path_value) => {
    return path_value.split(".").reduce((accumulator, key) => (accumulator ? accumulator[key] : undefined), obj);
  };

  const update_field = (path_value, value) => {
    set_form_data((previous_state) => {
      const copy = JSON.parse(JSON.stringify(previous_state));
      const keys = path_value.split(".");
      let current = copy;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          if (!current[key] || typeof current[key] !== "object") {
            current[key] = {};
          }
          current = current[key];
        }
      });

      return copy;
    });

    if (validation_errors[path_value]) {
      set_validation_errors((previous_errors) => {
        const new_errors = { ...previous_errors };
        delete new_errors[path_value];
        return new_errors;
      });
    }
  };

  const create_empty_object_based_on = (obj) => {
    const new_obj = {};
    for (const key in obj) {
      new_obj[key] = typeof obj[key] === "string" ? "" : typeof obj[key] === "number" ? 0 : typeof obj[key] === "boolean" ? false : "";
    }
    return new_obj;
  };

  const add_array_item = (path_value) => {
    const arr = eval_path(form_data, path_value) || [];
    let new_item = {};

    if (arr.length > 0 && typeof arr[0] === "object") {
      new_item = create_empty_object_based_on(arr[0]);
    }

    update_field(path_value, [...arr, new_item]);
  };

  const remove_array_item = (path_value, index) => {
    const arr = [...eval_path(form_data, path_value)];
    arr.splice(index, 1);
    update_field(path_value, arr);
  };

  const toggle_section = (section_key) => {
    set_expanded_sections((prev) => ({
      ...prev,
      [section_key]: !prev[section_key],
    }));
  };

  const validate_form = () => {
    const errors = {};

    if (!form_data.title || form_data.title.toString().trim() === "") {
      errors.title = "Job title is required";
    }

    if (!form_data.description || form_data.description.toString().trim() === "") {
      errors.description = "Job description is required";
    }

    if (!form_data.company || form_data.company.toString().trim() === "") {
      errors.company = "Company name is required";
    }

    set_validation_errors(errors);
    return Object.keys(errors).length === 0;
  };

  const clean_data = (data) => {
    const copy = JSON.parse(JSON.stringify(data));
    ["_id", "__v", "createdAt", "updatedAt"].forEach((key) => delete copy[key]);
    return copy;
  };

  const handle_export_json = () => {
    const cleaned_output = clean_data(form_data);
    set_json_output(JSON.stringify(cleaned_output, null, 2));
    set_show_json_modal(true);
  };

  const handle_copy_json = () => {
    navigator.clipboard.writeText(json_output);
    set_copy_success(true);
    setTimeout(() => set_copy_success(false), 2000);
  };

  const handle_update = async () => {
    if (!validate_form()) {
      return;
    }

    set_is_saving(true);
    try {
      const cleaned_data = clean_data(form_data);
      await dispatch(updateJob({ id, jobData: cleaned_data })).unwrap();
      set_success_message("✓ Job updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/all-jobs");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      set_validation_errors({ general: "Failed to update job. Please try again." });
    } finally {
      set_is_saving(false);
    }
  };

  const format_label = (text) => {
    return text
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const render_field = (key, value, path_value = "") => {
    const full_path = path_value ? `${path_value}.${key}` : key;
    const has_error = validation_errors[full_path];
    const label_text = format_label(key);

    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;

    if (Array.isArray(value)) {
      const is_expanded = expanded_sections[full_path] !== false;

      return (
        <div key={full_path} className="mb-6">
          <button
            onClick={() => toggle_section(full_path)}
            className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 hover:from-slate-900 hover:via-slate-800 hover:to-slate-900 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="capitalize tracking-wide">{label_text}</span>
              <span className="ml-2 text-xs bg-blue-500 px-2.5 py-1 rounded-full font-bold">{value.length} items</span>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-300 ${is_expanded ? "rotate-180" : ""}`} />
          </button>

          {is_expanded && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {value.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
                  <div className="text-slate-400 text-4xl mb-3">📋</div>
                  <p className="text-slate-500 font-medium">No items added yet</p>
                  <p className="text-slate-400 text-sm mt-1">Click add button to create new entry</p>
                </div>
              ) : (
                value.map((item, index) => (
                  <div key={index} className="group relative border-2 border-slate-200 rounded-2xl p-6 bg-gradient-to-br from-white via-slate-50 to-white hover:from-slate-50 hover:via-blue-50 hover:to-white transition-all duration-300 shadow-sm hover:shadow-xl hover:border-blue-300 transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-1 h-12 bg-gradient-to-b from-blue-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex items-start justify-between mb-5">
                      <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold tracking-wider">Item {index + 1}</span>
                      <button
                        onClick={() => remove_array_item(full_path, index)}
                        className="inline-flex items-center justify-center w-9 h-9 text-red-600 bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:scale-110 active:scale-95"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {typeof item === "object" && item !== null
                        ? Object.keys(item).map((sub_key) =>
                            render_field(sub_key, item[sub_key], `${full_path}.${index}`)
                          )
                        : render_field(index, item, full_path)}
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => add_array_item(full_path)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 group mt-6"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Add New Item
              </button>
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      const is_expanded = expanded_sections[full_path] !== false;

      return (
        <div key={full_path} className="mb-6">
          <button
            onClick={() => toggle_section(full_path)}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:via-indigo-600 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-300 animate-pulse"></div>
              <span className="capitalize tracking-wide">{label_text}</span>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-300 ${is_expanded ? "rotate-180" : ""}`} />
          </button>

          {is_expanded && (
            <div className="mt-4 p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 rounded-xl border border-indigo-200 space-y-5 animate-fade-in">
              {Object.keys(value).map((sub_key) =>
                render_field(sub_key, value[sub_key], full_path)
              )}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div key={full_path} className="group">
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-slate-100 transition-all duration-200">
            <div className="relative">
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => update_field(full_path, event.target.checked)}
                className="w-6 h-6 cursor-pointer accent-blue-600 rounded-lg border-2 border-slate-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <span className="font-medium text-slate-700 capitalize group-hover:text-slate-900 transition-colors duration-200 select-none">{label_text}</span>
          </label>
        </div>
      );
    }

    const input_type = key.toLowerCase().includes("date")
      ? "date"
      : typeof value === "number"
      ? "number"
      : "text";

    return (
      <div key={full_path} className="group">
        <label className="block mb-2.5 font-bold text-slate-700 capitalize text-sm tracking-wide">
          {label_text}
          {has_error && <span className="text-red-500 ml-1.5 text-lg">●</span>}
        </label>
        <div className="relative">
          <input
            type={input_type}
            value={value ?? ""}
            onChange={(event) => update_field(full_path, event.target.value)}
            className={`w-full px-5 py-3.5 rounded-xl font-medium transition-all duration-300 outline-none border-2 placeholder-slate-400 ${
              has_error
                ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-600 text-red-900"
                : "border-slate-300 bg-white hover:border-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-slate-900"
            }`}
            placeholder={`Enter ${label_text.toLowerCase()}`}
          />
          {input_type === "date" && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">📅</div>
          )}
        </div>
        {has_error && (
          <p className="text-red-600 text-xs mt-2.5 font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <AlertCircle size={14} className="flex-shrink-0" />
            {validation_errors[full_path]}
          </p>
        )}
      </div>
    );
  };

  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-white to-slate-50 border-2 border-red-200 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-red-900">Error Loading Job</h3>
          </div>
          <p className="text-red-700 text-sm mb-8 leading-relaxed">{error || "Failed to load job details. Please try again."}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-lg font-bold hover:from-red-100 hover:to-red-200 hover:border-red-400 transition-all duration-200 active:scale-95 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all duration-200 mb-8 group text-sm tracking-wide"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
            BACK TO JOBS
          </button>

          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-5xl font-black tracking-tighter mb-3">Edit Job Posting</h1>
            <p className="text-slate-300 font-medium">Update job details and save your changes</p>
          </div>
        </div>

        {success_message && (
          <div className="mb-8 flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-xl shadow-lg animate-fade-in">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <p className="text-green-800 font-bold text-lg">{success_message}</p>
          </div>
        )}

        {validation_errors.general && (
          <div className="mb-8 flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-xl shadow-lg">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <p className="text-red-800 font-bold text-lg">{validation_errors.general}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={handle_export_json}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm tracking-wide uppercase"
          >
            <Code size={20} />
            Export JSON
          </button>

          <button
            onClick={handle_update}
            disabled={is_saving}
            className={`inline-flex items-center gap-3 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm tracking-wide uppercase ${
              is_saving
                ? "bg-blue-400 text-white cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white"
            }`}
          >
            <Save size={20} />
            {is_saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        <div className="space-y-6">
          {Object.keys(form_data).length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-sm">
              <p className="text-slate-500 font-bold text-lg">No form data available</p>
            </div>
          ) : (
            Object.keys(form_data).map((key) =>
              render_field(key, form_data[key], "")
            )
          )}
        </div>
      </div>

      {show_json_modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 flex-shrink-0 border-b border-slate-700">
              <h2 className="text-2xl font-black text-white tracking-tight">Job Data Export</h2>
              <button
                onClick={() => set_show_json_modal(false)}
                className="text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-all duration-200 active:scale-95 shadow-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex-shrink-0 border-b border-slate-200">
              <button
                onClick={handle_copy_json}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg font-bold transition-all duration-200 text-sm tracking-wide uppercase shadow-md ${
                  copy_success
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300"
                    : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-300 hover:from-blue-200 hover:to-indigo-200"
                }`}
              >
                <Copy size={18} />
                {copy_success ? "Copied!" : "Copy JSON"}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-8 pb-8">
              <textarea
                value={json_output}
                readOnly
                className="w-full h-full min-h-[400px] border-2 border-slate-300 p-6 rounded-xl font-mono text-xs bg-gradient-to-br from-slate-900 to-slate-800 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        textarea::selection {
          background-color: rgba(59, 130, 246, 0.5);
          color: #10b981;
        }
      `}</style>
    </div>
  );
}