import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Calendar, DollarSign, Link as LinkIcon, 
  Plus, Briefcase, FileText, Users, Code, X, Trash2, Upload, Hash
} from 'lucide-react';
import { createJob } from '../../redux/slices/job';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [jobData, setJobData] = useState({
    postName: '',
    data: {}
  });

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleImportJson = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonInput);
      
      // Store everything in data object, keep postName at top level
      const importedData = {
        postName: parsed.postName || '',
        data: { ...parsed }
      };
      
      // Remove duplicate postName from data
      delete importedData.data.postName;
      
      setJobData(importedData);
      setShowJsonModal(false);
      setJsonInput('');
      alert('JSON imported successfully!');
    } catch (error) {
      setJsonError('Invalid JSON format. Please check and try again.');
    }
  };

  const handleCreatePost = () => {
    if (!jobData.postName) {
      alert('Please enter a post name');
      return;
    }

    const payload = {
      postName: jobData.postName,
      data: jobData.data
    };

    dispatch(createJob(payload))
      .unwrap()
      .then(() => {
        alert('Job created successfully!');
        navigate('/dashboard/all-jobs');
      })
      .catch((error) => {
        alert('Failed to create job: ' + (error?.message || 'Unknown error'));
      });
  };

  const updateTopLevel = (field, value) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const updateDataField = (path, value) => {
    setJobData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData.data;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path, defaultItem) => {
    setJobData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData.data;
      
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
    setJobData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData.data;
      
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
    setJobData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData.data;
      
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

  const renderField = (key, value, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;
    
    // Skip these metadata fields
    if (['_id', '__v', 'createdAt', 'updatedAt', 'postDate', 'pageAuthor', 'originalUrl'].includes(key)) {
      return null;
    }

    // Array of objects
    if (Array.isArray(value)) {
      if (value.length === 0 || typeof value[0] === 'object') {
        return (
          <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 capitalize">
                <FileText size={18} className="text-blue-500"/> {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <button 
                onClick={() => addArrayItem(fullPath, value[0] || {})}
                className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 transition"
              >
                <Plus size={14}/> Add
              </button>
            </div>
            <div className="p-6 space-y-3">
              {value.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No items yet. Click "Add" to add.
                </div>
              ) : (
                value.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3 relative">
                    <button 
                      onClick={() => removeArrayItem(fullPath, index)}
                      className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {typeof item === 'object' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                        {Object.keys(item).map(subKey => (
                          <div key={subKey}>
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
                                        const newItem = { ...item, [subKey]: { ...item[subKey], [nestedKey]: e.target.value } };
                                        updateArrayItem(fullPath, index, null, newItem);
                                      }}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
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
                ))
              )}
            </div>
          </div>
        );
      }
    }

    // Nested object
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div key={fullPath} className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 capitalize">
              <Hash size={18} className="text-purple-500"/> {key.replace(/([A-Z])/g, ' $1').trim()}
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
                        <label className="text-xs text-slate-500">{nestedKey}</label>
                        <input 
                          type="text"
                          value={value[subKey][nestedKey] || ''}
                          onChange={(e) => updateDataField(`${fullPath}.${subKey}.${nestedKey}`, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : typeof value[subKey] === 'string' && value[subKey].length > 100 ? (
                  <textarea 
                    rows="3"
                    value={value[subKey] || ''}
                    onChange={(e) => updateDataField(`${fullPath}.${subKey}`, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                ) : (
                  <input 
                    type={subKey.toLowerCase().includes('date') ? 'date' : 'text'}
                    value={value[subKey] || ''}
                    onChange={(e) => updateDataField(`${fullPath}.${subKey}`, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Simple string/number field
    return null;
  };

  const hasData = jobData.data && Object.keys(jobData.data).length > 0;

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
              onClick={() => setShowJsonModal(true)}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Code size={18} /> Import JSON
            </button>
            <button 
              onClick={handleCreatePost}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Save size={18} /> Create Post
            </button>
          </div>
        </div>

        {/* Post Name (Always shown) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-500"/> Post Name
            </h3>
          </div>
          <div className="p-6">
            <input 
              type="text" 
              value={jobData.postName}
              onChange={(e) => updateTopLevel('postName', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Enter job post name"
            />
          </div>
        </div>

        {/* Dynamic Fields */}
        {hasData ? (
          Object.keys(jobData.data).map(key => renderField(key, jobData.data[key]))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 p-12 text-center">
            <Code size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Data Yet</h3>
            <p className="text-slate-500 mb-6">Import JSON data to see dynamic form fields</p>
            <button 
              onClick={() => setShowJsonModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all"
            >
              <Upload size={18} />
              Import JSON Data
            </button>
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
                  <h2 className="text-xl font-bold text-slate-800">Import JSON Data</h2>
                  <p className="text-sm text-slate-500">Paste any job post JSON structure</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput('');
                  setJsonError('');
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
                  setJsonError('');
                }}
                placeholder='Paste your complete JSON here...'
                className="w-full h-96 px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-xs resize-none"
              />
              
              {jsonError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <div className="text-red-500 font-semibold">Error:</div>
                  <div className="text-red-700 text-sm">{jsonError}</div>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">✨ Fully Dynamic</p>
                <p className="text-xs text-blue-700">
                  This form automatically adapts to ANY JSON structure. All fields, arrays, and nested objects will be rendered dynamically.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowJsonModal(false);
                  setJsonInput('');
                  setJsonError('');
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Upload size={18} />
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
