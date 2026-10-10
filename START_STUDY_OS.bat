@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js LTS, then run npm install once.
  pause
  exit /b 1
)
if not exist "node_modules\vinext\dist\cli.js" (
  echo Dependencies are missing. Run npm install in this folder once.
  pause
  exit /b 1
)
echo Study OS: http://localhost:5173
echo Keep this window open while using Study OS.
node scripts/start-local.mjs
if errorlevel 1 (
  echo Study OS could not start. See the message above.
  pause
  exit /b 1
)
