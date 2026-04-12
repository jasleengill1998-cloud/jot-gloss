# StudyBloom Deployment & Cloud Sync Guide

## 1. Deploy to Vercel (Access Online)

### Option A: CLI Deploy (Quickest)
```bash
cd studybloom
npm run build
npx vercel --prod
```
Follow the prompts. You'll get a URL like `studybloom.vercel.app`.

### Option B: GitHub → Vercel (Auto-deploys on push)
1. Create a GitHub repo: `gh repo create studybloom --private --source=. --push`
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Click "Import Project" → select your `studybloom` repo
4. Framework: Vite, Build: `npm run build`, Output: `dist`
5. Deploy. Done. Every push to `main` auto-deploys.

## 2. Cloud Sync (Cross-Device Data)

StudyBloom currently stores everything in **IndexedDB** (local to each browser).
To sync across devices, you need a cloud backend. Here's how to add Supabase:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com), create a free account
2. Create a new project (name it "studybloom")
3. Go to **Settings → API** and copy your:
   - `Project URL` (e.g., `https://abc123.supabase.co`)
   - `anon public key`

### Step 2: Create the Database Table
In the Supabase SQL Editor, run:
```sql
CREATE TABLE study_files (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  class_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  version INT DEFAULT 1,
  archived BOOLEAN DEFAULT false,
  size INT DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE study_files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own files
CREATE POLICY "Users see own files" ON study_files
  FOR ALL USING (auth.uid() = user_id);
```

### Step 3: Enable Auth
In Supabase Dashboard → Authentication → Providers:
- Enable **Email** (for email/password login)
- Or enable **Google** OAuth (for one-click sign in)

### Step 4: Add Supabase to StudyBloom
```bash
npm install @supabase/supabase-js
```

Create `src/db/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_PROJECT_URL'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Then modify `src/hooks/useFiles.ts` to sync between IndexedDB (offline) and Supabase (online):
- On load: fetch from Supabase, merge with IndexedDB
- On save: write to IndexedDB immediately, then sync to Supabase
- On reconnect: sync any offline changes

This gives you offline-first with cloud backup.

### Step 5: Add Login UI
Add a simple login screen that appears before the main app. Use `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOAuth({ provider: 'google' })`.

## 3. Install as PWA

### Windows (Chrome)
1. Open your deployed URL in Chrome
2. Click the install icon in the address bar (or Menu → Install StudyBloom)
3. It creates a desktop shortcut that opens standalone

### iPad / iPhone (Safari)
1. Open the URL in Safari
2. Tap Share → Add to Home Screen
3. Name it "StudyBloom" → Add

### Android (Chrome)
1. Open the URL in Chrome
2. Tap the three dots → Install app
