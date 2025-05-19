@echo off
title Lancement de StockProtec

echo Installation des dependances...
call npm install

echo.
echo Lancement du serveur...
start "" http://localhost:3000
node server.js

pause
