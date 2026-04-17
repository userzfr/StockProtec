#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}

function runCommand(command, description) {
  try {
    log(`[EXEC] ${description}...`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`[ERROR] Échec de : ${description}`);
    return false;
  }
}

console.log('========================================');
console.log('   STOCKPROTEC - DEMARRAGE PRODUCTION');
console.log('========================================');
console.log();

// Configuration : FORCE_BUILD=false (skip si dist existe) ou true (toujours rebuild)
const forceBuild = process.env.FORCE_BUILD === 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Déterminer si on doit builder
let doBuild = forceBuild;
if (!fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  doBuild = true;
}

// Construction de l'application frontend
if (doBuild) {
  log('[BUILD] Construction de l\'application frontend...');
  if (!runCommand('npm run build', 'Build frontend')) {
    process.exit(1);
  }
  log('[BUILD] Build terminé.');
} else {
  log('[SKIP] Build déjà présent (définir FORCE_BUILD=true pour forcer le rebuild).');
}
console.log();

log('[START] Démarrage du serveur API + Frontend...');
log('[INFO] Backend : http://localhost:3001 (non accessible depuis internet)');
log('[INFO] Frontend servi depuis le dossier \'dist\'');
log('[INFO] Utilisez un reverse proxy (Nginx/IIS) pour exposer sur port 80/443');
console.log();

// Démarrage du serveur
try {
  execSync('npm run server', { stdio: 'inherit' });
  log('[INFO] Serveur arrêté normalement.');
} catch (error) {
  console.log();
  log('[ERROR] Le serveur s\'est arrêté inopinément.');
  log('[INFO] Vérifier les logs du serveur et les erreurs dans la console.');
  log('[INFO] Relancer le script ou contacter le support technique.');
  process.exit(1);
}