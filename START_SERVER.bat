@echo off
title Warehouse OS - Server
echo.
echo   ================================================
echo   ^|   Warehouse OS - Starting...                  ^|
echo   ^|   Frontend: http://localhost:5173              ^|
echo   ^|   API:      http://localhost:3001              ^|
echo   ================================================
echo.

REM Add Node.js portable to PATH if needed
set "NODE_DIR=C:\Users\huongcv\nodejs\node-v22.16.0-win-x64"
if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
)

REM Also check standard install location
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

REM Add Git to PATH
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "PATH=C:\Program Files\Git\cmd;%PATH%"
)

REM Check if node is available
where node >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo   Node.js found: 
node --version

REM Install dependencies if needed
if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install
)

REM Start both servers
echo   Starting API + Frontend servers...
echo.
npx concurrently -n API,UI -c blue,green "node server/server.js" "npx vite"
