# Complete Migration Guide: Node.js (Express) to Next.js (App Router)

This guide provides a step-by-step plan to migrate your existing **jobAddah** Node.js/Express server completely into a **Next.js** full-stack application.

## Goal
Transform your standalone Node.js server into a single Next.js application where:
- **Models** (`models/`) become Next.js server-side models.
- **Controllers/Routes** (`routes/`, `controller/`) become Next.js **Route Handlers** (`app/api/...`).
- **Scrapers/Utils** become server-side utility functions.

---

## Phase 1: Project Initialization

First, create your Next.js application (if you haven't already). We recommend using the **App Router**.

```bash
npx create-next-app@latest jobaddah-web
# Select:
# - TypeScript: No (or Yes if you want to migrate to TS)
# - ESLint: Yes
# - Tailwind CSS: Yes (recommended for UI)
# - src/ directory: Yes
# - App Router: Yes
# - Import alias (@/*): Yes
```

---

## Phase 2: Install Dependencies

You need to install the same dependencies your server uses in the new Next.js project.

Run this inside your new Next.js project folder:

```bash
npm install mongoose axios cheerio @google/generative-ai bcryptjs jsonwebtoken cookie-parser string-similarity undici
```

*Note: `express`, `cors`, `nodemon` are NOT needed anymore. Next.js handles routing and dev server.*

---

## Phase 3: Folder Structure Setup

Organize your files within the Next.js `src` directory to keep backend logic clean.

Recommended Structure:

```text
src/
├── app/
│   ├── api/                <-- API Routes go here
│   │   ├── auth/
│   │   ├── gov/
│   │   └── ...
│   └── page.js             <-- Frontend pages
├── lib/
│   └── db.js               <-- Database connection (Singleton)
├── models/                 <-- Mongoose models
├── utils/                  <-- Helper functions (AI, Scrapers)
└── middleware.js           <-- Next.js Middleware
```

---

## Phase 4: Database Connection (Critical)

In Next.js, "hot reloading" can cause multiple DB connections. You **must** use a cached connection pattern.

Create `src/lib/db.js`:

```javascript
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

---

## Phase 5: Migrating Models

Next.js will re-compile model files. You must check if the model already exists before compiling it to avoid `OverwriteModelError`.

**Update every file in `src/models/`**:

**Old (Express):**
```javascript
module.exports = mongoose.model('User', userSchema);
```

**New (Next.js):**
```javascript
// Check if model exists, otherwise create it
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
```

*Example: `src/models/user.js`*
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ... your schema definition
});

// IMPORTANT: Add this check
export default mongoose.models.User || mongoose.model('User', userSchema);
```

---

## Phase 6: Migrating API Routes (The Big Change)

Express uses `req` (Request) and `res` (Response) objects.
Next.js App Router uses `NextRequest` and `NextResponse` standard Web APIs.

### 1. Simple GET Request

**Old (Express Controller):**
```javascript
// controller/govtpost.js
exports.getPosts = async (req, res) => {
  const posts = await Post.find();
  res.json({ success: true, data: posts });
};
```

**New (Next.js Route Handler):**
File: `src/app/api/gov/posts/route.js`

```javascript
import connectDB from '@/lib/db';
import Post from '@/models/gov/govtpost';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await connectDB();
  
  try {
    const posts = await Post.find({});
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 2. POST Request with Body

**Old (Express):**
```javascript
exports.createPost = async (req, res) => {
  const { title } = req.body;
  // ...
};
```

**New (Next.js):**
File: `src/app/api/gov/posts/route.js`

```javascript
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectDB();
  
  // Parse body
  const body = await request.json();
  const { title } = body;

  // ... logic ...
  
  return NextResponse.json({ success: true, message: "Created" });
}
```

### 3. Dynamic Routes (params)

**Old (Express):**
```javascript
// router.get('/post/:id', controller.getPost);
const { id } = req.params;
```

**New (Next.js):**
File: `src/app/api/gov/posts/[id]/route.js`

```javascript
export async function GET(request, { params }) {
  await connectDB();
  const { id } = params; // Access dynamic ID
  
  const post = await Post.findById(id);
  return NextResponse.json({ success: true, data: post });
}
```

---

## Phase 7: Migrating Middleware (Auth)

Next.js has a global `middleware.js` file, but for API authentication, it's often easier to use a helper function inside your route handler since standard middleware runs on the Edge (and can't connect to MongoDB easily).

**Recommended Pattern: Wrapper Function**

Create `src/utils/auth-check.js`:
```javascript
import jwt from 'jsonwebtoken';

export const isAuthenticated = async (request) => {
  const token = request.cookies.get('token')?.value; // Get cookie
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};
```

Usage in API Route:
```javascript
import { isAuthenticated } from '@/utils/auth-check';

export async function POST(request) {
  const user = await isAuthenticated(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed
}
```

---

## Phase 8: Migrating Scrapers & Utils

Copy your `scrapper/` folder to `src/utils/scrapper/`.
You can keep the logic mostly the same. Just ensure:
1. They export functions (don't run scripts directly).
2. They are `async`.
3. You call them from an API Route (e.g., `src/app/api/admin/trigger-scrape/route.js`).

---

## Phase 9: Environment Variables

Move your `.env` content to `.env.local` in the Next.js root.

**Important:**
- Server-side keys (API keys, DB URI) are available as `process.env.KEY`.
- Variables meant for the frontend must start with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_ANALYTICS_ID`).

---

## Summary Checklist

1. [ ] Create Next.js App (`npx create-next-app`).
2. [ ] Install backend dependencies (`mongoose`, etc.).
3. [ ] Create `src/lib/db.js` (Singleton connection).
4. [ ] Copy Models to `src/models/` and add `mongoose.models` check.
5. [ ] Create `src/app/api/...` folders reflecting your `routes/` structure.
6. [ ] Rewrite Controllers into `route.js` files using `NextResponse`.
7. [ ] Move `scrapper` and `utils` to `src/utils`.
8. [ ] Copy `.env` to `.env.local`.
9. [ ] Run `npm run dev` and test APIs using Postman or Browser.

This creates a true "Full Stack" Next.js app where your Node backend is now integrated directly into the framework.