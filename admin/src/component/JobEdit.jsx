import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Trash2, Calendar, DollarSign, Link as LinkIcon, 
  Plus, Briefcase, Code, X, Upload, Hash, FileText, Users
} from 'lucide-react';
import { getJobById, updateJob } from '../../redux/slices/job';

export default function JobEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentJob, loading, error } = useSelector((state) => state.job);

  const [formData, setFormData] = useState({});
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');

  // Load job data
  useEffect(() => {
    if (id) {
      dispatch(getJobById(id));
    }
  }, [id, dispatch]);

  // Populate form when data arrives - handles nested data object
  useEffect(() => {
    if (currentJob) {
      // Use let instead of const for reassignment
      let processedJob = { ...currentJob };
      
      // If data is nested under 'data' key, flatten it at top level
      if (currentJob.data && typeof currentJob.data === 'object') {
        processedJob = {
          ...currentJob,
          ...currentJob.data // Merge data object properties to top level
        };
      }
      
      setFormData(processedJob);
    }
  }, [currentJob]);

  // Generic update handler - handles nested paths
  const updateField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Array handlers
  const addArrayItem = (path, defaultItem = {}) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      if (!Array.isArray(current[arrayKey])) {
        current[arrayKey] = [];
      }
      current[arrayKey] = [...current[arrayKey], defaultItem];
      return newData;
    });
  };

  const updateArrayItem = (path, index, field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
          if (Array.isArray(current[keys[i]])) {
            current[keys[i]] = [...current[keys[i]]];
            if (field) {
              current[keys[i]][index] = { ...current[keys[i]][index], [field]: value };
            } else {
              current[keys[i]][index] = value;
            }
          }
        } else {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
      }
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) return prev;
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      if (Array.isArray(current[arrayKey])) {
        current[arrayKey] = current[arrayKey].filter((_, i) => i !== index);
      }
      return newData;
    });
  };

  // ✅ FIXED: Dynamic export that includes ALL fields
  const handleExportJson = () => {
    const cleanedData = { ...formData };
    delete cleanedData._id;
    delete cleanedData.__v;
    delete cleanedData.createdAt;
    delete cleanedData.updatedAt;
    delete cleanedData.data; // Remove the nested data object if it exists
    
    // Extract postName, wrap everything else in data
    const { postName, ...dataFields } = cleanedData;
    
    const apiPayload = {
      postName: postName || '',
      data: dataFields // Everything except postName goes here
    };
    
    setJsonOutput(JSON.stringify(apiPayload, null, 2));
    setShowJsonModal(true);
  };

  // Copy JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    alert('JSON copied to clipboard!');
  };

  // ✅ FIXED: Dynamic update that includes ALL fields
  const handleUpdate = async () => {
    const cleanedData = { ...formData };
    delete cleanedData._id;
    delete cleanedData.__v;
    delete cleanedData.createdAt;
    delete cleanedData.updatedAt;
    delete cleanedData.data; // Remove the nested data object if it exists

    // Extract postName, wrap everything else in data
    const { postName, ...dataFields } = cleanedData;

    const payload = {
      postName: postName || '',
      data: dataFields // Everything except postName goes here dynamically
    };

    dispatch(updateJob({ id, jobData: payload }))
      .unwrap()
      .then(() => {
        alert('Job updated successfully!');
        navigate('/dashboard/all-jobs');
      })
      .catch((err) => {
        alert('Failed to update: ' + (err?.message || 'Unknown error'));
      });
  };

  // ✅ Dynamic field renderer
  const renderField = (key, value, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;
    
    // Skip metadata fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'data', 'postName'].includes(key)) {
      return null;
    }

    // Array of objects
    if (Array.isArray(value)) {
      if (value.length === 0 || typeof value[0] === 'object') {
        return (
          <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 capitalize">
                <FileText size={18} className="text-blue-500"/> 
                {key.replace(/([A-Z])/g, ' $1').trim()} ({value.length})
              </h3>
              <button 
                onClick={() => addArrayItem(fullPath, value[0] || { label: '', value: '' })}
                className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition"
              >
                <Plus size={14}/> Add
              </button>
            </div>
            <div className="p-6">
              {value.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No items yet. Click "Add" to add.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {value.map((item, index) => (
                    <div key={index} className="flex flex-col gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                      <button 
                        onClick={() => removeArrayItem(fullPath, index)}
                        className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                      {typeof item === 'object' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                          {Object.keys(item).map(subKey => (
                            <div key={subKey} className={Object.keys(item).length <= 2 ? 'md:col-span-1' : ''}>
                              <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                                {subKey.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              {typeof item[subKey] === 'object' && !Array.isArray(item[subKey]) ? (
                                <div className="space-y-2 pl-3 border-l-2 border-slate-200">
                                  {Object.keys(item[subKey]).map(nestedKey => (
                                    <div key={nestedKey}>
                                      <label className="text-xs text-slate-500">{nestedKey}</label>
                                      <input 
                                        type="text"
                                        value={item[subKey][nestedKey] || ''}
                                        onChange={(e) => {
                                          const newItem = { 
                                            ...item, 
                                            [subKey]: { ...item[subKey], [nestedKey]: e.target.value } 
                                          };
                                          updateArrayItem(fullPath, index, null, newItem);
                                        }}
                                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 mt-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <input 
                                  type="text"
                                  value={item[subKey] || ''}
                                  onChange={(e) => updateArrayItem(fullPath, index, subKey, e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                                  placeholder={`Enter ${subKey}`}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <input 
                          type="text"
                          value={item}
                          onChange={(e) => updateArrayItem(fullPath, index, null, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    // Nested object (not array)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 capitalize">
              <Hash size={18} className="text-purple-500"/> 
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(value).map(subKey => (
              <div key={subKey} className={typeof value[subKey] === 'string' && value[subKey].length > 100 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                  {subKey.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {typeof value[subKey] === 'object' && !Array.isArray(value[subKey]) ? (
                  <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
                    {Object.keys(value[subKey]).map(nestedKey => (
                      <div key={nestedKey}>
                        <label className="text-xs text-slate-500 capitalize">
                          {nestedKey.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <input 
                          type="text"
                          value={value[subKey][nestedKey] || ''}
                          onChange={(e) => updateField(`${fullPath}.${subKey}.${nestedKey}`, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : typeof value[subKey] === 'string' && value[subKey].length > 100 ? (
                  <textarea 
                    rows="3"
                    value={value[subKey] || ''}
                    onChange={(e) => updateField(`${fullPath}.${subKey}`, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                ) : (
                  <input 
                    type={subKey.toLowerCase().includes('date') ? 'date' : subKey.toLowerCase().includes('number') || subKey.toLowerCase().includes('posts') ? 'number' : 'text'}
                    value={value[subKey] || ''}
                    onChange={(e) => updateField(`${fullPath}.${subKey}`, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Simple string/number field (top level)
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {typeof value === 'string' && value.length > 100 ? (
              <textarea 
                rows="3"
                value={value || ''}
                onChange={(e) => updateField(fullPath, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            ) : (
              <input 
                type={key.toLowerCase().includes('date') ? 'date' : typeof value === 'number' ? 'number' : 'text'}
                value={value || ''}
                onChange={(e) => updateField(fullPath, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !formData || Object.keys(formData).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4 text-lg">Failed to load job details</p>
          <p className="text-gray-500 mb-6">{error || 'No data available'}</p>
          <button 
            onClick={() => navigate('/dashboard/all-jobs')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors w-fit"
          >
            <ArrowLeft size={20} /> Back
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportJson}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Code size={18} /> Export JSON
            </button>
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> Update Post
            </button>
          </div>
        </div>

        {/* Post Name (Always first) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-500"/> Post Name
            </h3>
          </div>
          <div className="p-6">
            <input 
              type="text" 
              value={formData.postName || ''}
              onChange={(e) => updateField('postName', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Enter job post name"
            />
          </div>
        </div>

        {/* ✅ Dynamic Fields - Renders ALL data dynamically */}
        {Object.keys(formData).map(key => renderField(key, formData[key]))}

      </div>

      {/* JSON Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Export JSON Data</h2>
                  <p className="text-sm text-slate-500">Current job post data (API format)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowJsonModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={jsonOutput}
                readOnly
                className="w-full h-96 px-4 py-3 border-2 border-slate-300 rounded-lg font-mono text-xs resize-none bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Upload size={18} />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
