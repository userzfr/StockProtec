import db from './database.js';
import { initializeDatabase } from './database.js';
import { hashPassword } from './password.js';

/**
 * Script pour remplir la base de données avec des données d'exemple
 * Utilisé pour les tests et la démonstration
 */

export function seedDatabase() {
  console.log('Ajout de donnees d\'exemple...');

  // Vérifier si des utilisateurs existent déjà
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (existingUsers.count > 0) {
    console.log('⚠️  Des données existent déjà dans la base de données.');
    console.log('   Ignoré pour éviter les doublons.');
    return;
  }

  // Utiliser une transaction pour insérer toutes les données
  const seed = db.transaction(() => {
    // 1. Créer des utilisateurs
    const insertUser = db.prepare(`
      INSERT INTO users (id, nom, password, role, date_creation)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'admin-001',
      'admin',
      hashPassword('admin123'),
      'admin',
      new Date().toISOString()
    );

    insertUser.run(
      'user-001',
      'user',
      hashPassword('user123'),
      'user',
      new Date().toISOString()
    );

    console.log('✅ 2 utilisateurs créés');

    // 2. Créer des sacs de secours
    const insertBag = db.prepare(`
      INSERT INTO bags (id, nom, qr_code, description, last_control_date, status, deployment_status, date_creation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBag.run(
      'bag-001',
      'Sac PSE1',
      'QR-PSE1-001',
      'Sac de premiers secours équipe 1',
      null,
      'ok',
      'present',
      new Date().toISOString()
    );

    insertBag.run(
      'bag-002',
      'Sac PSE2',
      'QR-PSE2-002',
      'Sac de premiers secours équipe 2',
      null,
      'ok',
      'present',
      new Date().toISOString()
    );

    console.log('✅ 2 sacs créés');

    // 3. Créer des poches pour le sac PSE1
    const insertPocket = db.prepare(`
      INSERT INTO pockets (id, bag_id, name, color, ordre_affichage)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertPocket.run('pocket-001', 'bag-001', 'Poche Rouge', '#ef4444', 0);
    insertPocket.run('pocket-002', 'bag-001', 'Poche Bleue', '#3b82f6', 1);
    insertPocket.run('pocket-003', 'bag-002', 'Poche Principale', '#10b981', 0);

    console.log('✅ 3 poches créées');

    // 4. Créer des items dans les poches
    const insertItem = db.prepare(`
      INSERT INTO bag_items (id, pocket_id, name, expected_quantity, check_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Items pour Poche Rouge (bag-001)
    insertItem.run('item-001', 'pocket-001', 'Pansements compressifs', 5, 'quantity');
    insertItem.run('item-002', 'pocket-001', 'Compresses stériles', 10, 'quantity');
    insertItem.run('item-003', 'pocket-001', 'Bande de gaze', 3, 'quantity');

    // Items pour Poche Bleue (bag-001)
    insertItem.run('item-004', 'pocket-002', 'Masque de poche', 1, 'button');
    insertItem.run('item-005', 'pocket-002', 'Gants stériles', 4, 'quantity');
    insertItem.run('item-006', 'pocket-002', 'Ciseaux de secours', 1, 'button');

    // Items pour Poche Principale (bag-002)
    insertItem.run('item-007', 'pocket-003', 'Défibrillateur', 1, 'button');
    insertItem.run('item-008', 'pocket-003', 'Électrodes adulte', 2, 'quantity');
    insertItem.run('item-009', 'pocket-003', 'Batterie de secours', 1, 'button');

    console.log('✅ 9 items créés');

    // 5. Créer des catégories de pharmacie
    const insertCategory = db.prepare(`
      INSERT INTO pharmacy_categories (id, name, color)
      VALUES (?, ?, ?)
    `);

    insertCategory.run('cat-001', 'Pansements', '#ef4444');
    insertCategory.run('cat-002', 'Désinfectants', '#3b82f6');
    insertCategory.run('cat-003', 'Matériel stérile', '#10b981');
    insertCategory.run('cat-004', 'Médicaments', '#f59e0b');

    console.log('✅ 4 catégories créées');

    // 6. Créer des produits de pharmacie
    const insertProduct = db.prepare(`
      INSERT INTO pharmacy_products (id, nom_produit, code_barre, categorie, quantity, peremption_date, lot_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(
      'prod-001',
      'Compresses stériles 10x10',
      'BAR-COMP-001',
      'Matériel stérile',
      50,
      '2026-12-31',
      'LOT-2024-001'
    );

    insertProduct.run(
      'prod-002',
      'Alcool 70°',
      'BAR-ALC-002',
      'Désinfectants',
      10,
      '2027-06-30',
      'LOT-2024-002'
    );

    insertProduct.run(
      'prod-003',
      'Pansements adhésifs',
      'BAR-PANS-003',
      'Pansements',
      100,
      '2026-03-15',
      'LOT-2024-003'
    );

    insertProduct.run(
      'prod-004',
      'Sérum physiologique',
      'BAR-SER-004',
      'Matériel stérile',
      30,
      '2025-12-31',
      'LOT-2024-004'
    );

    console.log('✅ 4 produits pharmacie créés');

    // 7. Créer du matériel opérationnel
    const insertEquipment = db.prepare(`
      INSERT INTO operational_equipment (id, name, qr_code, type, category, status, control_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertEquipment.run(
      'equip-001',
      'DSA Heartstart',
      'QR-DSA-001',
      'Défibrillateur',
      'Matériel médical',
      'ok',
      new Date().toISOString()
    );

    insertEquipment.run(
      'equip-002',
      'Aspirateur de mucosité',
      'QR-ASP-002',
      'Aspirateur',
      'Matériel médical',
      'ok',
      new Date().toISOString()
    );

    insertEquipment.run(
      'equip-003',
      'Bouteille O2 5L',
      'QR-O2-003',
      'Oxygène',
      'Matériel médical',
      'warning',
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // Il y a 90 jours
    );

    console.log('✅ 3 équipements créés');

    // 8. Créer un log système
    const insertLog = db.prepare(`
      INSERT INTO system_logs (id, user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertLog.run(
      'log-001',
      'admin-001',
      'Initialisation de la base de données',
      'Données d\'exemple ajoutées',
      new Date().toISOString()
    );

    console.log('✅ 1 log créé');
  });

  // Exécuter la transaction
  seed();

  console.log('✅ Base de données remplie avec des données d\'exemple !');
  console.log('');
  console.log('📋 Résumé :');
  console.log('  - 2 utilisateurs (admin/user)');
  console.log('  - 2 sacs de secours');
  console.log('  - 3 poches');
  console.log('  - 9 items');
  console.log('  - 4 catégories');
  console.log('  - 4 produits pharmacie');
  console.log('  - 3 équipements opérationnels');
  console.log('');
  console.log('🔐 Identifiants de connexion :');
  console.log('  Admin: admin / admin123');
  console.log('  User:  user / user123');
}

// Initialiser et remplir la base si ce script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
  seedDatabase();
  console.log('');
  console.log('✅ Terminé !');
  process.exit(0);
}
