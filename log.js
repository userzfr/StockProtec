// Système de log compact pour StockProtec
// Format: YYYY-MM-DD HH:MM | user:Nom | action:Type | article:Nom
// Ce module gère l'écriture et la rotation automatique du fichier de log.

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'logs', 'stockprotec.log');
const MAX_LOG_SIZE = 1024 * 1024; // 1 Mo

function logAction({ user, action, article }) {
  const now = new Date();
  const date = now.toISOString().replace('T', ' ').substring(0, 16);
  const entry = `${date} | user:${user} | action:${action} | article:${article}\n`;
  rotateIfNeeded();
  fs.appendFileSync(LOG_PATH, entry, 'utf8');
}

function rotateIfNeeded() {
  if (fs.existsSync(LOG_PATH)) {
    const stats = fs.statSync(LOG_PATH);
    if (stats.size > MAX_LOG_SIZE) {
      const backupName = `stockprotec_${Date.now()}.log`;
      fs.renameSync(LOG_PATH, path.join(__dirname, 'logs', backupName));
    }
  }
  // Suppression des logs de plus de 6 mois
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  if (fs.existsSync(logsDir)) {
    fs.readdirSync(logsDir).forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const now = Date.now();
      const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
      if (now - stats.birthtimeMs > sixMonths) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = { logAction };
