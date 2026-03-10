#!/bin/bash

echo "🚀 Démarrage de StockProtec..."
echo ""
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Démarrage du serveur API et de l'interface..."
npm run dev:all
