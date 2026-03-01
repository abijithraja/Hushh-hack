@echo off
echo Starting SkillGig Development Servers...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd gig-backend && npm run dev"

REM Wait 2 seconds
timeout /t 2 /nobreak > nul

REM Start frontend in new window  
start "Frontend Server" cmd /k "cd gig-frontend && npm run dev"

echo.
echo Backend starting on http://localhost:5000
echo Frontend starting on http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
