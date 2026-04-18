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

  // Table des utilisateurs (sans email)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  // Si la table existait déjà avec une colonne email, la supprimer proprement
  const userColumns = db.prepare(`PRAGMA table_info(users)`).all();
  const hasEmailColumn = userColumns.some(col => col.name === 'email');
  if (hasEmailColumn) {
    console.log('🧹 Migration des utilisateurs : suppression du champ email');
    db.transaction(() => {
      // Désactiver temporairement les clés étrangères le temps de recréer la table
      db.pragma('foreign_keys = OFF');

      db.exec(`
        CREATE TABLE IF NOT EXISTS users_new (
          id TEXT PRIMARY KEY,
          nom TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
          date_creation TEXT DEFAULT (datetime('now')),
          password_reset_requested INTEGER DEFAULT 0,
          password_reset_date TEXT
        )
      `);

      db.exec(`
        INSERT INTO users_new (id, nom, password, role, date_creation, password_reset_requested, password_reset_date)
        SELECT id, nom, password, role, date_creation, password_reset_requested, password_reset_date
        FROM users;
      `);

      db.exec(`DROP TABLE users;`);
      db.exec(`ALTER TABLE users_new RENAME TO users;`);

      db.pragma('foreign_keys = ON');
    })();
  }

  // Ajouter les colonnes de réinitialisation de mot de passe si elles n'existent pas
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_requested INTEGER DEFAULT 0`);
  } catch {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_date TEXT`);
  } catch {}

  // Créer un utilisateur factice pour les utilisateurs supprimés
  try {
    const insertDeletedUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, nom, password, role, date_creation)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertDeletedUser.run(
      'deleted-user',
      'Utilisateur supprimé',
      'deleted-password',
      'user',
      new Date().toISOString()
    );
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'utilisateur supprimé :', error);
  }

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
  const existingOperationalEquipment = db.prepare(`
    SELECT sql FROM sqlite_master WHERE type='table' AND name='operational_equipment'
  `).get();

  if (existingOperationalEquipment && !existingOperationalEquipment.sql.includes("CHECK(status IN ('ok', 'defective', 'missing'))")) {
    console.log('🔧 Migration de la table operational_equipment : mise à jour du CHECK(status)');
    db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS operational_equipment_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          qr_code TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          status TEXT CHECK(status IN ('ok', 'defective', 'missing')),
          control_date TEXT,
          peremption_date TEXT,
          date_creation TEXT DEFAULT (datetime('now'))
        )
      `);

      db.exec(`
        INSERT INTO operational_equipment_new (id, name, qr_code, type, category, status, control_date, peremption_date, date_creation)
        SELECT id, name, qr_code, type, category,
          CASE
            WHEN status = 'warning' THEN 'defective'
            WHEN status = 'critical' THEN 'missing'
            ELSE status
          END,
          control_date,
          peremption_date,
          date_creation
        FROM operational_equipment;
      `);

      db.exec('DROP TABLE operational_equipment;');
      db.exec('ALTER TABLE operational_equipment_new RENAME TO operational_equipment;');
    })();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS operational_equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT CHECK(status IN ('ok', 'defective', 'missing')),
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
      notes TEXT,
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
      item_name TEXT,
      pocket_name TEXT,
      notes TEXT,
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
      page TEXT,
      description TEXT NOT NULL,
      user_agent TEXT,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in-progress', 'resolved')),
      resolved_at TEXT,
      resolved_by TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Migrations de schéma SQLite existant
  try {
    db.exec('ALTER TABLE bug_reports ADD COLUMN page TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE bug_reports ADD COLUMN user_agent TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE bug_reports ADD COLUMN resolved_at TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE bug_reports ADD COLUMN resolved_by TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE control_history ADD COLUMN notes TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE control_results ADD COLUMN item_name TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE control_results ADD COLUMN pocket_name TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }
  try {
    db.exec('ALTER TABLE control_results ADD COLUMN notes TEXT');
  } catch (error) {
    // ignore si la colonne existe déjà
  }

  // Table des rapports d'inspection
  db.exec(`
    CREATE TABLE IF NOT EXISTS inspection_reports (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      inspector TEXT NOT NULL,
      category TEXT NOT NULL,
      signature TEXT,
      conclusion TEXT,
      products_json TEXT NOT NULL
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

  // Table des catégories personnalisées (avec liste d'articles)
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      main_category TEXT NOT NULL,
      category_name TEXT NOT NULL,
      sub_category TEXT,
      barcode TEXT UNIQUE NOT NULL,
      items TEXT,
      date_creation TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ Base de données initialisée avec succès');
}

// Exporter l'instance de la base de données
export default db;
