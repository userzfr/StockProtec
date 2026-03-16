import pkg from 'pg';
const { Client } = pkg;

// Configuration de la base de données PostgreSQL
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'stockprotec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Fonction pour initialiser la base de données
export async function initializeDatabase() {
  console.log('🔧 Initialisation de la base de données PostgreSQL...');

  try {
    await client.connect();

    // Table des utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des sacs opérationnels
    await client.query(`
      CREATE TABLE IF NOT EXISTS bags (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        qr_code TEXT UNIQUE NOT NULL,
        description TEXT,
        last_control_date TIMESTAMP,
        status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
        deployment_status TEXT CHECK(deployment_status IN ('present', 'deployed')),
        deployment_location TEXT,
        deployment_date TIMESTAMP,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des poches
    await client.query(`
      CREATE TABLE IF NOT EXISTS pockets (
        id TEXT PRIMARY KEY,
        bag_id TEXT REFERENCES bags(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT,
        ordre_affichage INTEGER
      )
    `);

    // Table des éléments de sac
    await client.query(`
      CREATE TABLE IF NOT EXISTS bag_items (
        id TEXT PRIMARY KEY,
        pocket_id TEXT REFERENCES pockets(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        expected_quantity INTEGER DEFAULT 1,
        check_type TEXT DEFAULT 'presence'
      )
    `);

    // Table des produits de pharmacie
    await client.query(`
      CREATE TABLE IF NOT EXISTS pharmacy_products (
        id TEXT PRIMARY KEY,
        nom_produit TEXT NOT NULL,
        code_barre TEXT UNIQUE,
        categorie TEXT,
        quantity INTEGER DEFAULT 0,
        peremption_date DATE,
        control_date TIMESTAMP,
        lot_number TEXT,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des équipements opérationnels
    await client.query(`
      CREATE TABLE IF NOT EXISTS operational_equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        qr_code TEXT UNIQUE,
        type TEXT,
        category TEXT,
        status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
        control_date TIMESTAMP,
        peremption_date DATE,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table de l'historique des contrôles
    await client.query(`
      CREATE TABLE IF NOT EXISTS control_history (
        id TEXT PRIMARY KEY,
        bag_id TEXT REFERENCES bags(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        control_type TEXT,
        deployment_location TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des résultats de contrôle
    await client.query(`
      CREATE TABLE IF NOT EXISTS control_results (
        id TEXT PRIMARY KEY,
        control_id TEXT REFERENCES control_history(id) ON DELETE CASCADE,
        item_id TEXT,
        status TEXT,
        actual_quantity INTEGER
      )
    `);

    // Table des logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Base de données PostgreSQL initialisée.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  }
}

export default client;