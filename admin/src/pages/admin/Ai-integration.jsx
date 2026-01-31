import React, { useEffect, useState } from "react";
import {
  Cpu,
  Globe,
  Info,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  fetchGeminiKeys,
  fetchGeminiModels,
  fetchPplKeys,
  fetchPplModels,
  saveGeminiKey,
  saveGeminiModel,
  savePplKey,
  savePplModel,
} from "../../../redux/slices/ai";

const PROVIDERS = {
  gemini: {
    name: "Gemini",
    icon: Sparkles,
    accent: "indigo",
    bg: "from-indigo-600 to-violet-500",
    keyRoutes: "/ai/get-api-key | /ai/set-api-key",
    modelRoutes: "/ai/get-model | /ai/set-model",
  },
  perplexity: {
    name: "Perplexity",
    icon: Globe,
    accent: "teal",
    bg: "from-emerald-500 to-teal-500",
    keyRoutes: "/ai/get-api-key-ppl | /ai/set-api-key-ppl",
    modelRoutes: "/ai/get-model-ppl | /ai/set-model-ppl",
  },
};

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "DISABLED"];

const emptyKeyForm = () => ({
  apiKey: "",
  label: "",
  priority: 0,
  status: "ACTIVE",
});

const emptyModelForm = () => ({
  modelName: "",
  priority: 0,
  status: true,
});

const maskKey = (value = "") => {
  if (!value) return "—";
  const tail = value.slice(-4);
  return `••••••${tail}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const activeKeyFromList = (keys = []) => {
  const active = keys
    .filter((k) => (k.status || "").toUpperCase() === "ACTIVE")
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return active[0] || null;
};

const statusTone = (status = "") => {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "DISABLED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const AIPanel = () => {
  const dispatch = useDispatch();
  const ai = useSelector((s) => s.ai);

  const [tab, setTab] = useState("gemini");
  const [keyForms, setKeyForms] = useState({
    gemini: emptyKeyForm(),
    perplexity: emptyKeyForm(),
  });
  const [modelForms, setModelForms] = useState({
    gemini: emptyModelForm(),
    perplexity: emptyModelForm(),
  });
  const [keyDrafts, setKeyDrafts] = useState({ gemini: {}, perplexity: {} });
  const [modelDrafts, setModelDrafts] = useState({ gemini: {}, perplexity: {} });

  useEffect(() => {
    dispatch(fetchGeminiKeys());
    dispatch(fetchGeminiModels());
    dispatch(fetchPplKeys());
    dispatch(fetchPplModels());
  }, [dispatch]);

  useEffect(() => {
    if (ai.error) toast.error(ai.error);
  }, [ai.error]);

  const providerOrder = import.meta?.env?.VITE_AI_PROVIDER_ORDER || "";

  const providerState = (provider) =>
    provider === "gemini" ? ai.gemini : ai.perplexity;

  const handleDraftChange = (provider, id, field, value) => {
    setKeyDrafts((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [id]: {
          ...(prev[provider]?.[id] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleModelDraftChange = (provider, id, field, value) => {
    setModelDrafts((prev) => ({
      ...prev,
      [provider]: {
        ...(prev[provider] || {}),
        [id]: {
          ...(prev[provider]?.[id] || {}),
          [field]: value,
        },
      },
    }));
  };

  const onSaveKey = async (provider, key) => {
    const id = key._id || key.apiKey;
    const draft = keyDrafts[provider]?.[id] || {};
    const payload = {
      apiKey: key.apiKey,
      label: (draft.label ?? key.label ?? "").trim(),
      status: (draft.status ?? key.status ?? "INACTIVE").toUpperCase(),
      priority: Number(draft.priority ?? key.priority ?? 0) || 0,
    };

    try {
      const action =
        provider === "gemini" ? saveGeminiKey(payload) : savePplKey(payload);
      await dispatch(action).unwrap();
      toast.success(`${PROVIDERS[provider].name} key saved`);
      setKeyDrafts((prev) => ({
        ...prev,
        [provider]: { ...(prev[provider] || {}), [id]: {} },
      }));
    } catch (err) {
      const msg = err?.message || err?.payload?.message || "Save failed";
      toast.error(msg);
    }
  };

  const onAddKey = async (provider) => {
    const form = keyForms[provider];
    const payload = {
      apiKey: (form.apiKey || "").trim(),
      label: (form.label || "").trim(),
      priority: Number(form.priority) || 0,
      status: (form.status || "ACTIVE").toUpperCase(),
    };
    if (!payload.apiKey) {
      toast.error("API key required");
      return;
    }
    try {
      const action =
        provider === "gemini" ? saveGeminiKey(payload) : savePplKey(payload);
      await dispatch(action).unwrap();
      toast.success(`${PROVIDERS[provider].name} key added`);
      setKeyForms((prev) => ({ ...prev, [provider]: emptyKeyForm() }));
    } catch (err) {
      toast.error(err?.message || "Failed to add key");
    }
  };

  const onSaveModel = async (provider, model) => {
    const id = model._id || model.modelName;
    const draft = modelDrafts[provider]?.[id] || {};
    const payload = {
      modelName: model.modelName,
      status: !!(draft.status ?? model.status ?? true),
      priority: Number(draft.priority ?? model.priority ?? 0) || 0,
    };
    try {
      const action =
        provider === "gemini" ? saveGeminiModel(payload) : savePplModel(payload);
      await dispatch(action).unwrap();
      toast.success(`${PROVIDERS[provider].name} model saved`);
      setModelDrafts((prev) => ({
        ...prev,
        [provider]: { ...(prev[provider] || {}), [id]: {} },
      }));
    } catch (err) {
      toast.error(err?.message || "Failed to save model");
    }
  };

  const onAddModel = async (provider) => {
    const form = modelForms[provider];
    const payload = {
      modelName: (form.modelName || "").trim(),
      status: !!(form.status ?? true),
      priority: Number(form.priority) || 0,
    };
    if (!payload.modelName) {
      toast.error("Model name required");
      return;
    }
    try {
      const action =
        provider === "gemini" ? saveGeminiModel(payload) : savePplModel(payload);
      await dispatch(action).unwrap();
      toast.success(`${PROVIDERS[provider].name} model added`);
      setModelForms((prev) => ({ ...prev, [provider]: emptyModelForm() }));
    } catch (err) {
      toast.error(err?.message || "Failed to add model");
    }
  };

  const renderKeyTable = (provider) => {
    const state = providerState(provider);
    const activeKey = activeKeyFromList(state.keys);
    const savingId = state.loading.savingKeyId;

    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              API Keys
            </p>
            <p className="text-sm text-slate-600">
              Manage {PROVIDERS[provider].name} keys, status, and rotation priority.
            </p>
          </div>
          {activeKey && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Active: {activeKey.label || maskKey(activeKey.apiKey)}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Key</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Success/Fail</th>
                <th className="px-4 py-3 text-left">Last Used / Failed</th>
                <th className="px-4 py-3 text-left">Last Error</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.loading.keys ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading keys...
                    </div>
                  </td>
                </tr>
              ) : state.keys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No keys found. Add one below.
                  </td>
                </tr>
              ) : (
                state.keys.map((k) => {
                  const id = k._id || k.apiKey;
                  const draft = keyDrafts[provider]?.[id] || {};
                  const status = (draft.status ?? k.status ?? "").toUpperCase();
                  const priority = draft.priority ?? k.priority ?? 0;
                  const label = draft.label ?? k.label ?? "";

                  const rowTone =
                    status === "ACTIVE"
                      ? "bg-emerald-50/60"
                      : status === "DISABLED"
                      ? "bg-red-50/40"
                      : "bg-white";

                  return (
                    <tr key={id} className={`hover:bg-slate-50/70 transition-colors ${rowTone}`}>
                      <td className="px-4 py-3">
                        <input
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
                          value={label}
                          onChange={(e) =>
                            handleDraftChange(provider, id, "label", e.target.value)
                          }
                          placeholder="Label"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {maskKey(k.apiKey)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleDraftChange(provider, id, "status", e.target.value)
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                          value={priority}
                          onChange={(e) =>
                            handleDraftChange(provider, id, "priority", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className="text-emerald-600 font-semibold">
                          {k.successCount ?? 0}
                        </span>
                        <span className="text-slate-400 px-1">/</span>
                        <span className="text-red-500 font-semibold">
                          {k.failCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div>{formatDate(k.lastUsedAt)}</div>
                        <div className="text-red-500">{formatDate(k.lastFailedAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600 max-w-xs">
                        {k.lastError ? (
                          <span className="line-clamp-2">{k.lastError}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSaveKey(provider, k)}
                          disabled={state.loading.savingKey && savingId === id}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                          {state.loading.savingKey && savingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <KeyRound className="h-4 w-4 text-slate-500" />
            Add Key
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="API Key"
              value={keyForms[provider].apiKey}
              onChange={(e) =>
                setKeyForms((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], apiKey: e.target.value },
                }))
              }
            />
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Label"
              value={keyForms[provider].label}
              onChange={(e) =>
                setKeyForms((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], label: e.target.value },
                }))
              }
            />
            <input
              type="number"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Priority"
              value={keyForms[provider].priority}
              onChange={(e) =>
                setKeyForms((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], priority: e.target.value },
                }))
              }
            />
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={keyForms[provider].status}
                onChange={(e) =>
                  setKeyForms((prev) => ({
                    ...prev,
                    [provider]: { ...prev[provider], status: e.target.value },
                  }))
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onAddKey(provider)}
                disabled={state.loading.savingKey}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {state.loading.savingKey ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModelTable = (provider) => {
    const state = providerState(provider);
    const savingName = state.loading.savingModelName;

    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Models
            </p>
            <p className="text-sm text-slate-600">
              Toggle availability and set priority order.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Last Used</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.loading.models ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading models...
                    </div>
                  </td>
                </tr>
              ) : state.models.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No models configured. Add one below.
                  </td>
                </tr>
              ) : (
                state.models.map((m) => {
                  const id = m._id || m.modelName;
                  const draft = modelDrafts[provider]?.[id] || {};
                  const status = draft.status ?? m.status ?? true;
                  const priority = draft.priority ?? m.priority ?? 0;
                  return (
                    <tr key={id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">
                        {m.modelName}
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={Boolean(status)}
                            onChange={(e) =>
                              handleModelDraftChange(provider, id, "status", e.target.checked)
                            }
                          />
                          {status ? "Enabled" : "Disabled"}
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                          value={priority}
                          onChange={(e) =>
                            handleModelDraftChange(provider, id, "priority", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {formatDate(m.lastUsedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSaveModel(provider, m)}
                          disabled={state.loading.savingModel && savingName === m.modelName}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                          {state.loading.savingModel && savingName === m.modelName ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Cpu className="h-4 w-4 text-slate-500" />
            Add Model
          </div>
          <div className="grid md:grid-cols-3 gap-3 items-center">
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="model-name"
              value={modelForms[provider].modelName}
              onChange={(e) =>
                setModelForms((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], modelName: e.target.value },
                }))
              }
            />
            <input
              type="number"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Priority"
              value={modelForms[provider].priority}
              onChange={(e) =>
                setModelForms((prev) => ({
                  ...prev,
                  [provider]: { ...prev[provider], priority: e.target.value },
                }))
              }
            />
            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={Boolean(modelForms[provider].status)}
                  onChange={(e) =>
                    setModelForms((prev) => ({
                      ...prev,
                      [provider]: { ...prev[provider], status: e.target.checked },
                    }))
                  }
                />
                Enabled
              </label>
              <button
                onClick={() => onAddModel(provider)}
                disabled={state.loading.savingModel}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {state.loading.savingModel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProvider = (provider) => {
    const meta = PROVIDERS[provider];
    const state = providerState(provider);
    const activeKey = activeKeyFromList(state.keys);
    const icon = meta.icon;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase font-semibold text-slate-400">
              <Settings2 className="h-4 w-4" />
              Provider
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${meta.bg} text-white flex items-center justify-center shadow`}
              >
                {React.createElement(icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">{meta.name}</div>
                <div className="text-xs text-slate-500">{meta.keyRoutes}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase font-semibold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Active Key
            </div>
            <div className="mt-2 text-sm text-slate-700">
              {activeKey ? (
                <>
                  <div className="font-semibold">{activeKey.label || "(no label)"}</div>
                  <div className="text-xs text-slate-500">{maskKey(activeKey.apiKey)}</div>
                </>
              ) : (
                <span className="text-slate-500">None (server will pick fallback)</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs uppercase font-semibold text-slate-400">
              <Cpu className="h-4 w-4 text-indigo-600" />
              Models
            </div>
            <div className="mt-2 text-sm text-slate-700">
              <div className="font-semibold">{state.models.length}</div>
              <div className="text-xs text-slate-500">
                Enabled:{" "}
                {
                  state.models.filter((m) => m.status === true || m.status === "ACTIVE")
                    .length
                }
              </div>
            </div>
          </div>
        </div>

        {renderKeyTable(provider)}
        {renderModelTable(provider)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          Admin
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              AI Providers, Models & API Keys
            </h1>
            <p className="text-sm text-slate-500">
              Manage Gemini and Perplexity credentials, rotation priority, and model availability.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
              <Info className="h-4 w-4" />
              AI_PROVIDER_ORDER: {providerOrder || "not set"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {Object.keys(PROVIDERS).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {React.createElement(PROVIDERS[key].icon, { className: "h-4 w-4" })}
              {PROVIDERS[key].name}
            </button>
          );
        })}
      </div>

      {renderProvider(tab)}
    </div>
  );
};

export default AIPanel;
