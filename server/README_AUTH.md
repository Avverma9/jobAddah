# Authentication (JWT) — Quick Guide

This project uses JWT-based authentication with roles and permission-based access to menu items.

## Endpoints

- POST /api/auth/register — Create a new user and receive a JWT
- POST /api/auth/login — Login and receive a JWT
- GET /api/auth/profile — Protected; returns the user's profile (requires Authorization header)

## Roles

- user
- admin
- super_admin

super_admin bypasses permission checks.

## Permissions

The `permissions` field in the user document is an array of strings representing menu items or actions, e.g.:

- `menu.dashboard`
- `menu.jobs.view`
- `menu.jobs.create`

These strings are embedded into the JWT at issue time and used by `authorizePermission()` middleware to allow or deny access.

## Example: Register (cURL)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "secret",
    "role": "admin",
    "permissions": ["menu.dashboard","menu.jobs.view"]
  }'
```

Response:
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin",
    "permissions": ["menu.dashboard","menu.jobs.view"]
  }
}
```

## Example: Login (PowerShell)

```powershell
$body = @{ email = 'alice@example.com'; password = 'secret' } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $body
$token = $response.token
```

Use the token in subsequent requests:

```
Authorization: Bearer <JWT_TOKEN>
```

## Protecting routes

In your route file, import the middleware and use it:

```javascript
const { verifyToken, authorizeRoles, authorizePermission } = require('../middleware/auth');

```markdown
# Authentication (JWT) — Quick Guide

This project uses JWT-based authentication with roles and permission-based access to menu items.

## Endpoints

- POST /api/auth/register — Create a new user and receive a JWT
- POST /api/auth/login — Login and receive a JWT
- GET /api/auth/profile — Protected; returns the user's profile (requires Authorization header)

## Roles

- user
- admin
- super_admin

super_admin bypasses permission checks.

## Permissions

The `permissions` field in the user document is an array of strings representing menu items or actions, e.g.:

- `menu.dashboard`
- `menu.jobs.view`
- `menu.jobs.create`

These strings are embedded into the JWT at issue time and used by `authorizePermission()` middleware to allow or deny access.

## Example: Register (cURL)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "secret",
    "role": "admin",
    "permissions": ["menu.dashboard","menu.jobs.view"]
  }'
```

Response:
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin",
    "permissions": ["menu.dashboard","menu.jobs.view"]
  }
}
```

## Example: Login (PowerShell)

```powershell
$body = @{ email = 'alice@example.com'; password = 'secret' } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $body
$token = $response.token
```

Use the token in subsequent requests:

```
Authorization: Bearer <JWT_TOKEN>
```

## Protecting routes

In your route file, import the middleware and use it:

```javascript
const { verifyToken, authorizeRoles, authorizePermission } = require('../middleware/auth');

// Allow only admins and super_admins
router.post('/jobs', verifyToken, authorizeRoles('admin','super_admin'), createJob);

// Allow users who have the 'menu.jobs.view' permission or super_admin
router.get('/jobs', verifyToken, authorizePermission('menu.jobs.view'), getJobs);
```

## Notes & Security

- Set `JWT_SECRET` in your `.env` to a strong secret. Default is `change_this_secret` (development only).
- Tokens expire (default 2h). Configure `JWT_EXPIRES_IN` in `.env` if needed.
- For critical operations you may want to re-load user from DB in `verifyToken` to reflect permission/role changes.

---

## हिन्दी मार्गदर्शिका (संक्षेप)

नीचे हिन्दी में चरण-दर-चरण मार्गदर्शिका है — इससे आप access control, menu item creation, और permission assignment आसानी से समझ पाएँगे।

1) भूमिकाएँ (Roles)
   - `user` — सामान्य उपयोगकर्ता
   - `admin` — व्यवस्थापक (कई यूजर/permissions प्रबंध कर सकता है)
   - `super_admin` — उच्चतम अधिकार; menu items बनाना/हटाना और किसी को permission देना/लेना कर सकता है

2) उपयोगकर्ता बनाना और लॉगिन (Register / Login)
   - नया उपयोगकर्ता बनाने के लिए: `POST /api/auth/register` (body में name, email, password, role, permissions)
   - लॉगिन करने के लिए: `POST /api/auth/login` (body में email, password)
   - सफल होने पर आपको JWT token मिलेगा — इसे हर प्रोटेक्टेड अनुरोध के `Authorization: Bearer <token>` हेडर में भेजें।

3) Menu item बनाना (Super Admin flow)
   - Super admin डैशबोर्ड से नया MenuItem बना सकता है:
     - `POST /api/admin/sidebar/items` बॉडी में: `{ key, label, route, parent (optional parent id), order, isPublic, permission }`
     - `key` unique होना चाहिए (उदाहरण: `jobs`, `settings`)
     - `permission` एक string है (उदाहरण: `menu.jobs.view`) — यह permission उस मेनू को देखने/एक्सेस करने के लिए प्रयोग होगी
   - अगर आप parent id देते हैं तो वह nested (child) बन जाएगा — फ्रंटेंड इसे `children` देखकर render करता है।

4) किसी को permission देना (Assign permissions)
   - Super admin users के permissions बदल सकता है:
     - `POST /api/admin/sidebar/items/:id/assign` — बॉडी: `{ userIds: [...], addPermissions: [...], removePermissions: [...] }`
     - इससे चुने हुए users के permissions array में add/remove होगा।
   - वैकल्पिक रूप से आप सीधे किसी user के permissions को पूरी तरह set कर सकते हैं:
     - `PUT /api/admin/users/:id/permissions` — बॉडी: `{ permissions: ["menu.jobs.view", ...] }`

5) Nested (Parent/Child) Menu को कैसे manage करें
   - हर `MenuItem` में `parent` फ़ील्ड होती है (या null)।
   - `GET /api/admin/sidebar/items` backend nested tree लौटाता है — फ्रंटेंड recursive rendering कर सकता है।
   - Delete करने पर अभी children orphan होते हैं (parent=null). आप चाहें तो cascade-delete logic लागू करवा सकते हैं।

6) किसी का access रोकना (Ban user)
   - Admin या Super Admin किसी user को ban/unban कर सकते हैं:
     - `PUT /api/admin/users/:id/ban` — बॉडी: `{ banned: true }` या `{ banned: false }`
   - Login में banned user की जाँच करना ज़रूरी है — यदि banned है तो 403 लौटाएँ। (इसे मैं login flow में जोड़ दूँगा यदि आप कहें)।

7) Token का तुरंत प्रभाव (Permission बदलने पर)
   - जब आप किसी user के permissions बदलते हैं, उसके पहले से जारी JWT token में पुराने permissions रहेंगे जब तक token expire न हो।
   - समाधान:
     - (a) छोटी expiry रखें (example: 15m या 1h)
     - (b) tokenVersion रखकर token invalidate करें — user के tokenVersion बदलते ही पुराने tokens अमान्य कर दें।

8) Example flow (उदाहरण)
   - Super admin Alice एक new menu item `jobs` बनाती है और permission `menu.jobs.view` सेट करती है.
   - फिर वह Bob को `menu.jobs.view` permission देती है (assign API से)।
   - Bob लॉगिन करता है, token में `menu.jobs.view` होगा → जब Bob `GET /api/jobs` करता है तो `authorizePermission('menu.jobs.view')` पास होगा और response मिलेगा।

9) सुरक्षा सुझाव
   - `.env` में `JWT_SECRET` ज़रूर रखें और मजबूत बनाएँ।
   - `JWT_EXPIRES_IN` छोटा रखें और refresh token strategy पर विचार करें।
   - Admin actions का audit log रखें (कौन-कब-क्या बदला) — production में recommended।

यदि आप चाहें तो मैं इस हिन्दी हिस्से के ऊपर step-by-step Postman/cURL वर्कफ़्लो भी जोड़ दूँगा (super_admin से menu बनाना → user को permission देना → user द्वारा access) — बताइए, मैं इसे add कर दूँ।

``` 