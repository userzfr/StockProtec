import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initializeDatabase } from './database.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser la base de données au démarrage
initializeDatabase();
seedDatabase();

// ===============================
// ROUTES UTILISATEURS
// ===============================

// Récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, nom, role, date_creation, password_reset_requested, password_reset_date FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login avec username et password
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    const user = db.prepare('SELECT id, nom, role, password, date_creation, password_reset_requested, password_reset_date FROM users WHERE nom = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un utilisateur
app.post('/api/users', (req, res) => {
  try {
    const { id, nom, password, role } = req.body;
    const stmt = db.prepare(`
      INSERT INTO users (id, nom, password, role, password_reset_requested, password_reset_date)
      VALUES (?, ?, ?, ?, 0, NULL)
    `);
    stmt.run(id, nom, password, role);
    res.status(201).json({ id, nom, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur
app.put('/api/users/:id', (req, res) => {
  try {
    const { nom, password, role, passwordResetRequested, passwordResetDate } = req.body;
    const passwordResetFlag = passwordResetRequested ? 1 : 0;
    const resetDateValue = passwordResetDate || null;

    if (!password) {
      const stmt = db.prepare(`
        UPDATE users
        SET nom = ?, role = ?, password_reset_requested = ?, password_reset_date = ?
        WHERE id = ?
      `);
      stmt.run(nom, role, passwordResetFlag, resetDateValue, req.params.id);
    } else {
      const stmt = db.prepare(`
        UPDATE users
        SET nom = ?, password = ?, role = ?, password_reset_requested = ?, password_reset_date = ?
        WHERE id = ?
      `);
      stmt.run(nom, password, role, passwordResetFlag, resetDateValue, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES SACS
// ===============================

// Récupérer tous les sacs avec leurs poches et items
app.get('/api/bags', (req, res) => {
  try {
    const bags = db.prepare('SELECT * FROM bags').all();
    
    // Pour chaque sac, récupérer ses poches et items
    const bagsWithPockets = bags.map(bag => {
      const pockets = db.prepare('SELECT * FROM pockets WHERE bag_id = ? ORDER BY ordre_affichage').all(bag.id);
      
      const pocketsWithItems = pockets.map(pocket => {
        const items = db.prepare('SELECT * FROM bag_items WHERE pocket_id = ?').all(pocket.id);
        return {
          id: pocket.id,
          name: pocket.name,
          color: pocket.color,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            expectedQuantity: item.expected_quantity,
            checkType: item.check_type
          }))
        };
      });

      return {
        id: bag.id,
        name: bag.nom,
        qrCode: bag.qr_code,
        description: bag.description,
        lastControlDate: bag.last_control_date,
        status: bag.status,
        deploymentStatus: bag.deployment_status,
        deploymentLocation: bag.deployment_location,
        deploymentDate: bag.deployment_date,
        pockets: pocketsWithItems
      };
    });

    res.json(bagsWithPockets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un sac par QR code
app.get('/api/bags/qr/:qrCode', (req, res) => {
  try {
    const bag = db.prepare('SELECT * FROM bags WHERE qr_code = ?').get(req.params.qrCode);
    
    if (!bag) {
      return res.status(404).json({ error: 'Sac non trouvé' });
    }

    const pockets = db.prepare('SELECT * FROM pockets WHERE bag_id = ? ORDER BY ordre_affichage').all(bag.id);
    
    const pocketsWithItems = pockets.map(pocket => {
      const items = db.prepare('SELECT * FROM bag_items WHERE pocket_id = ?').all(pocket.id);
      return {
        id: pocket.id,
        name: pocket.name,
        color: pocket.color,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          expectedQuantity: item.expected_quantity,
          checkType: item.check_type
        }))
      };
    });

    res.json({
      id: bag.id,
      name: bag.nom,
      qrCode: bag.qr_code,
      description: bag.description,
      lastControlDate: bag.last_control_date,
      status: bag.status,
      deploymentStatus: bag.deployment_status,
      deploymentLocation: bag.deployment_location,
      deploymentDate: bag.deployment_date,
      pockets: pocketsWithItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un sac
app.post('/api/bags', (req, res) => {
  try {
    const { id, name, qrCode, description, pockets } = req.body;
    
    db.transaction(() => {
      // Créer le sac
      const insertBag = db.prepare(`
        INSERT INTO bags (id, nom, qr_code, description)
        VALUES (?, ?, ?, ?)
      `);
      insertBag.run(id, name, qrCode, description);

      // Créer les poches
      if (pockets && pockets.length > 0) {
        const insertPocket = db.prepare(`
          INSERT INTO pockets (id, bag_id, name, color, ordre_affichage)
          VALUES (?, ?, ?, ?, ?)
        `);
        const insertItem = db.prepare(`
          INSERT INTO bag_items (id, pocket_id, name, expected_quantity, check_type)
          VALUES (?, ?, ?, ?, ?)
        `);

        pockets.forEach((pocket, index) => {
          insertPocket.run(pocket.id, id, pocket.name, pocket.color, index);
          
          // Créer les items de la poche
          if (pocket.items && pocket.items.length > 0) {
            pocket.items.forEach(item => {
              insertItem.run(item.id, pocket.id, item.name, item.expectedQuantity, item.checkType);
            });
          }
        });
      }
    })();

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un sac
app.put('/api/bags/:id', (req, res) => {
  try {
    const { name, description, status, deploymentStatus, deploymentLocation, deploymentDate, lastControlDate, pockets } = req.body;
    
    db.transaction(() => {
      // Mettre à jour le sac
      const updateBag = db.prepare(`
        UPDATE bags 
        SET nom = ?, description = ?, status = ?, deployment_status = ?, 
            deployment_location = ?, deployment_date = ?, last_control_date = ?
        WHERE id = ?
      `);
      updateBag.run(name, description, status, deploymentStatus, deploymentLocation, deploymentDate, lastControlDate, req.params.id);

      // Si des poches sont fournies, les mettre à jour
      if (pockets) {
        const bagId = req.params.id;
        // Supprimer les anciennes valeurs de contrôle liées aux anciens items pour éviter les violations FK
        db.prepare(`
          DELETE FROM control_results
          WHERE item_id IN (
            SELECT bi.id
            FROM bag_items bi
            JOIN pockets p ON bi.pocket_id = p.id
            WHERE p.bag_id = ?
          )
        `).run(bagId);

        // Supprimer les anciens items et poches
        db.prepare(`
          DELETE FROM bag_items
          WHERE pocket_id IN (
            SELECT id FROM pockets WHERE bag_id = ?
          )
        `).run(bagId);
        db.prepare('DELETE FROM pockets WHERE bag_id = ?').run(bagId);

        // Recréer les poches
        const insertPocket = db.prepare(`
          INSERT INTO pockets (id, bag_id, name, color, ordre_affichage)
          VALUES (?, ?, ?, ?, ?)
        `);
        const insertItem = db.prepare(`
          INSERT INTO bag_items (id, pocket_id, name, expected_quantity, check_type)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (let index = 0; index < pockets.length; index++) {
          const pocket = pockets[index];
          insertPocket.run(pocket.id, bagId, pocket.name, pocket.color, index);

          if (pocket.items && pocket.items.length > 0) {
            for (const item of pocket.items) {
              insertItem.run(item.id, pocket.id, item.name, item.expectedQuantity, item.checkType);
            }
          }
        }
      }
    })();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un sac
app.delete('/api/bags/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM bags WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES PRODUITS PHARMACIE
// ===============================

// Récupérer tous les produits de pharmacie
app.get('/api/pharmacy-products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM pharmacy_products').all();
    const formatted = products.map(p => ({
      id: p.id,
      name: p.nom_produit,
      barcode: p.code_barre,
      category: p.categorie,
      quantity: p.quantity,
      expiryDate: p.peremption_date,
      controlDate: p.control_date,
      lotNumber: p.lot_number
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit de pharmacie
app.post('/api/pharmacy-products', (req, res) => {
  try {
    const { id, name, barcode, category, quantity, expiryDate, controlDate, lotNumber } = req.body;
    const stmt = db.prepare(`
      INSERT INTO pharmacy_products (id, nom_produit, code_barre, categorie, quantity, peremption_date, control_date, lot_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, barcode, category, quantity || 0, expiryDate, controlDate, lotNumber);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit de pharmacie
app.put('/api/pharmacy-products/:id', (req, res) => {
  try {
    const { name, barcode, category, quantity, expiryDate, controlDate, lotNumber } = req.body;
    const stmt = db.prepare(`
      UPDATE pharmacy_products 
      SET nom_produit = ?, code_barre = ?, categorie = ?, quantity = ?, peremption_date = ?, control_date = ?, lot_number = ?
      WHERE id = ?
    `);
    stmt.run(name, barcode, category, quantity, expiryDate, controlDate, lotNumber, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit de pharmacie
app.delete('/api/pharmacy-products/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM pharmacy_products WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES MATÉRIEL OPÉRATIONNEL
// ===============================

// Récupérer tout le matériel opérationnel
app.get('/api/operational-equipment', (req, res) => {
  try {
    const equipment = db.prepare('SELECT * FROM operational_equipment').all();
    const formatted = equipment.map(e => ({
      id: e.id,
      name: e.name,
      qrCode: e.qr_code,
      barcode: e.qr_code,
      type: e.type,
      category: e.category,
      status: e.status,
      controlDate: e.control_date,
      lastControlDate: e.control_date,
      expiryDate: e.peremption_date
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un équipement opérationnel
app.post('/api/operational-equipment', (req, res) => {
  try {
    const { id, name, qrCode, barcode, type, category, status, controlDate, expiryDate } = req.body;
    const resolvedQrCode = qrCode ?? barcode;
    if (!resolvedQrCode) {
      return res.status(400).json({ error: 'qrCode or barcode is requis' });
    }
    const resolvedCategory = category ?? 'AUTRE';
    const stmt = db.prepare(`
      INSERT INTO operational_equipment (id, name, qr_code, type, category, status, control_date, peremption_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, resolvedQrCode, type, resolvedCategory, status, controlDate, expiryDate);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un équipement opérationnel
app.put('/api/operational-equipment/:id', (req, res) => {
  try {
    const { name, qrCode, barcode, type, category, status, controlDate, expiryDate } = req.body;
    const resolvedQrCode = qrCode ?? barcode;
    if (!resolvedQrCode) {
      return res.status(400).json({ error: 'qrCode or barcode is requis' });
    }
    const resolvedCategory = category ?? 'AUTRE';
    const stmt = db.prepare(`
      UPDATE operational_equipment
      SET name = ?, qr_code = ?, type = ?, category = ?, status = ?, control_date = ?, peremption_date = ?
      WHERE id = ?
    `);
    stmt.run(name, resolvedQrCode, type, resolvedCategory, status, controlDate, expiryDate, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un équipement opérationnel
app.delete('/api/operational-equipment/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM operational_equipment WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES HISTORIQUE DE CONTRÔLE
// ===============================

// Récupérer tous les historiques de contrôle
app.get('/api/control-history', (req, res) => {
  try {
    const histories = db.prepare('SELECT * FROM control_history ORDER BY timestamp DESC').all();
    
    const formatted = histories.map(h => {
      const results = db.prepare('SELECT * FROM control_results WHERE control_id = ?').all(h.id);
      
      return {
        id: h.id,
        bagId: h.bag_id,
        userId: h.user_id,
        controlType: h.control_type,
        deploymentLocation: h.deployment_location,
        timestamp: h.timestamp,
        results: results.map(r => ({
          itemId: r.item_id,
          status: r.status,
          actualQuantity: r.actual_quantity
        }))
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique pour un sac spécifique
app.get('/api/control-history/bag/:bagId', (req, res) => {
  try {
    const histories = db.prepare('SELECT * FROM control_history WHERE bag_id = ? ORDER BY timestamp DESC').all(req.params.bagId);
    
    const formatted = histories.map(h => {
      const results = db.prepare('SELECT * FROM control_results WHERE control_id = ?').all(h.id);
      
      return {
        id: h.id,
        bagId: h.bag_id,
        userId: h.user_id,
        controlType: h.control_type,
        deploymentLocation: h.deployment_location,
        timestamp: h.timestamp,
        results: results.map(r => ({
          itemId: r.item_id,
          status: r.status,
          actualQuantity: r.actual_quantity
        }))
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un contrôle
app.post('/api/control-history', (req, res) => {
  try {
    const { id, bagId, userId, controlType, deploymentLocation, timestamp, results } = req.body;

    if (!id || !bagId || !userId || !controlType) {
      return res.status(400).json({ error: 'id, bagId, userId, controlType requis' });
    }

    const bagExists = db.prepare('SELECT 1 FROM bags WHERE id = ?').get(bagId);
    if (!bagExists) {
      return res.status(400).json({ error: `bagId ${bagId} introuvable` });
    }

    const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId);
    if (!userExists) {
      return res.status(400).json({ error: `userId ${userId} introuvable` });
    }

    if (results && results.length > 0) {
      const invalidItem = results.find((result) => {
        const itemExists = db.prepare('SELECT 1 FROM bag_items WHERE id = ?').get(result.itemId);
        return !itemExists;
      });
      if (invalidItem) {
        return res.status(400).json({ error: `itemId ${invalidItem.itemId} introuvable` });
      }
    }

    db.transaction(() => {
      const insertHistory = db.prepare(`
        INSERT INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertHistory.run(id, bagId, userId, controlType, deploymentLocation, timestamp);

      if (results && results.length > 0) {
        const insertResult = db.prepare(`
          INSERT INTO control_results (id, control_id, item_id, status, actual_quantity)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        results.forEach(result => {
          insertResult.run(
            `${id}-${result.itemId}`,
            id,
            result.itemId,
            result.status || null,
            result.actualQuantity !== undefined ? result.actualQuantity : null
          );
        });
      }
    })();

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('control-history insertion error', error);
    res.status(500).json({ error: 'Erreur lors de la création du contrôle (' + error.message + ')' });
  }
});

// ===============================
// ROUTES LOGS
// ===============================

// Récupérer tous les logs
app.get('/api/logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM system_logs ORDER BY timestamp DESC').all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un log
app.post('/api/logs', (req, res) => {
  try {
    const { id, userId, action, details, timestamp } = req.body;
    const stmt = db.prepare(`
      INSERT INTO system_logs (id, user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, action, details, timestamp);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer tous les logs
app.delete('/api/logs', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM system_logs');
    stmt.run();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES RAPPORTS DE BUGS
// ===============================

// Récupérer tous les rapports de bugs
app.get('/api/bug-reports', (req, res) => {
  try {
    const reports = db.prepare('SELECT * FROM bug_reports ORDER BY timestamp DESC').all();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un rapport de bug
app.post('/api/bug-reports', (req, res) => {
  try {
    const { id, userId, category, description, status, timestamp } = req.body;
    const stmt = db.prepare(`
      INSERT INTO bug_reports (id, user_id, category, description, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, category, description, status || 'ouvert', timestamp);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le statut d'un rapport de bug
app.put('/api/bug-reports/:id', (req, res) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE bug_reports SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES RAPPORTS D'INSPECTION
// ===============================

// Récupérer tous les rapports d'inspection
app.get('/api/inspection-reports', (req, res) => {
  try {
    const reports = db.prepare('SELECT * FROM inspection_reports ORDER BY timestamp DESC').all();
    const formatted = reports.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      inspector: r.inspector,
      category: r.category,
      signature: r.signature,
      conclusion: r.conclusion,
      products: JSON.parse(r.products_json || '[]'),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un rapport d'inspection
app.post('/api/inspection-reports', (req, res) => {
  try {
    const { id, timestamp, inspector, category, signature, conclusion, products } = req.body;
    const stmt = db.prepare(`
      INSERT INTO inspection_reports (id, timestamp, inspector, category, signature, conclusion, products_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, timestamp, inspector, category, signature, conclusion, JSON.stringify(products || []));
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES CATÉGORIES PERSONNALISÉES
// ===============================

// Récupérer toutes les catégories personnalisées
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM custom_categories').all();
    const formatted = categories.map(c => ({
      id: c.id,
      mainCategory: c.main_category,
      categoryName: c.category_name,
      subCategory: c.sub_category || undefined,
      barcode: c.barcode,
      items: c.items ? JSON.parse(c.items) : [],
      createdAt: c.date_creation,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une catégorie personnalisée
app.post('/api/categories', (req, res) => {
  try {
    const { id, mainCategory, categoryName, subCategory, barcode, items } = req.body;
    const stmt = db.prepare(`
      INSERT INTO custom_categories (id, main_category, category_name, sub_category, barcode, items)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, mainCategory, categoryName, subCategory || null, barcode, JSON.stringify(items || []));
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une catégorie personnalisée
app.delete('/api/categories/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM custom_categories WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTE DE SANTÉ
// ===============================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API StockProtec fonctionne correctement' });
});

// Serve static files (frontend build)
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📊 Base de données : stockprotec.db`);
});
