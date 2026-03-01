# SkillGig Development Server Starter
Write-Host "Starting SkillGig Development Servers..." -ForegroundColor Green

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\gig-backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; npm run dev"

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\gig-frontend'; Write-Host 'Starting Frontend Server...' -ForegroundColor Magenta; npm run dev"

Write-Host ""
Write-Host "✓ Backend starting on http://localhost:5000" -ForegroundColor Yellow
Write-Host "✓ Frontend starting on http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to exit this window..." -ForegroundColor Gray
Read-Host
