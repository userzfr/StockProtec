import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initializeDatabase } from './database_pg.js';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser la base de données au démarrage
await initializeDatabase();

// ===============================
// ROUTES UTILISATEURS
// ===============================

// Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nom, role, date_creation FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const { id, nom, password, role } = req.body;
    await db.query(
      'INSERT INTO users (id, nom, password, role) VALUES ($1, $2, $3, $4)',
      [id, nom, password, role]
    );
    res.status(201).json({ id, nom, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur
app.put('/api/users/:id', async (req, res) => {
  try {
    const { nom, password, role } = req.body;
    await db.query(
      'UPDATE users SET nom = $1, password = $2, role = $3 WHERE id = $4',
      [nom, password, role, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// ROUTES SACS
// ===============================

// Récupérer tous les sacs avec leurs poches et items
app.get('/api/bags', async (req, res) => {
  try {
    const bagsResult = await db.query('SELECT * FROM bags');
    const bags = bagsResult.rows;

    // Pour chaque sac, récupérer ses poches et items
    const bagsWithPockets = await Promise.all(bags.map(async (bag) => {
      const pocketsResult = await db.query('SELECT * FROM pockets WHERE bag_id = $1 ORDER BY ordre_affichage', [bag.id]);
      const pockets = pocketsResult.rows;

      const pocketsWithItems = await Promise.all(pockets.map(async (pocket) => {
        const itemsResult = await db.query('SELECT * FROM bag_items WHERE pocket_id = $1', [pocket.id]);
        return { ...pocket, items: itemsResult.rows };
      }));

      return { ...bag, pockets: pocketsWithItems };
    }));

    res.json(bagsWithPockets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un sac par ID
app.get('/api/bags/:id', async (req, res) => {
  try {
    const bagResult = await db.query('SELECT * FROM bags WHERE id = $1', [req.params.id]);
    if (bagResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sac non trouvé' });
    }

    const bag = bagResult.rows[0];
    const pocketsResult = await db.query('SELECT * FROM pockets WHERE bag_id = $1 ORDER BY ordre_affichage', [bag.id]);
    const pockets = pocketsResult.rows;

    const pocketsWithItems = await Promise.all(pockets.map(async (pocket) => {
      const itemsResult = await db.query('SELECT * FROM bag_items WHERE pocket_id = $1', [pocket.id]);
      return { ...pocket, items: itemsResult.rows };
    }));

    res.json({ ...bag, pockets: pocketsWithItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un sac
app.post('/api/bags', async (req, res) => {
  try {
    const { id, nom, qr_code, description, status, deployment_status, deployment_location } = req.body;
    await db.query(
      'INSERT INTO bags (id, nom, qr_code, description, status, deployment_status, deployment_location) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, nom, qr_code, description, status, deployment_status, deployment_location]
    );
    res.status(201).json({ id, nom, qr_code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un sac
app.put('/api/bags/:id', async (req, res) => {
  try {
    const { nom, qr_code, description, last_control_date, status, deployment_status, deployment_location, deployment_date } = req.body;
    await db.query(
      'UPDATE bags SET nom = $1, qr_code = $2, description = $3, last_control_date = $4, status = $5, deployment_status = $6, deployment_location = $7, deployment_date = $8 WHERE id = $9',
      [nom, qr_code, description, last_control_date, status, deployment_status, deployment_location, deployment_date, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un sac
app.delete('/api/bags/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bags WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// AUTRES ROUTES (simplifiées pour l'exemple)
// ===============================

// Serve static files (frontend build)
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} avec PostgreSQL`);
});