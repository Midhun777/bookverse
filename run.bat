@echo off
echo ==========================================
echo Starting Bookverse
echo ==========================================

echo Starting Node.js Backend Server...
start cmd /k "cd server && npm run dev"

echo Starting React Frontend...
start cmd /k "cd client && npm run dev"

echo.
echo ==========================================
echo All services are starting up!
echo Backend running in: server folder
echo Frontend running in: http://localhost:5173
echo ==========================================
echo Keep these command windows open while testing.
pause