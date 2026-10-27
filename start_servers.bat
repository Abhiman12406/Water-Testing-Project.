@echo off
echo ==========================================================
echo   Starting AquaGuard AI: FastAPI and Next.js Services
echo ==========================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "FastAPI Backend" cmd /k "cd backend && C:\Users\Asus\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js Frontend on http://localhost:3000...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo   Frontend: http://localhost:3000
echo   Backend Docs: http://localhost:8000/docs
echo ==========================================================
