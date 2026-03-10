import db from './database.js';

/**
 * Script de migration des données du localStorage vers SQLite
 * Ce script permet de migrer les données existantes
 */

export function migrateFromLocalStorage(data) {
  console.log('🔄 Migration des données depuis localStorage...');

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, nom, email, password, role, date_creation)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertBag = db.prepare(`
    INSERT OR REPLACE INTO bags (id, nom, qr_code, description, last_control_date, status, deployment_status, deployment_location, deployment_date, date_creation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPocket = db.prepare(`
    INSERT OR REPLACE INTO pockets (id, bag_id, name, color, ordre_affichage)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertBagItem = db.prepare(`
    INSERT OR REPLACE INTO bag_items (id, pocket_id, name, expected_quantity, check_type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertPharmacyProduct = db.prepare(`
    INSERT OR REPLACE INTO pharmacy_products (id, nom_produit, code_barre, categorie, quantity, peremption_date, control_date, lot_number, date_creation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOperationalEquipment = db.prepare(`
    INSERT OR REPLACE INTO operational_equipment (id, name, qr_code, type, category, status, control_date, peremption_date, date_creation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertControlHistory = db.prepare(`
    INSERT OR REPLACE INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertControlResult = db.prepare(`
    INSERT OR REPLACE INTO control_results (id, control_id, item_id, status, actual_quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT OR REPLACE INTO system_logs (id, timestamp, user_id, action, details)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertBugReport = db.prepare(`
    INSERT OR REPLACE INTO bug_reports (id, user_id, category, description, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO pharmacy_categories (id, name, color, date_creation)
    VALUES (?, ?, ?, ?)
  `);

  // Transaction pour assurer la cohérence
  const migrate = db.transaction(() => {
    // Migrer les utilisateurs
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        insertUser.run(
          user.id,
          user.name,
          user.email,
          user.password,
          user.role,
          user.createdAt || new Date().toISOString()
        );
      }
      console.log(`✅ ${data.users.length} utilisateurs migrés`);
    }

    // Migrer les sacs
    if (data.bags && Array.isArray(data.bags)) {
      for (const bag of data.bags) {
        insertBag.run(
          bag.id,
          bag.name,
          bag.qrCode,
          bag.description || null,
          bag.lastControlDate || null,
          bag.status || null,
          bag.deploymentStatus || null,
          bag.deploymentLocation || null,
          bag.deploymentDate || null,
          new Date().toISOString()
        );

        // Migrer les poches du sac
        if (bag.pockets && Array.isArray(bag.pockets)) {
          for (let i = 0; i < bag.pockets.length; i++) {
            const pocket = bag.pockets[i];
            insertPocket.run(
              pocket.id,
              bag.id,
              pocket.name,
              pocket.color || null,
              i
            );

            // Migrer les items de la poche
            if (pocket.items && Array.isArray(pocket.items)) {
              for (const item of pocket.items) {
                insertBagItem.run(
                  item.id,
                  pocket.id,
                  item.name,
                  item.expectedQuantity,
                  item.checkType
                );
              }
            }
          }
        }
      }
      console.log(`✅ ${data.bags.length} sacs migrés`);
    }

    // Migrer les produits de pharmacie
    if (data.pharmacyProducts && Array.isArray(data.pharmacyProducts)) {
      for (const product of data.pharmacyProducts) {
        insertPharmacyProduct.run(
          product.id,
          product.name,
          product.barcode,
          product.category,
          product.quantity || 0,
          product.expiryDate || null,
          product.controlDate || null,
          product.lotNumber || null,
          new Date().toISOString()
        );
      }
      console.log(`✅ ${data.pharmacyProducts.length} produits pharmacie migrés`);
    }

    // Migrer le matériel opérationnel
    if (data.operationalEquipment && Array.isArray(data.operationalEquipment)) {
      for (const equipment of data.operationalEquipment) {
        insertOperationalEquipment.run(
          equipment.id,
          equipment.name,
          equipment.qrCode,
          equipment.type,
          equipment.category,
          equipment.status || null,
          equipment.controlDate || null,
          equipment.expiryDate || null,
          new Date().toISOString()
        );
      }
      console.log(`✅ ${data.operationalEquipment.length} équipements opérationnels migrés`);
    }

    // Migrer l'historique des contrôles
    if (data.controlHistories && Array.isArray(data.controlHistories)) {
      for (const history of data.controlHistories) {
        insertControlHistory.run(
          history.id,
          history.bagId,
          history.userId,
          history.controlType,
          history.deploymentLocation || null,
          history.timestamp
        );

        // Migrer les résultats du contrôle
        if (history.results && Array.isArray(history.results)) {
          for (const result of history.results) {
            insertControlResult.run(
              `${history.id}-${result.itemId}`,
              history.id,
              result.itemId,
              result.status || null,
              result.actualQuantity !== undefined ? result.actualQuantity : null
            );
          }
        }
      }
      console.log(`✅ ${data.controlHistories.length} historiques de contrôle migrés`);
    }

    // Migrer les logs
    if (data.logs && Array.isArray(data.logs)) {
      for (const log of data.logs) {
        insertLog.run(
          log.id,
          log.timestamp,
          log.userId || null,
          log.action,
          log.details || null
        );
      }
      console.log(`✅ ${data.logs.length} logs migrés`);
    }

    // Migrer les rapports de bugs
    if (data.bugReports && Array.isArray(data.bugReports)) {
      for (const report of data.bugReports) {
        insertBugReport.run(
          report.id,
          report.userId,
          report.category,
          report.description,
          report.status || 'ouvert',
          report.timestamp
        );
      }
      console.log(`✅ ${data.bugReports.length} rapports de bugs migrés`);
    }

    // Migrer les catégories de pharmacie
    if (data.categories && Array.isArray(data.categories)) {
      for (const category of data.categories) {
        insertCategory.run(
          category.id,
          category.name,
          category.color || null,
          new Date().toISOString()
        );
      }
      console.log(`✅ ${data.categories.length} catégories migrées`);
    }
  });

  migrate();
  console.log('✅ Migration terminée avec succès !');
}

export default migrateFromLocalStorage;
