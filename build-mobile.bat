@echo off
REM Build mobile.html from index.html
REM Run this after editing index.html

cd /d "%~dp0"
node build-mobile.js
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Done! mobile.html is now synced with index.html
) else (
    echo.
    echo Error: Make sure Node.js is installed
)
pause
