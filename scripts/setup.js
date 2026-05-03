#!/usr/bin/env node

import { execSync } from 'child_process';

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}

console.log('========================================');
console.log('   STOCKPROTEC - SETUP DEPENDANCES');
console.log('========================================');
console.log();

log('[SETUP] Installation des dépendances Node.js...');
try {
  execSync('npm install', { stdio: 'inherit' });
  log('[SETUP] Dépendances installées avec succès.');
  log('[INFO] Vous pouvez maintenant utiliser \'npm run build\' pour construire l\'application.');
  log('[INFO] Vous pouvez ensuite utiliser \'npm run prod\' pour démarrer l\'application.');
} catch (error) {
  log('[ERROR] Échec de l\'installation des dépendances.');
  process.exit(1);
}