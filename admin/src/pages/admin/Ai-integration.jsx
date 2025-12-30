import {
  AlertCircle,
  Code2,
  Cpu,
  Globe,
  KeyRound,
  Loader2,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  changeGeminiStatus,
  changePplStatus,
  getApiKey,
  getModel,
  getPplApiKey,
  getPplModel,
  setApiKey,
  setModel,
  setPplApiKey,
  setPplModel,
} from "../../../redux/slices/ai";

/* ================= HELPERS ================= */

const getEnv = (k) => (import.meta?.env?.[k] ? String(import.meta.env[k]) : "");

const resolvePresetEnvValue = (presetId, presets) => {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset?.env) return "";
  return getEnv(preset.env).trim();
};

/* ================= CONSTANTS ================= */

// --- GEMINI CONSTANTS ---
const FLASH_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Latest Standard)" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Most Efficient)" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Experimental" },
  { id: "gemini-flash-latest", label: "Gemini Flash Latest (Auto-update)" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Reliable Old)" },
];

// NOTE: Any API key present in client-side code is not truly secret.
const GEMINI_PRESET_KEYS = [
  { id: "key_1", label: "anv9576", env: "VITE_PRESET_API_KEY_1", hint: "Primary App Usage" },
  { id: "key_2", label: "av95766", env: "VITE_PRESET_API_KEY_2", hint: "QA Environment" },
  { id: "key_3", label: "codesweeper", env: "VITE_PRESET_API_KEY_3", hint: "Local Dev" },
  { id: "key_4", label: "romrom", env: "VITE_PRESET_API_KEY_4", hint: "Backup" },
];

// --- PERPLEXITY CONSTANTS ---
const PERPLEXITY_MODELS = [
  { id: "sonar", label: "Sonar (Standard Search)" },
  { id: "sonar-pro", label: "Sonar Pro (Advanced Reasoning)" },
];

const PERPLEXITY_PRESET_API_KEYS = [
  { id: "anv9576", label: "Primary Search Key", env: "VITE_PERPLEXITY_API_KEY_1", hint: "Main Account" },
  { id: "av95766", label: "Backup Search Key", env: "VITE_PERPLEXITY_API_KEY_2", hint: "Failover Account" },
];

const ToggleSwitch = ({ checked, onChange, disabled, ariaLabel }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    type="button"
    aria-label={ariaLabel}
    aria-pressed={checked}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      checked ? "bg-emerald-500" : "bg-gray-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const AISettingsPage = () => {
  /* ================= REDUX ================= */

  const dispatch = useDispatch();
  const { gemini, perplexity, apiKeys } = useSelector((s) => s.ai);

  /* ================= OPTIMISTIC STATUS ================= */

  const [geminiEnabled, setGeminiEnabled] = useState(true);
  const [pplEnabled, setPplEnabled] = useState(true);

  /* ================= PRESET STATE ================= */

  const [selectedGeminiPresetId, setSelectedGeminiPresetId] = useState("");
  const [selectedPplPresetId, setSelectedPplPresetId] = useState("");

  const [customApiKey, setCustomApiKey] = useState("");
  const [customPplApiKey, setCustomPplApiKey] = useState("");

  /* ================= MODEL STATE ================= */

  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPplModel, setSelectedPplModel] = useState("");

  /* ================= LOADING ================= */

  const isTogglingGemini = gemini.loading.toggle;
  const isTogglingPpl = perplexity.loading.toggle;

  const geminiBusy = gemini.loading.set || apiKeys.loading.gemini;
  const pplBusy = perplexity.loading.set || apiKeys.loading.ppl;

  const isSettingModel = gemini.loading.set;
  const isGettingModel = gemini.loading.get;

  const isSettingPplModel = perplexity.loading.set;
  const isGettingPplModel = perplexity.loading.get;

  const isSettingApiKey = apiKeys.loading.gemini;
  const isSettingPplApiKey = apiKeys.loading.ppl;

  const currentModel = gemini.model;
  const currentPplModel = perplexity.model;

  /* ================= INITIAL FETCH ================= */

  useEffect(() => {
    dispatch(getModel());
    dispatch(getApiKey());
    dispatch(getPplModel());
    dispatch(getPplApiKey());
  }, [dispatch]);

  /* ================= SYNC FROM REDUX ================= */

  useEffect(() => {
    setGeminiEnabled(gemini.status);
    setSelectedModel(gemini.model || "");
  }, [gemini.status, gemini.model]);

  useEffect(() => {
    setPplEnabled(perplexity.status);
    setSelectedPplModel(perplexity.model || "");
  }, [perplexity.status, perplexity.model]);

  useEffect(() => {
    setCustomApiKey(apiKeys.gemini || "");
    setCustomPplApiKey(apiKeys.ppl || "");
  }, [apiKeys]);

  /* ================= TOGGLES (REALTIME) ================= */

  const toggleGemini = async () => {
    const next = !geminiEnabled;
    setGeminiEnabled(next);

    try {
      await dispatch(
        changeGeminiStatus({
          status: next,
          modelName: gemini.model,
        })
      ).unwrap();
    } catch {
      setGeminiEnabled(!next);
      toast.error("Failed to update Gemini status");
    }
  };

  const togglePpl = async () => {
    const next = !pplEnabled;
    setPplEnabled(next);

    try {
      await dispatch(
        changePplStatus({
          status: next,
          modelName: perplexity.model,
        })
      ).unwrap();
    } catch {
      setPplEnabled(!next);
      toast.error("Failed to update Perplexity status");
    }
  };

  /* ================= SAVE HANDLERS ================= */

  const handleSaveApiKey = async () => {
    const presetValue = resolvePresetEnvValue(selectedGeminiPresetId, GEMINI_PRESET_KEYS);
    const key = (customApiKey || presetValue || "").trim();

    if (!key) {
      // More specific error if preset selected but env missing
      if (selectedGeminiPresetId && !presetValue) {
        return toast.error("Preset env key missing. Check .env and restart dev server.");
      }
      return toast.error("Enter Gemini API key");
    }

    await dispatch(setApiKey(key)).unwrap();
    toast.success("Gemini API key saved");
  };

  const handleSavePplApiKey = async () => {
    const presetValue = resolvePresetEnvValue(selectedPplPresetId, PERPLEXITY_PRESET_API_KEYS);
    const key = (customPplApiKey || presetValue || "").trim();

    if (!key) {
      if (selectedPplPresetId && !presetValue) {
        return toast.error("Preset env key missing. Check .env and restart dev server.");
      }
      return toast.error("Enter Perplexity API key");
    }

    await dispatch(setPplApiKey(key)).unwrap();
    toast.success("Perplexity API key saved");
  };

  const handleSaveModel = async () => {
    await dispatch(setModel(selectedModel)).unwrap();
    await dispatch(getModel());
    toast.success("Gemini model updated");
  };

  const handleSavePplModel = async () => {
    await dispatch(setPplModel(selectedPplModel)).unwrap();
    await dispatch(getPplModel());
    toast.success("Perplexity model updated");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans">
      {/* Navbar */}
      <div className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg text-white shadow-md">
              <Settings2 size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                AI Control Center
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Provider Configuration
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
              <ShieldCheck size={12} className="text-emerald-500" />
              Secure Environment
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* GOOGLE GEMINI CARD */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                geminiEnabled ? "ring-0" : "opacity-90 grayscale-[0.3]"
              }`}
            >
              {/* Header with Toggle */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      geminiEnabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        Google Gemini
                      </h2>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          geminiEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {geminiEnabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Core reasoning & generation engine
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 hidden sm:block">
                    {geminiEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <ToggleSwitch
                    checked={geminiEnabled}
                    disabled={isTogglingGemini}
                    onChange={toggleGemini}
                    ariaLabel="Toggle Gemini"
                  />
                </div>
              </div>

              {/* Configuration Content - Dimmed if Inactive */}
              <div
                className={`p-6 space-y-8 ${
                  !geminiEnabled ? "opacity-50 pointer-events-none select-none" : ""
                }`}
              >
                {/* API Key Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <KeyRound size={16} className="text-gray-400" />
                    <h3>Authentication</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Preset Key
                      </label>
                      <select
                        value={selectedGeminiPresetId}
                        onChange={(e) => {
                          setSelectedGeminiPresetId(e.target.value);
                          setCustomApiKey("");
                        }}
                        disabled={geminiBusy}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      >
                        <option value="">(Use custom key)</option>
                        {GEMINI_PRESET_KEYS.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                      {selectedGeminiPresetId && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {
                            GEMINI_PRESET_KEYS.find((x) => x.id === selectedGeminiPresetId)
                              ?.hint
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Custom Key
                      </label>
                      <input
                        type="password"
                        placeholder="gemini-xxxx..."
                        value={customApiKey}
                        onChange={(e) => {
                          setCustomApiKey(e.target.value);
                          if (e.target.value) setSelectedGeminiPresetId("");
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveApiKey}
                      disabled={geminiBusy}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSettingApiKey && <Loader2 size={12} className="animate-spin" />}{" "}
                      Save API Key
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Model Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Cpu size={16} className="text-gray-400" />
                    <h3>Model Configuration</h3>
                  </div>

                  <div>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={isSettingModel || isGettingModel}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      {FLASH_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <AlertCircle size={12} /> Currently active:{" "}
                        <span className="text-gray-700 font-medium">
                          {currentModel || "(not set)"}
                        </span>
                      </p>

                      <button
                        onClick={handleSaveModel}
                        disabled={isSettingModel || isGettingModel}
                        className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSettingModel ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Server size={12} />
                        )}{" "}
                        Update Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PERPLEXITY AI CARD */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                pplEnabled ? "ring-0" : "opacity-90 grayscale-[0.3]"
              }`}
            >
              {/* Header with Toggle */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      pplEnabled ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Globe size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        Perplexity AI
                      </h2>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          pplEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pplEnabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Live web search & deep research
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 hidden sm:block">
                    {pplEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <ToggleSwitch
                    checked={pplEnabled}
                    disabled={isTogglingPpl}
                    onChange={togglePpl}
                    ariaLabel="Toggle Perplexity"
                  />
                </div>
              </div>

              {/* Configuration Content */}
              <div
                className={`p-6 space-y-8 ${
                  !pplEnabled ? "opacity-50 pointer-events-none select-none" : ""
                }`}
              >
                {/* API Key Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <KeyRound size={16} className="text-gray-400" />
                    <h3>Authentication</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Preset Key
                      </label>
                      <select
                        value={selectedPplPresetId}
                        onChange={(e) => {
                          setSelectedPplPresetId(e.target.value);
                          setCustomPplApiKey("");
                        }}
                        disabled={pplBusy}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      >
                        <option value="">(Use custom key)</option>
                        {PERPLEXITY_PRESET_API_KEYS.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                      {selectedPplPresetId && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {
                            PERPLEXITY_PRESET_API_KEYS.find((x) => x.id === selectedPplPresetId)
                              ?.hint
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">
                        Custom Key
                      </label>
                      <input
                        type="password"
                        placeholder="pplx-xxxx..."
                        value={customPplApiKey}
                        onChange={(e) => {
                          setCustomPplApiKey(e.target.value);
                          if (e.target.value) setSelectedPplPresetId("");
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePplApiKey}
                      disabled={pplBusy}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSettingPplApiKey && <Loader2 size={12} className="animate-spin" />}{" "}
                      Save API Key
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Model Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Zap size={16} className="text-gray-400" />
                    <h3>Model Configuration</h3>
                  </div>

                  <div>
                    <select
                      value={selectedPplModel}
                      onChange={(e) => setSelectedPplModel(e.target.value)}
                      disabled={isSettingPplModel || isGettingPplModel}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    >
                      {PERPLEXITY_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <AlertCircle size={12} /> Currently active:{" "}
                        <span className="text-gray-700 font-medium">
                          {currentPplModel || "(not set)"}
                        </span>
                      </p>

                      <button
                        onClick={handleSavePplModel}
                        disabled={isSettingPplModel || isGettingPplModel}
                        className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded-md transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSettingPplModel ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Server size={12} />
                        )}{" "}
                        Update Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Developer Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-900">
                <div className="p-1.5 bg-gray-100 rounded-md">
                  <Code2 size={16} className="text-gray-600" />
                </div>
                <h3 className="text-sm font-bold">API Schema</h3>
              </div>

              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Ensure your backend endpoints match the expected JSON structure
                for successful connection.
              </p>

              <div className="bg-[#0F172A] rounded-lg p-4 overflow-x-auto shadow-inner mb-4 border border-gray-800">
                <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                  Gemini
                </p>
                <pre className="text-[10px] leading-relaxed font-mono text-blue-300">
                  <span className="text-purple-400">POST</span>{" "}
                  /ai/change-gemini-status{"\n"}
                  <span className="text-purple-400">POST</span> /set-api-key{"\n"}
                  <span className="text-purple-400">POST</span> /set-model
                </pre>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 overflow-x-auto shadow-inner border border-gray-800">
                <p className="text-[10px] text-gray-500 mb-2 font-semibold uppercase tracking-wider">
                  Perplexity
                </p>
                <pre className="text-[10px] leading-relaxed font-mono text-teal-300">
                  <span className="text-purple-400">POST</span>{" "}
                  /ai/change-ppl-status{"\n"}
                  <span className="text-purple-400">POST</span> /set-ppl-api-key{"\n"}
                  <span className="text-purple-400">POST</span> /set-ppl-model
                </pre>
              </div>
            </div>

            {/* Environment Badge */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between shadow-sm">
              <span className="text-xs font-semibold text-gray-500">
                System Status
              </span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600">
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

export default AISettingsPage;
