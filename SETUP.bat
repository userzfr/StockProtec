@echo off
echo ========================================
echo   STOCKPROTEC - SETUP DEPENDANCES
echo ========================================
echo.

echo [SETUP] Installation des dependances Node.js...
call npm install

if errorlevel 1 (
    echo [ERROR] Echec de l'installation des dependances.
    pause
    exit /b 1
)

echo.
echo [SETUP] Dependances installees avec succes.
echo [INFO] Vous pouvez maintenant utiliser START PROD.bat pour demarrer l'application.
pause