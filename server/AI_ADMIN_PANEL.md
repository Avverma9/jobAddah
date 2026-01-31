Admin UI Guide – AI Providers, Models, and API Keys
==================================================

Goal
- Build a small React admin panel to manage AI providers (Gemini, Perplexity), models, and API keys using existing backend routes.

Auth
- All endpoints are admin-protected. Include your JWT in `Authorization: Bearer <token>` for every request.

Backend routes to use
- Gemini keys: `GET /ai/get-api-key`, `POST /ai/set-api-key`
- Gemini models: `GET /ai/get-model`, `POST /ai/set-model`
- Perplexity keys: `GET /ai/get-api-key-ppl`, `POST /ai/set-api-key-ppl`
- Perplexity models: `GET /ai/get-model-ppl`, `POST /ai/set-model-ppl`
- Optional: `POST /ai/change-gemini-status`, `POST /ai/change-perplexity-status`, `POST /ai/check-models`

Data shapes (responses)
- `/ai/get-api-key` → `{ success: true, keys: [ { apiKey, status, priority, label, provider, successCount, failCount, lastUsedAt, lastFailedAt, lastError, _id } ] }`
- `/ai/get-model` → `{ success: true, models: [ { modelName, status, priority, lastUsedAt, _id } ] }`
- PPL endpoints return the same shape but with provider "perplexity".

UI layout suggestion
1) Tabs or cards per provider: Gemini | Perplexity.
2) Within each tab:
   - Models table: columns = modelName, status (toggle), priority (number), lastUsedAt, actions (save).
   - Keys table: columns = label, apiKey (masked), status (select ACTIVE/INACTIVE/DISABLED), priority, success/fail counts, lastUsed/Failed, lastError, actions (save/test).
   - “Add key” form and “Add model” form.
3) Global info bar: shows `AI_PROVIDER_ORDER` if you expose it from env; show which key is currently ACTIVE (from the list).

API call examples (fetch)
```js
const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// Load Gemini keys
fetch("/ai/get-api-key", { headers: authHeaders }).then(r => r.json());

// Save Gemini key (add/update/toggle)
fetch("/ai/set-api-key", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    apiKey: form.apiKey,
    status: form.status,       // "ACTIVE" | "INACTIVE" | "DISABLED"
    priority: Number(form.priority) || 0,
    label: form.label || ""
  })
});

// Save Gemini model
fetch("/ai/set-model", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    modelName: form.modelName,
    status: form.status ?? true,
    priority: Number(form.priority) || 0
  })
});
```

Component logic (keys)
- Load keys list on mount.
- For each row:
  - Status control: dropdown (ACTIVE/INACTIVE/DISABLED). On change, call set-api-key with same apiKey and new status.
  - Priority: number input; on blur or save button, call set-api-key with new priority.
  - Label: text input; same save call.
- Add Key form: fields apiKey (text), label (text), priority (number), status default ACTIVE.
- Show computed “active key”: first entry with status ACTIVE and highest priority; if none, the UI can show “fallback to INACTIVE per server logic”.

Component logic (models)
- Similar table for models with status toggle and priority input.
- Add model form: modelName, status (checkbox), priority.

Visual cues
- Color rows: ACTIVE (green), INACTIVE (gray), DISABLED (red).
- Show lastFailedAt / lastError tooltip to help pick which key to re-enable.

Handling auto-rotation
- Server auto-rotates keys: only one key per provider becomes ACTIVE when it succeeds. The UI doesn’t need to enforce uniqueness; just call set-api-key. The backend will mark the winning key ACTIVE when it’s used successfully and set others to INACTIVE.
- To manually force a key active: set its status ACTIVE and set priority highest; next call will likely pick it first. If it fails, backend will drop it to INACTIVE and move on.

Minimal React state sketch
```js
const [gKeys, setGKeys] = useState([]);
const [gModels, setGModels] = useState([]);
useEffect(() => { loadAll(); }, []);

async function loadAll() {
  const [keys, models] = await Promise.all([
    fetchJson("/ai/get-api-key"),
    fetchJson("/ai/get-model")
  ]);
  setGKeys(keys.keys || []);
  setGModels(models.models || []);
}
```

Error handling
- If save fails, show `message` from the API.
- When a key is failing at runtime, backend sets it INACTIVE with lastError. Display that so admin can decide to re-enable or replace the key.

Security tips
- Mask apiKey in the table (show last 4 chars) and only store plaintext in memory while editing.
- Keep admin routes behind JWT; consider IP allowlist in production.

Deploy note
- No extra backend change required; this doc is front-end wiring only.
