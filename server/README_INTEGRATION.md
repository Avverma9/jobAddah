# Integration Guide — Login & Password Reset (UI)

This guide shows how to integrate a simple Login + Forgot Password UI with the backend APIs in this project. Instructions are given in Hindi with code examples (React + fetch) and cURL/PowerShell snippets for testing.

Important endpoints (backend)

- POST /api/auth/login — { email, password } -> { token, user } and sets HttpOnly cookie `token`
- POST /api/auth/register — { name, email, password, ... } -> { token, securityPin, user } (sets cookie)
- POST /api/auth/request-reset — { email } -> { message, securityPin (dev) }
- POST /api/auth/reset-password — { email, securityPin, newPassword } -> { message }
- POST /api/auth/logout — clears auth cookie

Notes:
- In development `request-reset` and `register` return the `securityPin` in the response so you can test flows quickly. In production you should email/SMS the pin and NOT return it in API responses.
- The server now sets the JWT in an HttpOnly cookie named `token`. Browsers will send this cookie automatically when `fetch` is called with `credentials: 'include'` (or when the frontend is served from the same origin). If you prefer header-based auth, the API still returns the token in JSON so you can store it in localStorage and send it in an Authorization header.


## 1) Simple Login form (React)

This React snippet posts credentials to the login endpoint and stores the JWT in localStorage.

```jsx
// LoginForm.jsx
import React, { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      // Use credentials: 'include' so browser sends/receives HttpOnly cookie
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // token is set as an HttpOnly cookie by the server. You can optionally store it in JS
      // if you need to call APIs from other origins, but HttpOnly cookie is safer.
      onLogin && onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
```


## 2) "Forgot Password" flow — Request PIN (React)

User provides email, you call `POST /api/auth/request-reset`. In development the API will return the pin in the response (so you can paste it into the reset form). In production the server should email the pin to the user.

```jsx
// RequestReset.jsx
import React, { useState } from 'react';

export default function RequestReset(){
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState(null);
  const [pin, setPin] = useState(null); // dev-only: shows returned pin

  async function requestPin(e){
    e.preventDefault();
    const res = await fetch('/api/auth/request-reset', {
      method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || 'Pin generated');
      // DEV: server may return the pin for testing
      if (data.securityPin) setPin(data.securityPin);
    } else {
      setMessage(data.message || 'Error');
    }
  }

  return (
    <div>
      <form onSubmit={requestPin}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Your registered email" />
        <button type="submit">Request Reset PIN</button>
      </form>
      {message && <div>{message}</div>}
      {pin && <div style={{color:'green'}}>DEV PIN: {pin}</div>}
    </div>
  );
}
```


## 3) Reset Password Form (React)

User submits email, pin, and new password to `/api/auth/reset-password`.

```jsx
// ResetPassword.jsx
import React, { useState } from 'react';

export default function ResetPassword(){
  const [email,setEmail]=useState('');
  const [pin,setPin]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState(null);

  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password', {
      method:'POST', credentials: 'include', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, securityPin: pin, newPassword: password })
    });
    const data = await res.json();
    setMessage(data.message || (res.ok ? 'Success' : 'Failed'));
  }

  return (
    <form onSubmit={submit}>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email" />
      <input type="text" value={pin} onChange={e=>setPin(e.target.value)} required placeholder="Security PIN" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="New password" />
      <button type="submit">Reset Password</button>
      {message && <div>{message}</div>}
    </form>
  );
}
```


## 4) Minimal HTML + vanilla JS example

Request reset pin:

```html
<form id="requestReset">
  <input id="email" type="email" required placeholder="Email" />
  <button type="submit">Request PIN</button>
</form>
<div id="out"></div>
<script>
document.getElementById('requestReset').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const r = await fetch('/api/auth/request-reset', { method:'POST', credentials: 'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })});
  const data = await r.json();
  document.getElementById('out').innerText = JSON.stringify(data);
});
</script>
```


## 5) cURL / PowerShell quick tests

Request pin (dev):

```bash
curl -X POST http://localhost:5000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com"}'
```

Reset password:

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","securityPin":"<PIN>","newPassword":"newSecret123"}'
```

Login (get token):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"newSecret123"}'
```


## 6) Frontend: After login — fetch protected data

With the server setting an HttpOnly cookie, you can call protected endpoints without manually attaching Authorization headers.

Example using cookie (recommended):

```js
fetch('/jobs', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If you stored the token manually (not recommended), you can still call via header:

```js
const token = localStorage.getItem('token');
fetch('/jobs', { headers: { Authorization: 'Bearer ' + token }})
  .then(r=>r.json()).then(console.log).catch(console.error);
```

Logout (clear cookie):

```js
fetch('/logout', { method: 'POST', credentials: 'include' })
  .then(r => r.json()).then(console.log);
```


## 7) Production considerations

- Do NOT return security pins in API responses in production. Instead generate the pin server-side and send it via email/SMS using a provider (SendGrid, SES, Twilio).
- Rate-limit `/request-reset` attempts to prevent abuse.
- Shorten pin expiry (1 hour) in production for better security.
- Consider adding `tokenVersion` to user document so you can invalidate existing tokens when permissions change.
- Use HTTPS for all requests.

