const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = 3000;

// Apply a rate limit to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100                  // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DB_PATH = path.join(__dirname, "donnees.db");
const db = new sqlite3.Database(DB_PATH);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "stockprotec_secret_2025"; // À remplacer par une vraie clé en prod

// Middleware pour vérifier le token et le rôle
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(403);
    next();
  };
}

// Ensure schema and add missing columns if needed
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS stock (
    code TEXT PRIMARY KEY,
    nom TEXT,
    lot TEXT,
    peremption TEXT,
    controle TEXT,
    quantite INTEGER,
    etat TEXT DEFAULT 'rentré',
    categorie TEXT,
    sousCategorie TEXT
  )`);

  // Try to add columns if old DB lacks them (no-op if exist)
  db.run("ALTER TABLE stock ADD COLUMN etat TEXT DEFAULT 'rentré'", err => {});
  db.run("ALTER TABLE stock ADD COLUMN categorie TEXT", err => {});
  db.run("ALTER TABLE stock ADD COLUMN sousCategorie TEXT", err => {});

  // Table users pour l'authentification
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) NOT NULL,
    categorie TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  // Ajout des colonnes si la table existe déjà
  db.run("ALTER TABLE users ADD COLUMN categorie TEXT", err => {});
  db.run("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP", err => {});
});

app.get("/donnees.json", (req, res) => {
  db.all("SELECT * FROM stock ORDER BY categorie, sousCategorie, nom", [], (err, rows) => {
    if (err) return res.status(500).send("Erreur lecture SQL");
    res.json(rows);
  });
});

app.post("/sauvegarder", authenticateToken, requireRole("admin"), (req, res) => {
  const data = req.body || [];
  db.serialize(() => {
    db.run("DELETE FROM stock", (err) => {
      if (err) return res.status(500).send("Erreur nettoyage");
      const stmt = db.prepare(`INSERT INTO stock (code, nom, lot, peremption, controle, quantite, etat, categorie, sousCategorie) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const p of data) {
        stmt.run(p.code, p.nom, p.lot, p.peremption, p.controle, p.quantite, p.etat || "rentré", p.categorie || null, p.sousCategorie || null);
      }
      stmt.finalize();
      res.sendStatus(200);
    });
  });
});

app.delete("/supprimer/:code", authenticateToken, requireRole("admin"), (req, res) => {
  const code = req.params.code;
  db.run("DELETE FROM stock WHERE code = ?", [code], function (err) {
    if (err) return res.status(500).send("Erreur suppression SQL");
    res.sendStatus(200);
  });
});

app.get("/categories.json", (req, res) => {
  fs.readFile(path.join(__dirname, "categories.json"), "utf8", (err, data) => {
    if (err) return res.status(500).send("Erreur lecture categories.json");
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      res.status(500).send("categories.json invalide");
    }
  });
});

// Route de connexion utilisateur
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Champs manquants");
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(401).send("Utilisateur ou mot de passe incorrect");
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("Utilisateur ou mot de passe incorrect");
    // Générer le token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
