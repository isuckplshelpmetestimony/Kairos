# Supabase Configuration for Render Deployment

## 🎯 Purpose
This guide shows you how to configure Supabase environment variables in Render so user tracking and appraisal history work correctly in production.

---

## 📋 Prerequisites

1. **Supabase Project Created**
   - Go to https://supabase.com
   - Create a new project (or use existing)
   - Wait for project to finish provisioning

2. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public key** (starts with `eyJ...`)
     - **service_role key** (starts with `eyJ...` - different from anon key)

---

## 🔧 Configure Render Environment Variables

### Step 1: Configure Backend (kairos-backend)

1. Go to https://dashboard.render.com
2. Click on **kairos-backend** service
3. Go to **Environment** tab
4. Add these environment variables:

| Key | Value | Where to Find |
|-----|-------|---------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Supabase → Project Settings → API → service_role key |

5. Click **Save Changes**
6. Backend will automatically redeploy

---

### Step 2: Configure Frontend (kairos-frontend)

1. Still in Render dashboard
2. Click on **kairos-frontend** service
3. Go to **Environment** tab
4. Add these environment variables:

| Key | Value | Where to Find |
|-----|-------|---------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Project Settings → API → anon public key |

5. Click **Save Changes**
6. Frontend will automatically rebuild and redeploy

---

## 🗄️ Create Supabase Tables

Run these SQL commands in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql):

### Create `appraisals` table

```sql
CREATE TABLE appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  property_address TEXT NOT NULL,
  municipality TEXT,
  province TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'started',
  properties_found INTEGER,
  duration_minutes INTEGER,
  error_type TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_appraisals_user_id ON appraisals(user_id);
CREATE INDEX idx_appraisals_created_at ON appraisals(created_at DESC);
```

### Create `activity_logs` table

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  metadata JSONB,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

---

## ✅ Verify Configuration

### Test Backend Connection

1. SSH into your backend or check logs
2. Look for: `✅ Updated appraisal [id] with status: completed`
3. No errors about Supabase connection

### Test Frontend Connection

1. Open your Kairos frontend
2. Open browser console (F12)
3. Generate a CMA report
4. Look for: `🎭 Demo Mode:` messages
   - **If you see this:** Supabase NOT configured correctly
   - **If you DON'T see this:** Supabase IS working! ✅

### Check Supabase Dashboard

1. Go to Supabase → Table Editor
2. Check `appraisals` table
3. Should see new rows after generating CMAs
4. Check `activity_logs` table
5. Should see login events and other activity

---

## 🔒 Security Notes

1. **Never commit these keys to git**
   - They're set in Render dashboard only
   - `sync: false` in render.yaml prevents them from being in version control

2. **Use service_role key only in backend**
   - Backend uses `SUPABASE_SERVICE_KEY` (full access)
   - Frontend uses `VITE_SUPABASE_ANON_KEY` (limited access)

3. **Enable Row Level Security (RLS) when adding real auth**
   - Currently using session-based fake auth
   - When adding real auth, enable RLS policies

---

## 🐛 Troubleshooting

### "Failed to create appraisal record" Error

**Cause:** Supabase environment variables not set in Render

**Fix:**
1. Check Render dashboard → Environment variables
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Verify values match your Supabase project
4. Redeploy frontend

### Backend "Missing Supabase environment variables" Error

**Cause:** Backend Supabase variables not set

**Fix:**
1. Check Render dashboard → kairos-backend → Environment
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
3. Redeploy backend

### Tables Don't Exist Error

**Cause:** Supabase tables not created

**Fix:**
1. Run the SQL commands above in Supabase SQL Editor
2. Verify tables exist in Table Editor
3. Try generating CMA again

---

## 📊 What Gets Tracked

### Appraisals Table
- User ID (session-based for now)
- Property address searched
- Municipality and province
- Start time and completion time
- Number of properties found
- Duration in minutes
- Error information (if failed)

### Activity Logs Table
- User ID
- Event type (login, error, etc.)
- Event description
- Metadata (additional context)
- Error details (if applicable)

---

## 🔮 Future: Real User Authentication

When ready to add real user accounts:

1. **Enable Supabase Auth**
   ```typescript
   // In useAuth.ts, replace session user with:
   const { data: { user } } = await supabase.auth.getUser()
   ```

2. **Enable Row Level Security (RLS)**
   ```sql
   ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
   
   -- Users can only see their own data
   CREATE POLICY "Users can view own appraisals" ON appraisals
     FOR SELECT USING (auth.uid()::text = user_id);
   
   CREATE POLICY "Users can insert own appraisals" ON appraisals
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
   ```

3. **Update useAuth Hook**
   - Replace fake session users with real Supabase Auth
   - Keep the same interface (user.id, user.email)
   - Everything else continues working

---

## ✨ Summary

After following this guide:
- ✅ Supabase configured in Render
- ✅ Tables created and indexed
- ✅ User activity tracking works
- ✅ Appraisal history saved
- ✅ Ready for real auth migration later

**Next Step:** Generate a CMA and check Supabase Table Editor to see the data! 🎉

