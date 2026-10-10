@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0start-study-os.ps1"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173/"
