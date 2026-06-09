@echo off
title Laxmi Enterprises Billing & Inventory System Launcher
color 0A

echo ==========================================================
echo           LAXMI ENTERPRISES SYSTEM LAUNCHER
echo ==========================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js to run this offline system.
    pause
    exit /b
)

echo [1/3] Node.js environment detected.

:: Check MongoDB
netstat -ano | findstr 27017 >nul
if %errorlevel% neq 0 (
    echo [2/3] MongoDB is not running on port 27017.
    echo Attempting to start MongoDB service...
    net start MongoDB >nul 2>nul
    if %errorlevel% neq 0 (
        echo [!] Could not auto-start MongoDB. Ensure your local MongoDB Server is active.
    ) else (
        echo [2/3] MongoDB service started successfully.
    )
) else (
    echo [2/3] MongoDB database server is active.
)

:: Start Backend Server
echo [3/3] Starting backend API and frontend servers...
cd backend
start "Laxmi Hardware - Backend API" /min cmd /c "npm run dev"
cd ..

:: Start Frontend Server
cd frontend
start "Laxmi Hardware - Next.js UI" /min cmd /c "npm run dev"
cd ..

echo.
echo ==========================================================
echo  Servers are starting in the background!
echo  Please wait 6 seconds while the billing desk initializes...
echo ==========================================================
timeout /t 6 /nobreak >nul

echo.
echo Launching your billing application in the browser...
start http://localhost:3000

echo.
echo ==========================================================
echo  SYSTEM IS ACTIVE AND RUNNING OFFLINE
echo  Keep this launcher window open while using the application.
echo  To shut down, close this window and the minimized servers.
echo ==========================================================
echo.
pause
