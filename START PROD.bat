@echo off
echo Demarrage de StockProtec en mode PRODUCTION...
echo.
echo Installation des dependances...
call npm install

echo.
echo Reconstruction des modules natifs...
call npm rebuild

echo.
echo Construction de l'application...
call npm run build

echo.
echo Demarrage du serveur officiel...
call npm run server

echo.
echo StockProtec en production demarre. Accessible sur http://[IP_DU_SERVEUR]:3001
pause