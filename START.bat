@echo off
echo Demarrage de StockProtec...
echo.
echo Installation des dependances...
call npm install

echo.
echo Reconstruction des modules natifs...
call npm rebuild

echo.
echo Demarrage du serveur et de l'interface (dev)...
call npm run dev:all

echo.
echo StockProtec demarre. Ouvre http://localhost:5175 dans votre navigateur.
pause