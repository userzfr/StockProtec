@echo off
echo ========================================
echo   STOCKPROTEC - DEMARRAGE PRODUCTION
echo ========================================
echo.

REM Configuration : FORCE_BUILD=false (skip si dist existe) ou true (toujours rebuild)
if "%FORCE_BUILD%"=="" set "FORCE_BUILD=false"

REM Déterminer si on doit builder
set "DO_BUILD=false"
if "%FORCE_BUILD%"=="true" set "DO_BUILD=true"
if not exist "dist" set "DO_BUILD=true"

REM Construction de l'application frontend
if "%DO_BUILD%"=="true" (
    echo [%TIME%] [BUILD] Construction de l'application frontend...
    call npm run build

    if errorlevel 1 (
        echo [%TIME%] [ERROR] Echec du build. Arret.
        pause
        exit /b 1
    )
    echo [%TIME%] [BUILD] Build termine.
) else (
    echo [%TIME%] [SKIP] Build deja present (definir FORCE_BUILD=true pour forcer le rebuild).
)
echo.

echo [%TIME%] [START] Demarrage du serveur API + Frontend...
echo [%TIME%] [INFO] Backend : http://localhost:3001 (non accessible depuis internet)
echo [%TIME%] [INFO] Frontend servi depuis le dossier 'dist'
echo [%TIME%] [INFO] Utilisez un reverse proxy (Nginx/IIS) pour exposer sur port 80/443
echo.
call npm run server

REM Vérifier si le serveur s'est arrêté avec une erreur
if errorlevel 1 (
    echo.
    echo [%TIME%] [ERROR] Le serveur s'est arrete inopinément.
    echo [%TIME%] [INFO] Verifier les logs du serveur et les erreurs dans la console.
    echo [%TIME%] [INFO] Relancer le script ou contacter le support technique.
) else (
    echo.
    echo [%TIME%] [INFO] Serveur arrete normalement.
)
pause