#!/bin/bash

echo "🚀 Démarrage de StockProtec..."
echo ""
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Construction de l'interface..."
npm run build

echo "✅ Démarrage du serveur API..."
npm run server
