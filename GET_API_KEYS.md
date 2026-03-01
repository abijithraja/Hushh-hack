# 🔑 GET YOUR SUPABASE API KEYS

## Step 1: Go to Supabase Dashboard

Visit: https://supabase.com/dashboard/project/mbaywlmlbbahfmhclftz/settings/api

## Step 2: Copy Your Keys

You'll see two keys:

### 1️⃣ **anon public** key (starts with `eyJ...`)
- This is safe to use in frontend
- Copy this ENTIRE long string

### 2️⃣ **service_role** key (also starts with `eyJ...`)  
- This is SECRET - only use in backend
- Copy this ENTIRE long string

## Step 3: Update Your .env Files

### Frontend (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://mbaywlmlbbahfmhclftz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env):
```env
SUPABASE_URL=https://mbaywlmlbbahfmhclftz.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_KEY_HERE
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Step 4: Restart Servers

After updating the keys:

```bash
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start both servers (from root directory)
npm run dev
```

---

## 🚨 Important Notes:

1. **The keys are VERY LONG** - make sure you copy the entire string
2. **Don't add quotes** around the keys
3. **Don't share the service_role key** - it's secret
4. **You must restart the servers** after changing .env files

---

## Why This Broke Your Login:

Without the real API key, Supabase can't:
- ✗ Authenticate with Google
- ✗ Store sessions
- ✗ Read/write to database

Once you add the real keys → everything will work! 🎉
