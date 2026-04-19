import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des sauvegardes
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_PATH = path.join(__dirname, '..', 'stockprotec.db');
const MAX_BACKUPS = 10; // Garder seulement les 10 dernières sauvegardes

/**
 * Crée le dossier de sauvegarde s'il n'existe pas
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Dossier de sauvegarde créé: ${BACKUP_DIR}`);
  }
}

/**
 * Génère un nom de fichier de sauvegarde avec timestamp
 */
function generateBackupFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `stockprotec-${timestamp}.db`;
}

/**
 * Crée une sauvegarde de la base de données
 */
export function createBackup() {
  try {
    ensureBackupDir();

    if (!fs.existsSync(DB_PATH)) {
      console.warn('⚠️  Base de données introuvable, sauvegarde ignorée');
      return null;
    }

    const backupFilename = generateBackupFilename();
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    // Copier le fichier de base de données
    fs.copyFileSync(DB_PATH, backupPath);

    // Nettoyer les anciennes sauvegardes
    cleanupOldBackups();

    console.log(`✅ Sauvegarde créée: ${backupFilename}`);
    return backupFilename;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la sauvegarde:', error);
    return null;
  }
}

/**
 * Supprime les sauvegardes les plus anciennes pour ne garder que MAX_BACKUPS
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('stockprotec-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Ancienne sauvegarde supprimée: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des sauvegardes:', error);
  }
}

/**
 * Liste toutes les sauvegardes disponibles
 */
export function listBackups() {
  try {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('stockprotec-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime,
          createdISO: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  } catch (error) {
    console.error('❌ Erreur lors de la liste des sauvegardes:', error);
    return [];
  }
}

/**
 * Restaure une sauvegarde spécifique
 */
export function restoreBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Sauvegarde introuvable: ${backupFilename}`);
    }

    // Créer une sauvegarde de sécurité avant la restauration
    const safetyBackup = `safety-${Date.now()}.db`;
    const safetyPath = path.join(BACKUP_DIR, safetyBackup);
    fs.copyFileSync(DB_PATH, safetyPath);

    // Restaurer la sauvegarde
    fs.copyFileSync(backupPath, DB_PATH);

    console.log(`✅ Base de données restaurée depuis: ${backupFilename}`);
    console.log(`🛡️  Sauvegarde de sécurité créée: ${safetyBackup}`);

    return { success: true, safetyBackup };
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprime une sauvegarde spécifique
 */
export function deleteBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Sauvegarde introuvable: ${backupFilename}`);
    }

    fs.unlinkSync(backupPath);
    console.log(`🗑️  Sauvegarde supprimée: ${backupFilename}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la sauvegarde:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtient les informations sur l'espace disque utilisé par les sauvegardes
 */
export function getBackupStats() {
  try {
    const backups = listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].createdISO : null,
      newestBackup: backups.length > 0 ? backups[0].createdISO : null
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return null;
  }
}
