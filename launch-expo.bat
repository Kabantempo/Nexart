@echo off
REM Nexart Mobile — Expo Web Launcher
REM Double-click to launch the app

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 Nexart Mobile — Expo Web Launcher                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo ✅ Killing any existing Expo processes...
taskkill /F /IM node.exe >nul 2>&1

echo ✅ Clearing cache...
timeout /t 2 /nobreak >nul

echo ✅ Starting Expo Web...
echo.
echo 🔗 App will be available at: http://localhost:19006
echo.
echo 📱 For Mobile Preview in VS Code:
echo    - Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
echo    - Search: "Mobile Preview: Open Preview"
echo    - Enter: http://localhost:19006
echo.
echo ⏳ Waiting for compilation (this may take 1-2 minutes)...
echo.

npm run web

pause
