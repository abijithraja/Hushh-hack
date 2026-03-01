# 🔐 Enable Google OAuth in Supabase

## Step-by-Step Guide

### 1. Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/mbaywlmlbbahfmhclftz

### 2. Navigate to Authentication Settings
- Click **Authentication** in left sidebar
- Click **Providers** tab

### 3. Enable Google Provider
- Find **Google** in the provider list
- Toggle it **ON** (Enable)

### 4. Configure Google OAuth (Two Options)

#### Option A: Use Supabase's Pre-configured OAuth (Easiest)
- Just toggle Google ON
- Supabase provides default OAuth credentials for development
- **This works immediately for testing!**

#### Option B: Use Your Own Google OAuth Credentials (Production)

1. **Create Google OAuth Credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create a new project or select existing one
   - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `SkillGig`
   
2. **Add Authorized Redirect URIs:**
   ```
   https://mbaywlmlbbahfmhclftz.supabase.co/auth/v1/callback
   ```
   
3. **Copy Credentials to Supabase:**
   - Copy **Client ID** → Paste in Supabase Google provider settings
   - Copy **Client Secret** → Paste in Supabase Google provider settings
   - Click **Save**

### 5. Add Site URL (Important!)

In Supabase → Authentication → URL Configuration:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** Add `http://localhost:3000/auth/callback`

### 6. Test the Login

- Go to http://localhost:3000
- Click "Sign in with Google"
- Should now work! ✓

---

## Quick Test (Option A - Recommended)

For development/testing, **just enable Google in Supabase** (toggle ON). 

Supabase provides OAuth credentials automatically. No need to create your own Google Cloud project!

---

## Current Status

✅ Frontend & Backend running  
✅ Environment files configured  
✅ Database tables created (needs to be done if not yet)  
⏳ **Enable Google OAuth** ← You are here  
⏳ Test login flow

---

## What's Your Supabase Project URL?

Your project: `https://mbaywlmlbbahfmhclftz.supabase.co`

Go there now and enable Google provider!
