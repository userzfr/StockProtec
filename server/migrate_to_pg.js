import Database from 'better-sqlite3';
import pkg from 'pg';
const { Client } = pkg;
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connexion à SQLite
const sqliteDbPath = join(__dirname, '..', 'stockprotec.db');
const sqliteDb = new Database(sqliteDbPath);

// Connexion à PostgreSQL
const pgClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'stockprotec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function migrateData() {
  console.log('🔄 Migration des données de SQLite vers PostgreSQL...');

  try {
    await pgClient.connect();

    // Migrer les utilisateurs
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await pgClient.query(
        'INSERT INTO users (id, nom, email, password, role, date_creation) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [user.id, user.nom, user.email, user.password, user.role, user.date_creation]
      );
    }
    console.log(`✅ Migré ${users.length} utilisateurs.`);

    // Migrer les sacs
    const bags = sqliteDb.prepare('SELECT * FROM bags').all();
    for (const bag of bags) {
      await pgClient.query(
        'INSERT INTO bags (id, nom, qr_code, description, last_control_date, status, deployment_status, deployment_location, deployment_date, date_creation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
        [bag.id, bag.nom, bag.qr_code, bag.description, bag.last_control_date, bag.status, bag.deployment_status, bag.deployment_location, bag.deployment_date, bag.date_creation]
      );
    }
    console.log(`✅ Migré ${bags.length} sacs.`);

    // Migrer les poches
    const pockets = sqliteDb.prepare('SELECT * FROM pockets').all();
    for (const pocket of pockets) {
      await pgClient.query(
        'INSERT INTO pockets (id, bag_id, name, color, ordre_affichage) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [pocket.id, pocket.bag_id, pocket.name, pocket.color, pocket.ordre_affichage]
      );
    }
    console.log(`✅ Migré ${pockets.length} poches.`);

    // Migrer les éléments de sac
    const bagItems = sqliteDb.prepare('SELECT * FROM bag_items').all();
    for (const item of bagItems) {
      await pgClient.query(
        'INSERT INTO bag_items (id, pocket_id, name, expected_quantity, check_type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [item.id, item.pocket_id, item.name, item.expected_quantity, item.check_type]
      );
    }
    console.log(`✅ Migré ${bagItems.length} éléments de sac.`);

    // Migrer les produits de pharmacie
    const pharmacyProducts = sqliteDb.prepare('SELECT * FROM pharmacy_products').all();
    for (const product of pharmacyProducts) {
      await pgClient.query(
        'INSERT INTO pharmacy_products (id, nom_produit, code_barre, categorie, quantity, peremption_date, control_date, lot_number, date_creation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [product.id, product.nom_produit, product.code_barre, product.categorie, product.quantity, product.peremption_date, product.control_date, product.lot_number, product.date_creation]
      );
    }
    console.log(`✅ Migré ${pharmacyProducts.length} produits de pharmacie.`);

    // Migrer les équipements opérationnels
    const operationalEquipment = sqliteDb.prepare('SELECT * FROM operational_equipment').all();
    for (const equipment of operationalEquipment) {
      await pgClient.query(
        'INSERT INTO operational_equipment (id, name, qr_code, type, category, status, control_date, peremption_date, date_creation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [equipment.id, equipment.name, equipment.qr_code, equipment.type, equipment.category, equipment.status, equipment.control_date, equipment.peremption_date, equipment.date_creation]
      );
    }
    console.log(`✅ Migré ${operationalEquipment.length} équipements opérationnels.`);

    // Migrer l'historique des contrôles
    const controlHistory = sqliteDb.prepare('SELECT * FROM control_history').all();
    for (const control of controlHistory) {
      await pgClient.query(
        'INSERT INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [control.id, control.bag_id, control.user_id, control.control_type, control.deployment_location, control.timestamp]
      );
    }
    console.log(`✅ Migré ${controlHistory.length} contrôles.`);

    // Migrer les résultats de contrôle
    const controlResults = sqliteDb.prepare('SELECT * FROM control_results').all();
    for (const result of controlResults) {
      await pgClient.query(
        'INSERT INTO control_results (id, control_id, item_id, status, actual_quantity) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [result.id, result.control_id, result.item_id, result.status, result.actual_quantity]
      );
    }
    console.log(`✅ Migré ${controlResults.length} résultats de contrôle.`);

    // Migrer les logs
    const logs = sqliteDb.prepare('SELECT * FROM system_logs').all();
    for (const log of logs) {
      await pgClient.query(
        'INSERT INTO logs (user_id, action, details, timestamp) VALUES ($1, $2, $3, $4)',
        [log.user_id, log.action, log.details, log.timestamp]
      );
    }
    console.log(`✅ Migré ${logs.length} logs.`);

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await pgClient.end();
    sqliteDb.close();
  }
}

// Exécuter la migration
migrateData();