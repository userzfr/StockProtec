@echo off
echo ========================================
echo   STOCKPROTEC - LAUNCHER WINDOWS
echo ========================================
echo.

if /i "%1"=="setup" (
    echo [SETUP] Installation des dependances...
    npm run setup
    exit /b %errorlevel%
)

echo [START] Demarrage production...
if /i "%FORCE_BUILD%"=="true" (
    npm run prod:force
) else (
    npm run prod
)
exit /b %errorlevel%
