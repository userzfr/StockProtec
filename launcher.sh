#!/bin/bash

# ========================================
#   STOCKPROTEC - LAUNCHER CROSS-PLATFORM
# ========================================
# Lanceur unifié utilisant npm scripts
# Compatible Windows/Linux/Mac

echo "========================================"
echo "  STOCKPROTEC - LAUNCHER CROSS-PLATFORM"
echo "========================================"
echo

# Mode setup ou prod
if [ "$1" = "setup" ]; then
    echo "[SETUP] Installation des dépendances..."
    npm run setup
else
    echo "[START] Démarrage production..."
    # Gestion FORCE_BUILD
    if [ "$FORCE_BUILD" = "true" ]; then
        npm run prod:force
    else
        npm run prod
    fi
fi