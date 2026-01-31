AI Key/Model Management
========================

What this does
- Stores multiple API keys per provider (Gemini, Perplexity) with status, priority, label, success/fail counters.
- Stores multiple models per provider with status + priority.
- getActiveAIConfig picks the best active key+model (prefers provider order env AI_PROVIDER_ORDER or defaults Gemini→Perplexity), marks failures and auto-switches to next key/provider.
- Scraper already uses this; no changes needed to consume the failover.

Data fields (keys)
- provider: "gemini" | "perplexity"
- apiKey: string (unique per provider)
- status: "ACTIVE" | "DISABLED" | "INACTIVE" (failures auto set to DISABLED)
- priority: number (higher wins)
- label: free text
- counters/timestamps: successCount, failCount, lastUsedAt, lastFailedAt, lastError

Data fields (models)
- modelName: string (unique per provider)
- status: boolean
- priority: number (higher wins)
- lastUsedAt: date

Key provider order (optional)
- Env `AI_PROVIDER_ORDER` (comma separated, e.g., `AI_PROVIDER_ORDER=gemini,perplexity`).
- If not set: Gemini is tried first, then Perplexity.

REST endpoints (admin-auth protected)
- Gemini keys
  - POST `/ai/set-api-key` body: `{ "apiKey": "...", "status": "ACTIVE", "priority": 0, "label": "my key" }`
  - GET `/ai/get-api-key` → list of all Gemini keys
- Gemini models
  - POST `/ai/set-model` body: `{ "modelName": "gemini-2.0-pro-exp-02-05", "status": true, "priority": 1 }`
  - GET `/ai/get-model` → list of Gemini models
- Perplexity keys
  - POST `/ai/set-api-key-ppl` body: `{ "apiKey": "...", "status": "ACTIVE", "priority": 0, "label": "ppl main" }`
  - GET `/ai/get-api-key-ppl`
- Perplexity models
  - POST `/ai/set-model-ppl` body: `{ "modelName": "sonar-pro", "status": true, "priority": 1 }`
  - GET `/ai/get-model-ppl`
- Optional: POST `/ai/check-models` (availability check) and `/ai/change-*-status` to toggle status explicitly.

How failover works (already wired into scraper)
1) Pick provider by `AI_PROVIDER_ORDER` (default Gemini→Perplexity), pick highest priority active model, then key: ACTIVE keys first, else INACTIVE keys.
2) On success: the winning key is marked ACTIVE and all other keys of that provider are set to INACTIVE (so only one ACTIVE at a time), counters updated.
3) On error: failing key is marked INACTIVE with lastError; the selector immediately tries the next key (or next provider). If all providers/keys fail, the error bubbles up.

Quick curl examples
- Add Gemini key:
  `curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"apiKey":"G...","status":"ACTIVE","priority":2,"label":"primary"}' http://localhost:3000/ai/set-api-key`
- List Gemini keys:
  `curl -H "Authorization: Bearer <token>" http://localhost:3000/ai/get-api-key`
- Add Gemini model:
  `curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"modelName":"gemini-2.0-pro-exp-02-05","status":true,"priority":1}' http://localhost:3000/ai/set-model`
- Add Perplexity key:
  `curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"apiKey":"ppl...","status":"ACTIVE","priority":1,"label":"backup"}' http://localhost:3000/ai/set-api-key-ppl`

Operational notes
- Auto-disable happens only when a request fails inside scraper; re-enable manually via set-api-key with status ACTIVE.
- Legacy single-key docs remain; new writes backfill provider field.
- Keep `.env` in sync if you want a default key for local dev; APIs store keys in Mongo regardless.

JSON request bodies (copy-paste)
- POST /ai/set-api-key  (Gemini key)
```json
{
  "apiKey": "your-gemini-key",
  "status": "ACTIVE",
  "priority": 1,
  "label": "primary gemini key"
}
```
- POST /ai/set-model  (Gemini model)
```json
{
  "modelName": "gemini-2.0-pro-exp-02-05",
  "status": true,
  "priority": 1
}
```
- POST /ai/set-api-key-ppl  (Perplexity key)
```json
{
  "apiKey": "your-perplexity-key",
  "status": "ACTIVE",
  "priority": 0,
  "label": "ppl backup"
}
```
- POST /ai/set-model-ppl  (Perplexity model)
```json
{
  "modelName": "sonar-pro",
  "status": true,
  "priority": 1
}
```
