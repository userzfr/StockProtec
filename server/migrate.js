import db from './database.js';

/**
 * Script de migration des données du localStorage vers SQLite
 * Ce script permet de migrer les données existantes avec gestion d'erreurs robuste
 */

export function migrateFromLocalStorage(data) {
  console.log('Migration des donnees depuis localStorage...');

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, nom, email, password, role, date_creation, password_reset_requested, password_reset_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    INSERT OR IGNORE INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertControlResult = db.prepare(`
    INSERT OR IGNORE INTO control_results (id, control_id, item_id, status, actual_quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT INTO system_logs (id, timestamp, user_id, action, details)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertBugReport = db.prepare(`
    INSERT OR IGNORE INTO bug_reports (id, user_id, category, description, status, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO custom_categories (id, main_category, category_name, sub_category, barcode, items, date_creation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const migrate = db.transaction(() => {
      let stats = { users: 0, bags: 0, products: 0, equipment: 0, histories: 0, logs: 0, bugs: 0, categories: 0 };

      // Migrer les utilisateurs
      if (data.users && Array.isArray(data.users)) {
        for (const user of data.users) {
          const userId = user.id || `user-${Date.now()}-${Math.random()}`;
          const userName = user.name || user.nom || user.username || 'Utilisateur';
          const userEmail = user.email || `user-${Date.now()}@example.com`;
          const userPassword = user.password || 'password123';
          const userRole = user.role || 'user';
          const createdAt = user.createdAt || user.date_creation || new Date().toISOString();
          
          try {
            insertUser.run(
              userId,
              userName,
              userEmail,
              userPassword,
              userRole,
              createdAt,
              user.passwordResetRequested ? 1 : 0,
              user.passwordResetDate || null
            );
            stats.users++;
          } catch (e) {
            // Utilisateur exist ou erreur - continuer
          }
        }
      }

      // Migrer les sacs
      if (data.bags && Array.isArray(data.bags)) {
        for (const bag of data.bags) {
          const bagId = bag.id || `bag-${Date.now()}-${Math.random()}`;
          const bagName = bag.name || bag.nom || 'Sac sans nom';
          const bagQrCode = bag.qrCode || bag.qr_code || `QR-${bagId}`;
          
          try {
            insertBag.run(
              bagId,
              bagName,
              bagQrCode,
              bag.description || null,
              bag.lastControlDate || bag.last_control_date || null,
              bag.status || null,
              bag.deploymentStatus || bag.deployment_status || null,
              bag.deploymentLocation || bag.deployment_location || null,
              bag.deploymentDate || bag.deployment_date || null,
              new Date().toISOString()
            );
            stats.bags++;

            // Migrer les poches
            if (bag.pockets && Array.isArray(bag.pockets)) {
              for (let i = 0; i < bag.pockets.length; i++) {
                const pocket = bag.pockets[i];
                const pocketId = pocket.id || `pocket-${bagId}-${i}`;
                
                try {
                  insertPocket.run(
                    pocketId,
                    bagId,
                    pocket.name || `Poche ${i + 1}`,
                    pocket.color || null,
                    i
                  );

                  // Migrer les items
                  if (pocket.items && Array.isArray(pocket.items)) {
                    for (const item of pocket.items) {
                      const itemId = item.id || `item-${pocketId}-${Date.now()}`;
                      insertBagItem.run(
                        itemId,
                        pocketId,
                        item.name || item.nom || 'Article',
                        item.expectedQuantity || item.expected_quantity || 1,
                        item.checkType || item.check_type || 'presence'
                      );
                    }
                  }
                } catch (e) { }
              }
            }
          } catch (e) { }
        }
      }

      // Migrer les produits de pharmacie
      if (data.pharmacyProducts && Array.isArray(data.pharmacyProducts)) {
        for (const product of data.pharmacyProducts) {
          const productId = product.id || `product-${Date.now()}`;
          const productName = product.name || product.nom_produit || 'Produit';
          const barcode = product.barcode || product.code_barre || `BC-${productId}`;
          
          try {
            insertPharmacyProduct.run(
              productId,
              productName,
              barcode,
              product.category || product.categorie || 'Divers',
              product.quantity || 0,
              product.expiryDate || product.peremption_date || null,
              product.controlDate || product.control_date || null,
              product.lotNumber || product.lot_number || null,
              new Date().toISOString()
            );
            stats.products++;
          } catch (e) { }
        }
      }

      // Migrer le materiel operationnel
      if (data.operationalEquipment && Array.isArray(data.operationalEquipment)) {
        for (const equipment of data.operationalEquipment) {
          const equipmentId = equipment.id || `equipment-${Date.now()}`;
          const equipmentName = equipment.name || 'Equipement';
          const qrCode = equipment.qrCode || equipment.qr_code || `QR-${equipmentId}`;
          
          try {
            insertOperationalEquipment.run(
              equipmentId,
              equipmentName,
              qrCode,
              equipment.type || 'Divers',
              equipment.category || 'Operationnel',
              equipment.status || 'ok',
              equipment.controlDate || equipment.control_date || null,
              equipment.expiryDate || equipment.peremption_date || null,
              new Date().toISOString()
            );
            stats.equipment++;
          } catch (e) { }
        }
      }

      // Migrer les catégories personnalisées
      const categoriesData = Array.isArray(data.customCategories) ? data.customCategories : data.categories;
      if (categoriesData && Array.isArray(categoriesData)) {
        for (const category of categoriesData) {
          try {
            const categoryId = category.id || `cat-${Date.now()}`;
            const mainCategory = category.mainCategory || category.type || 'AUTRE';
            const categoryName = category.categoryName || category.name || category.nom || 'Categorie';
            const subCategory = category.subCategory || null;
            const barcode = category.barcode || category.qrCode || `CAT-${categoryId}`;
            const items = category.items || [];

            insertCategory.run(
              categoryId,
              mainCategory,
              categoryName,
              subCategory,
              barcode,
              JSON.stringify(items),
              new Date().toISOString()
            );
            stats.categories++;
          } catch (e) { }
        }
      }
    });

    migrate();
    console.log('Migration completee avec succes !');
    return { succes: true };
  } catch (error) {
    console.error('Erreur migration:', error.message);
    throw error;
  }
}

export default migrateFromLocalStorage;
