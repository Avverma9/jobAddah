import {
  AlertCircle,
  CheckCircle,
  Code2,
  Cpu,
  KeyRound,
  Loader2,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  getApiKey,
  getModel,
  setApiKey,
  setModel,
} from "../../../redux/slices/ai";

const FLASH_MODELS = [
  // --- Sabse Latest & Fast (High Limits) ---
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Latest Standard)" },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite (Most Efficient)",
  },

  // --- Stable Versions ---
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },

  // --- Experimental & Previews (Updates ke sath) ---
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Experimental" },
  {
    id: "gemini-2.0-flash-lite-preview-02-05",
    label: "Gemini 2.0 Flash Lite Preview",
  },
  { id: "gemini-2.5-flash-preview-09-2025", label: "Gemini 2.5 Flash Preview" },
  {
    id: "gemini-2.5-flash-lite-preview-09-2025",
    label: "Gemini 2.5 Flash Lite Preview",
  },

  // --- Dynamic Aliases (Hamesha naye version par point karenge) ---
  { id: "gemini-flash-latest", label: "Gemini Flash Latest (Auto-update)" },
  {
    id: "gemini-flash-lite-latest",
    label: "Gemini Flash-Lite Latest (Auto-update)",
  },

  // --- Reliable Fallback (Agar naye models fail ho jayein) ---
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Reliable Old)" },
];
// Preset API keys are now read from environment variables (Vite).
// Add these to your `.env` or `.env.local` (see `.env.example` in project root).
const PRESET_API_KEYS = [
  {
    id: "key_1",
    label: "anv9576",
    // Vite env vars must be prefixed with VITE_
    value: import.meta.env.VITE_PRESET_API_KEY_1 || "",
    hint: "Primary App Usage",
  },
  {
    id: "key_2",
    label: "av95766",
    value: import.meta.env.VITE_PRESET_API_KEY_2 || "",
    hint: "QA Environment",
  },
  {
    id: "key_3",
    label: "codesweeper",
    value: import.meta.env.VITE_PRESET_API_KEY_3 || "",
    hint: "Local Dev",
  },
  {
    id: "key_4",
    label: "romrom",
    value: import.meta.env.VITE_PRESET_API_KEY_4 || "",
    hint: "Backup",
  },
];

const GeminiSettingsPage = () => {
  const dispatch = useDispatch();

  const {
    currentModel,
    isGettingModel,
    isSettingModel,
    currentApiKey,
    isGettingApiKey,
    isSettingApiKey,
  } = useSelector((state) => state.ai);

  const [selectedModel, setSelectedModel] = useState(FLASH_MODELS[0]?.id || "");
  const [selectedApiKeyOption, setSelectedApiKeyOption] = useState(
    PRESET_API_KEYS[0]?.value || ""
  );
  const [customApiKey, setCustomApiKey] = useState("");

  useEffect(() => {
    dispatch(getModel());
    dispatch(getApiKey());
  }, [dispatch]);

  useEffect(() => {
    if (currentModel) {
      setSelectedModel(currentModel);
    } else if (!currentModel && FLASH_MODELS[0]) {
      setSelectedModel(FLASH_MODELS[0].id);
    }
  }, [currentModel]);

  useEffect(() => {
    if (!currentApiKey) {
      setCustomApiKey("");
      if (PRESET_API_KEYS[0]) {
        setSelectedApiKeyOption(PRESET_API_KEYS[0].value);
      }
      return;
    }

    const presetMatch = PRESET_API_KEYS.find((k) => k.value === currentApiKey);

    if (presetMatch) {
      setSelectedApiKeyOption(presetMatch.value);
      setCustomApiKey("");
    } else {
      setSelectedApiKeyOption("");
      setCustomApiKey(currentApiKey);
    }
  }, [currentApiKey]);

  const handleSaveModel = async () => {
    if (!selectedModel || isSettingModel) return;
    const toastId = toast.loading("Saving model...");
    try {
      await dispatch(setModel(selectedModel)).unwrap();
      toast.success("Gemini model updated", { id: toastId });
    } catch (error) {
      toast.error(error?.message || "Failed to update model", { id: toastId });
    }
  };

  const handleSaveApiKey = async () => {
    if (isSettingApiKey) return;

    const apiKeyToSave = customApiKey.trim() || selectedApiKeyOption;
    if (!apiKeyToSave) {
      toast.error("Please select or enter an API key");
      return;
    }

    const toastId = toast.loading("Saving API key...");
    try {
      await dispatch(setApiKey(apiKeyToSave)).unwrap();
      toast.success("API key updated", { id: toastId });
    } catch (error) {
      toast.error(error?.message || "Failed to update API key", {
        id: toastId,
      });
    }
  };

  const modelDisabled = isGettingModel || isSettingModel;
  const apiKeyDisabled = isGettingApiKey || isSettingApiKey;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      {/* Navbar / Top Bar */}
      <div className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                Gemini Control
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                AI Configuration
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
              <ShieldCheck size={12} className="text-emerald-500" />
              Secure Environment
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro Section */}
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Settings & Configuration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage the connection details for your AI integration. Select the
            appropriate Gemini model and API key for your deployment
            environment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
          {/* LEFT COLUMN: Main Forms */}
          <div className="space-y-8">
            {/* --- SECTION 1: API KEY --- */}
            <section className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    API Configuration
                  </h3>
                  <p className="text-xs text-gray-500">
                    Authentication credentials
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Selection Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Select Preset Key
                  </label>
                  <div className="relative">
                    <select
                      value={selectedApiKeyOption}
                      onChange={(e) => {
                        setSelectedApiKeyOption(e.target.value);
                        setCustomApiKey("");
                      }}
                      disabled={apiKeyDisabled}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50 disabled:text-gray-400 outline-none"
                    >
                      {PRESET_API_KEYS.map((k) => (
                        <option key={k.id} value={k.value}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Divider with Text */}
                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      or manually enter
                    </span>
                  </div>
                </div>

                {/* Custom Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Custom API Key
                  </label>
                  <input
                    type="password"
                    placeholder="gemini-xxxxxxx..."
                    value={customApiKey}
                    onChange={(e) => {
                      setCustomApiKey(e.target.value);
                      if (e.target.value.trim()) setSelectedApiKeyOption("");
                    }}
                    disabled={apiKeyDisabled}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed outline-none"
                  />
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Current status:{" "}
                    <span
                      className={`font-medium ${
                        currentApiKey ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {isGettingApiKey
                        ? "Checking..."
                        : currentApiKey
                          ? "Active"
                          : "Not Configured"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={apiKeyDisabled}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSettingApiKey ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Save Configuration
                  </button>
                </div>
              </div>

              {/* Visual List of Keys */}
              <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Available Presets
                </p>
                <div className="grid gap-2">
                  {PRESET_API_KEYS.map((k) => {
                    const isActive = currentApiKey === k.value;
                    return (
                      <div
                        key={k.id}
                        className={`group flex items-center justify-between p-3 rounded-md border text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-50 border-indigo-200 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-indigo-500" : "bg-gray-300"
                            }`}
                          />
                          <div>
                            <p
                              className={`font-medium ${
                                isActive ? "text-indigo-900" : "text-gray-700"
                              }`}
                            >
                              {k.label}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate max-w-[150px] sm:max-w-[200px]">
                              {k.value}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* --- SECTION 2: MODEL SELECTION --- */}
            <section className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Model Inference
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select reasoning engine
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Gemini Model Version
                  </label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={modelDisabled}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:text-gray-400 outline-none"
                    >
                      {FLASH_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Flash models are optimized for low-latency and
                    cost-efficiency.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Active Model:{" "}
                    <span className="font-mono font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {isGettingModel ? "Loading..." : currentModel || "None"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveModel}
                    disabled={modelDisabled || !selectedModel}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSettingModel ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Server size={16} />
                    )}
                    Update Model
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar/Info */}
          <aside className="space-y-6">
            {/* Developer Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900">
                <Code2 size={18} className="text-gray-500" />
                <h3 className="text-sm font-bold">API Schema</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Ensure your backend endpoints match the following JSON
                structure.
              </p>
              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto shadow-inner">
                <pre className="text-[10px] leading-relaxed font-mono text-blue-300">
                  <span className="text-emerald-400">POST</span> /set-api-key
                  {"\n"}
                  <span className="text-slate-400">{`{ "apiKey": "string" }`}</span>
                  {"\n\n"}
                  <span className="text-emerald-400">POST</span> /set-model
                  {"\n"}
                  <span className="text-slate-400">{`{ "modelName": "string" }`}</span>
                </pre>
              </div>
            </div>

            {/* Best Practices */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <h3 className="text-sm font-bold text-blue-900 mb-2">
                Production Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-xs text-blue-800">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  Use "Flash-Lite" for cost-sensitive background tasks.
                </li>
                <li className="flex gap-2 text-xs text-blue-800">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  Rotate your keys every 30 days via the Google Cloud Console.
                </li>
                <li className="flex gap-2 text-xs text-blue-800">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  Always use a staging key for testing new prompts.
                </li>
              </ul>
            </div>

            {/* Environment Badge */}
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                System Status
              </p>
              <div className="mt-2 flex justify-center items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-gray-600">
                  Operational
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default GeminiSettingsPage;
