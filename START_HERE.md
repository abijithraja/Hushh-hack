# 🚀 Quick Start Guide

## Three Ways to Start Development Servers

### 1️⃣ NPM Command (Recommended)
```bash
npm run dev
```
✓ Runs both servers in one terminal  
✓ Cross-platform (Windows/Mac/Linux)  
✓ Shows combined logs

### 2️⃣ PowerShell Script (Windows)
```powershell
.\start-dev.ps1
```
OR just **double-click `start-dev.ps1`** in File Explorer

✓ Opens separate windows for backend & frontend  
✓ Color-coded output  
✓ Easy to stop each server independently

### 3️⃣ Batch File (Windows)
```cmd
start-dev.bat
```
OR just **double-click `start-dev.bat`** in File Explorer

✓ Opens separate windows for backend & frontend  
✓ Simple and lightweight  
✓ No PowerShell required

---

## After Starting:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## First Time Setup:

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment files:**
   - Edit `gig-frontend/.env.local` with Supabase keys
   - Edit `gig-backend/.env` with service role key

3. **Set up Supabase:**
   - Run SQL to create tables (see README.md)
   - Enable Google OAuth
   - Create `gigs-images` storage bucket

4. **Start servers** using any method above

---

## Troubleshooting:

**Port 3000 already in use?**
```powershell
# Stop all Node processes
taskkill /F /IM node.exe
```

**Can't run PowerShell script?**
```powershell
# Enable script execution (run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
