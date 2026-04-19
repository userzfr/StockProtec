import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import db, { initializeDatabase } from './database.js';
import { seedDatabase } from './seed.js';
import { hashPassword, verifyPassword, isHashedPassword } from './password.js';
import { createBackup, listBackups, restoreBackup, deleteBackup, getBackupStats } from './backup.js';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());

const spaFallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(express.json());

// Initialiser la base de données au démarrage
initializeDatabase();
seedDatabase();

// Initialiser le système de sauvegarde automatique
console.log('🔄 Initialisation du système de sauvegarde automatique...');

// Sauvegarde hebdomadaire (tous les dimanches à 02h00)
const WEEKLY_BACKUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

function scheduleWeeklyBackup() {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay())); // Prochain dimanche
  nextSunday.setHours(2, 0, 0, 0); // 02h00

  // Si on est déjà passé le dimanche 02h00 cette semaine, programmer pour la semaine prochaine
  if (now >= nextSunday) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  const timeUntilNextBackup = nextSunday.getTime() - now.getTime();

  console.log(`📅 Prochaine sauvegarde automatique: ${nextSunday.toLocaleString('fr-FR')}`);

  setTimeout(() => {
    console.log('🔄 Début de la sauvegarde hebdomadaire automatique...');
    createBackup();

    // Programmer la prochaine sauvegarde
    setInterval(() => {
      console.log('🔄 Début de la sauvegarde hebdomadaire automatique...');
      createBackup();
    }, WEEKLY_BACKUP_INTERVAL);
  }, timeUntilNextBackup);
}

scheduleWeeklyBackup();

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

// Récupérer un utilisateur par son ID
app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT id, nom, role, date_creation, password_reset_requested, password_reset_date FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
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

    const storedPassword = user.password;
    const passwordIsValid = verifyPassword(password, storedPassword);
    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    if (!isHashedPassword(storedPassword)) {
      const hashed = hashPassword(password);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
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
    if (!password) {
      return res.status(400).json({ error: 'Le mot de passe est requis' });
    }

    const hashedPassword = hashPassword(password);
    const stmt = db.prepare(`
      INSERT INTO users (id, nom, password, role, password_reset_requested, password_reset_date)
      VALUES (?, ?, ?, ?, 0, NULL)
    `);
    stmt.run(id, nom, hashedPassword, role);
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
      const hashedPassword = hashPassword(password);
      const stmt = db.prepare(`
        UPDATE users
        SET nom = ?, password = ?, role = ?, password_reset_requested = ?, password_reset_date = ?
        WHERE id = ?
      `);
      stmt.run(nom, hashedPassword, role, passwordResetFlag, resetDateValue, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUserId = 'deleted-user';

    db.transaction(() => {
      // Récupérer le nom de l'utilisateur avant suppression
      const user = db.prepare('SELECT nom FROM users WHERE id = ?').get(userId);
      const userName = user ? user.nom : 'Utilisateur supprimé';

      // Remplacer les références liées à ce compte par l'utilisateur supprimé
      db.prepare('UPDATE system_logs SET user_id = ? WHERE user_id = ?').run(deletedUserId, userId);
      db.prepare('UPDATE bug_reports SET user_id = ? WHERE user_id = ?').run(deletedUserId, userId);
      db.prepare('UPDATE control_history SET user_id = ? WHERE user_id = ?').run(deletedUserId, userId);

      // Mettre à jour l'inspecteur textuel des rapports d'inspection
      db.prepare('UPDATE inspection_reports SET inspector = ? WHERE inspector = ?').run('Utilisateur supprimé', userName);

      // Supprimer l'utilisateur
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    })();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES SAUVEGARDES
// ===============================

// Créer une sauvegarde manuelle
app.post('/api/backup', (req, res) => {
  try {
    const backupFilename = createBackup();
    if (backupFilename) {
      res.json({
        success: true,
        message: 'Sauvegarde créée avec succès',
        filename: backupFilename
      });
    } else {
      res.status(500).json({ error: 'Échec de la création de la sauvegarde' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister les sauvegardes
app.get('/api/backups', (req, res) => {
  try {
    const backups = listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restaurer une sauvegarde
app.post('/api/backup/restore/:filename', (req, res) => {
  try {
    const result = restoreBackup(req.params.filename);
    if (result.success) {
      res.json({
        success: true,
        message: 'Sauvegarde restaurée avec succès',
        safetyBackup: result.safetyBackup
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une sauvegarde
app.delete('/api/backup/:filename', (req, res) => {
  try {
    const result = deleteBackup(req.params.filename);
    if (result.success) {
      res.json({ success: true, message: 'Sauvegarde supprimée avec succès' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques des sauvegardes
app.get('/api/backup/stats', (req, res) => {
  try {
    const stats = getBackupStats();
    res.json(stats);
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
      quantity: typeof e.quantity === 'number' ? e.quantity : 1,
      notes: e.notes || undefined,
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
    const { id, name, qrCode, barcode, type, category, status, quantity = 1, notes, controlDate, expiryDate } = req.body;
    const resolvedQrCode = qrCode ?? barcode;
    if (!resolvedQrCode) {
      return res.status(400).json({ error: 'qrCode or barcode is requis' });
    }
    const resolvedCategory = category ?? 'AUTRE';
    const resolvedStatus = status || 'ok';
    
    const stmt = db.prepare(`
      INSERT INTO operational_equipment (id, name, qr_code, type, category, status, quantity, notes, control_date, peremption_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, resolvedQrCode, type, resolvedCategory, resolvedStatus, quantity, notes || null, controlDate || null, expiryDate || null);
    
    // Retourner l'équipement créé
    const created = db.prepare('SELECT * FROM operational_equipment WHERE id = ?').get(id);
    const formatted = {
      id: created.id,
      name: created.name,
      qrCode: created.qr_code,
      barcode: created.qr_code,
      type: created.type,
      category: created.category,
      status: created.status,
      quantity: typeof created.quantity === 'number' ? created.quantity : 1,
      notes: created.notes || undefined,
      controlDate: created.control_date,
      lastControlDate: created.control_date,
      expiryDate: created.peremption_date
    };
    res.status(201).json(formatted);
  } catch (error) {
    console.error('Erreur création équipement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un équipement opérationnel
app.put('/api/operational-equipment/:id', (req, res) => {
  try {
    const { name, qrCode, barcode, type, category, status, quantity = 1, notes, controlDate, expiryDate } = req.body;
    const resolvedQrCode = qrCode ?? barcode;
    if (!resolvedQrCode) {
      return res.status(400).json({ error: 'qrCode or barcode is requis' });
    }
    const resolvedCategory = category ?? 'AUTRE';
    const resolvedStatus = status || 'ok';
    
    const stmt = db.prepare(`
      UPDATE operational_equipment
      SET name = ?, qr_code = ?, type = ?, category = ?, status = ?, quantity = ?, notes = ?, control_date = ?, peremption_date = ?
      WHERE id = ?
    `);
    stmt.run(name, resolvedQrCode, type, resolvedCategory, resolvedStatus, quantity, notes || null, controlDate || null, expiryDate || null, req.params.id);
    
    // Retourner l'équipement mis à jour
    const updated = db.prepare('SELECT * FROM operational_equipment WHERE id = ?').get(req.params.id);
    const formatted = {
      id: updated.id,
      name: updated.name,
      qrCode: updated.qr_code,
      barcode: updated.qr_code,
      type: updated.type,
      category: updated.category,
      status: updated.status,
      quantity: typeof updated.quantity === 'number' ? updated.quantity : 1,
      notes: updated.notes || undefined,
      controlDate: updated.control_date,
      lastControlDate: updated.control_date,
      expiryDate: updated.peremption_date
    };
    res.json(formatted);
  } catch (error) {
    console.error('Erreur mise à jour équipement:', error);
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
    const histories = db.prepare(`
      SELECT
        control_history.*,
        COALESCE(users.nom, 'Utilisateur supprimé') AS user
      FROM control_history
      LEFT JOIN users ON control_history.user_id = users.id
      ORDER BY control_history.timestamp DESC
    `).all();
    
    const formatted = histories.map(h => {
      const results = db.prepare('SELECT * FROM control_results WHERE control_id = ?').all(h.id);
      
      return {
        id: h.id,
        bagId: h.bag_id,
        userId: h.user_id,
        user: h.user,
        controlType: h.control_type,
        deploymentLocation: h.deployment_location,
        timestamp: h.timestamp,
        notes: h.notes,
        results: results.map(r => ({
          itemId: r.item_id,
          itemName: r.item_name,
          pocketName: r.pocket_name,
          status: r.status,
          actualQuantity: r.actual_quantity,
          notes: r.notes
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
    const histories = db.prepare(`
      SELECT
        control_history.*,
        COALESCE(users.nom, 'Utilisateur supprimé') AS user
      FROM control_history
      LEFT JOIN users ON control_history.user_id = users.id
      WHERE control_history.bag_id = ?
      ORDER BY control_history.timestamp DESC
    `).all(req.params.bagId);
    
    const formatted = histories.map(h => {
      const results = db.prepare('SELECT * FROM control_results WHERE control_id = ?').all(h.id);
      
      return {
        id: h.id,
        bagId: h.bag_id,
        userId: h.user_id,
        user: h.user,
        controlType: h.control_type,
        deploymentLocation: h.deployment_location,
        timestamp: h.timestamp,
        notes: h.notes,
        results: results.map(r => ({
          itemId: r.item_id,
          itemName: r.item_name,
          pocketName: r.pocket_name,
          status: r.status,
          actualQuantity: r.actual_quantity,
          notes: r.notes
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
    const { id, bagId, userId, controlType, deploymentLocation, timestamp, notes, results } = req.body;

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
        INSERT INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertHistory.run(id, bagId, userId, controlType, deploymentLocation, timestamp, notes || null);

      if (results && results.length > 0) {
        const insertResult = db.prepare(`
          INSERT INTO control_results (id, control_id, item_id, status, actual_quantity, item_name, pocket_name, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        results.forEach(result => {
          insertResult.run(
            `${id}-${result.itemId}`,
            id,
            result.itemId,
            result.status || null,
            result.actualQuantity !== undefined ? result.actualQuantity : null,
            result.itemName || null,
            result.pocketName || null,
            result.notes || null
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
    const logs = db.prepare(`
      SELECT
        system_logs.id,
        system_logs.timestamp,
        system_logs.action,
        system_logs.details,
        system_logs.user_id,
        COALESCE(users.nom, 'Utilisateur supprimé') AS user
      FROM system_logs
      LEFT JOIN users ON system_logs.user_id = users.id
      ORDER BY system_logs.timestamp DESC
    `).all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un log
app.post('/api/logs', (req, res) => {
  try {
    const { id, userId, user, action, details, timestamp } = req.body;
    let resolvedUserId = userId;

    if (!resolvedUserId && user) {
      const userRow = db.prepare('SELECT id FROM users WHERE nom = ?').get(user);
      if (userRow) {
        resolvedUserId = userRow.id;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO system_logs (id, user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, resolvedUserId, action, details, timestamp);
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

const bugReportStatusToDb = {
  new: 'ouvert',
  'in-progress': 'en cours',
  resolved: 'résolu',
};

const bugReportStatusFromDb = {
  ouvert: 'new',
  'en cours': 'in-progress',
  résolu: 'resolved',
};

// Récupérer tous les rapports de bugs
app.get('/api/bug-reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT
        bug_reports.id,
        bug_reports.timestamp,
        bug_reports.page,
        bug_reports.description,
        bug_reports.user_agent AS userAgent,
        bug_reports.status,
        bug_reports.resolved_at AS resolvedAt,
        bug_reports.resolved_by AS resolvedBy,
        COALESCE(users.nom, 'Utilisateur supprimé') AS user
      FROM bug_reports
      LEFT JOIN users ON bug_reports.user_id = users.id
      ORDER BY bug_reports.timestamp DESC
    `).all();

    res.json(reports.map(report => ({
      ...report,
      status: bugReportStatusFromDb[report.status] || report.status,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un rapport de bug
app.post('/api/bug-reports', (req, res) => {
  try {
    const { id, userId, user, category, page, description, userAgent, status, timestamp } = req.body;
    let resolvedUserId = userId;

    if (!resolvedUserId && user) {
      const userRow = db.prepare('SELECT id FROM users WHERE nom = ?').get(user);
      if (userRow) {
        resolvedUserId = userRow.id;
      }
    }

    const categoryValue = category || page || 'bug_report';
    const statusDb = bugReportStatusToDb[status] || status || 'ouvert';

    const stmt = db.prepare(`
      INSERT INTO bug_reports (id, user_id, category, page, description, user_agent, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, resolvedUserId, categoryValue, page || null, description, userAgent || null, statusDb, timestamp);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un rapport de bug
app.delete('/api/bug-reports/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM bug_reports WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour le statut d'un rapport de bug
app.put('/api/bug-reports/:id', (req, res) => {
  try {
    const { status } = req.body;
    const statusDb = bugReportStatusToDb[status] || status || 'ouvert';
    const stmt = db.prepare('UPDATE bug_reports SET status = ? WHERE id = ?');
    stmt.run(statusDb, req.params.id);
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

// Limiteur de débit pour les suppressions de catégories
const deleteCategoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 suppressions par fenêtre et par IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Supprimer une catégorie personnalisée
app.delete('/api/categories/:id', deleteCategoryLimiter, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM custom_categories WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTE DE MIGRATION
// ===============================

app.post('/api/migrate', (req, res) => {
  try {
    const { users, bags, pharmacyProducts, operationalEquipment, controlHistories, logs, bugReports, categories, customCategories } = req.body;

    console.log('📤 Migration reçue du frontend');
    console.log(`  - ${users?.length || 0} utilisateurs`);
    console.log(`  - ${bags?.length || 0} sacs`);
    console.log(`  - ${pharmacyProducts?.length || 0} produits pharmacie`);
    console.log(`  - ${operationalEquipment?.length || 0} équipements`);
    console.log(`  - ${controlHistories?.length || 0} historiques de contrôle`);
    console.log(`  - ${logs?.length || 0} logs`);
    console.log(`  - ${bugReports?.length || 0} rapports de bugs`);
    console.log(`  - ${categories?.length || 0} catégories`);

    let migratedCount = 0;

    // Migrer les utilisateurs
    if (users && Array.isArray(users)) {
      for (const user of users) {
        try {
          const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(user.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO users (id, nom, password, role, password_reset_requested, password_reset_date)
              VALUES (?, ?, ?, ?, 0, NULL)
            `).run(user.id, user.username || user.nom, user.password, user.role);
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration user ${user.id}:`, err.message);
        }
      }
    }

    // Migrer les sacs
    if (bags && Array.isArray(bags)) {
      for (const bag of bags) {
        try {
          const existing = db.prepare('SELECT id FROM bags WHERE id = ?').get(bag.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO bags (id, name, qrCode, deploymentStatus, deploymentLocation, deploymentDate, status, lastControlDate, createdAt, pockets)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              bag.id,
              bag.name,
              bag.qrCode,
              bag.deploymentStatus || 'present',
              bag.deploymentLocation || null,
              bag.deploymentDate || null,
              bag.status || 'ok',
              bag.lastControlDate || null,
              bag.createdAt || new Date().toISOString(),
              JSON.stringify(bag.pockets || [])
            );
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration bag ${bag.id}:`, err.message);
        }
      }
    }

    // Migrer les produits pharmacie
    if (pharmacyProducts && Array.isArray(pharmacyProducts)) {
      for (const product of pharmacyProducts) {
        try {
          const existing = db.prepare('SELECT id FROM pharmacy_products WHERE id = ?').get(product.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO pharmacy_products (id, barcode, name, category, lot_number, expiry_date, quantity, min_stock, location, supplier, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              product.id,
              product.barcode,
              product.name,
              product.category,
              product.lot || product.lotNumber,
              product.expiryDate || product.expiry_date,
              product.quantity,
              product.minStock || 0,
              product.location || null,
              product.supplier || null,
              product.createdAt || new Date().toISOString()
            );
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration pharmacy product ${product.id}:`, err.message);
        }
      }
    }

    // Migrer l'équipement opérationnel
    if (operationalEquipment && Array.isArray(operationalEquipment)) {
      for (const equipment of operationalEquipment) {
        try {
          const existing = db.prepare('SELECT id FROM operational_equipment WHERE id = ?').get(equipment.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO operational_equipment (id, name, barcode, type, category, quantity, status, last_control_date, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              equipment.id,
              equipment.name,
              equipment.barcode,
              equipment.type,
              equipment.category,
              equipment.quantity,
              equipment.status || 'ok',
              equipment.lastControlDate || null,
              equipment.createdAt || new Date().toISOString()
            );
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration equipment ${equipment.id}:`, err.message);
        }
      }
    }

    // Migrer les historiques de contrôle
    if (controlHistories && Array.isArray(controlHistories)) {
      for (const history of controlHistories) {
        try {
          const existing = db.prepare('SELECT id FROM control_history WHERE id = ?').get(history.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO control_history (id, bag_id, user_id, control_type, deployment_location, timestamp)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              history.id,
              history.bagId || history.bag_id,
              history.userId || history.user_id,
              history.controlType || history.control_type,
              history.deploymentLocation || history.deployment_location,
              history.timestamp || new Date().toISOString()
            );
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration control history ${history.id}:`, err.message);
        }
      }
    }

    // Migrer les logs
    if (logs && Array.isArray(logs)) {
      for (const log of logs) {
        try {
          db.prepare(`
            INSERT INTO logs (id, timestamp, action, user_id, details)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            log.id,
            log.timestamp,
            log.action,
            log.user || log.user_id,
            log.details
          );
          migratedCount++;
        } catch (err) {
          console.warn(`Erreur migration log ${log.id}:`, err.message);
        }
      }
    }

    // Migrer les rapports de bugs
    if (bugReports && Array.isArray(bugReports)) {
      for (const report of bugReports) {
        try {
          const existing = db.prepare('SELECT id FROM bug_reports WHERE id = ?').get(report.id);
          if (!existing) {
            db.prepare(`
              INSERT INTO bug_reports (id, timestamp, user_id, page, description, user_agent, status, resolved_at, resolved_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              report.id,
              report.timestamp,
              report.user || report.user_id,
              report.page,
              report.description,
              report.userAgent || report.user_agent,
              report.status || 'new',
              report.resolvedAt || report.resolved_at || null,
              report.resolvedBy || report.resolved_by || null
            );
            migratedCount++;
          }
        } catch (err) {
          console.warn(`Erreur migration bug report ${report.id}:`, err.message);
        }
      }
    }

    console.log(`✅ Migration terminée: ${migratedCount} enregistrements migrés`);
    res.json({ success: true, message: `${migratedCount} enregistrements migrés avec succès`, migratedCount });
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
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
app.use(spaFallbackLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Démarrer le serveur
const HOST = process.env.NODE_ENV === 'production' ? 'localhost' : '0.0.0.0';
const LOG_DIR = path.join(__dirname, 'logs');
const SERVER_LOG_PATH = path.join(LOG_DIR, 'server.log');

const ensureLogDirectory = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const appendServerLog = (message) => {
  ensureLogDirectory();
  fs.appendFileSync(SERVER_LOG_PATH, `${new Date().toISOString()} ${message}\n`);
};

app.listen(PORT, HOST, () => {
  const startupMessage = `Serveur API démarré sur http://${HOST}:${PORT}`;
  console.log(`🚀 ${startupMessage}`);
  console.log(`📊 Base de données : stockprotec.db`);
  appendServerLog(startupMessage);

  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 Mode production : acces restreint a localhost`);
    console.log(`🌐 Utilisez un reverse proxy pour exposer l'application`);
  }
});
