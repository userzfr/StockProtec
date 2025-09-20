const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, "donnees.db");
const db = new sqlite3.Database(DB_PATH);

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
});

app.get("/donnees.json", (req, res) => {
  db.all("SELECT * FROM stock ORDER BY categorie, sousCategorie, nom", [], (err, rows) => {
    if (err) return res.status(500).send("Erreur lecture SQL");
    res.json(rows);
  });
});

app.post("/sauvegarder", (req, res) => {
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

app.delete("/supprimer/:code", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
