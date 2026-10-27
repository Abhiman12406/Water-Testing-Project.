# Start FastAPI Backend and Next.js Frontend for Water Quality Prediction

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting AquaGuard AI: FastAPI & Next.js Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend in background job
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; & 'C:\Users\Asus\AppData\Local\Programs\Python\Python312\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Start-Sleep -Seconds 3

# 2. Start Next.js Frontend
Write-Host "`n[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
$frontendJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host "`nBoth services are launching!" -ForegroundColor Yellow
Write-Host "  -> Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  -> Backend Swagger API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  -> Backend Health: http://localhost:8000/api/health`n" -ForegroundColor White
