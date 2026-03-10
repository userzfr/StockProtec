import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Créer ou ouvrir la base de données
const dbPath = join(__dirname, '..', 'stockprotec.db');
const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Fonction pour initialiser la base de données
export function initializeDatabase() {
  console.log('🔧 Initialisation de la base de données SQLite...');

  // Table des utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table des sacs opérationnels
  db.exec(`
    CREATE TABLE IF NOT EXISTS bags (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      description TEXT,
      last_control_date TEXT,
      status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
      deployment_status TEXT CHECK(deployment_status IN ('present', 'deployed')),
      deployment_location TEXT,
      deployment_date TEXT,
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table des poches
  db.exec(`
    CREATE TABLE IF NOT EXISTS pockets (
      id TEXT PRIMARY KEY,
      bag_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      ordre_affichage INTEGER,
      FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE
    )
  `);

  // Table des items dans les sacs
  db.exec(`
    CREATE TABLE IF NOT EXISTS bag_items (
      id TEXT PRIMARY KEY,
      pocket_id TEXT NOT NULL,
      name TEXT NOT NULL,
      expected_quantity INTEGER NOT NULL,
      check_type TEXT NOT NULL CHECK(check_type IN ('button', 'quantity')),
      FOREIGN KEY (pocket_id) REFERENCES pockets(id) ON DELETE CASCADE
    )
  `);

  // Table des produits de pharmacie
  db.exec(`
    CREATE TABLE IF NOT EXISTS pharmacy_products (
      id TEXT PRIMARY KEY,
      nom_produit TEXT NOT NULL,
      code_barre TEXT UNIQUE NOT NULL,
      categorie TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      peremption_date TEXT,
      control_date TEXT,
      lot_number TEXT,
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table du matériel opérationnel individuel
  db.exec(`
    CREATE TABLE IF NOT EXISTS operational_equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
      control_date TEXT,
      peremption_date TEXT,
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  // Table de l'historique des contrôles
  db.exec(`
    CREATE TABLE IF NOT EXISTS control_history (
      id TEXT PRIMARY KEY,
      bag_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      control_type TEXT NOT NULL CHECK(control_type IN ('quick', 'departure', 'return')),
      deployment_location TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des résultats de contrôle
  db.exec(`
    CREATE TABLE IF NOT EXISTS control_results (
      id TEXT PRIMARY KEY,
      control_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('present', 'missing', 'damaged')),
      actual_quantity INTEGER,
      FOREIGN KEY (control_id) REFERENCES control_history(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES bag_items(id)
    )
  `);

  // Table des logs système
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des rapports de bugs
  db.exec(`
    CREATE TABLE IF NOT EXISTS bug_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'ouvert' CHECK(status IN ('ouvert', 'en cours', 'résolu')),
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des catégories de pharmacie
  db.exec(`
    CREATE TABLE IF NOT EXISTS pharmacy_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ Base de données initialisée avec succès');
}

// Exporter l'instance de la base de données
export default db;
