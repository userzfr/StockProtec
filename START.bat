@echo off
title Lancement de StockProtec

echo Installation des dependances...
call npm install

echo.
echo Installation du logiciel tiers...
call npm install sqlite3 express

echo.
echo Lancement du serveur...
start "" http://localhost:3000
node server.js

pause
