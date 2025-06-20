const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.static('.'));
app.use(express.json());

const db = new sqlite3.Database('donnees.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS stock (
    code TEXT PRIMARY KEY,
    nom TEXT,
    lot TEXT,
    peremption TEXT,
    controle TEXT,
    quantite INTEGER,
    etat TEXT DEFAULT 'rentré'
  )`);
});

app.get('/donnees.json', (req, res) => {
  db.all("SELECT * FROM stock", [], (err, rows) => {
    if (err) return res.status(500).send("Erreur lecture base");
    res.json(rows);
  });
});

app.post('/sauvegarder', (req, res) => {
  const data = req.body;
  const stmt = db.prepare(`REPLACE INTO stock (code, nom, lot, peremption, controle, quantite, etat)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`);
  try {
    data.forEach(p => {
      stmt.run(p.code, p.nom, p.lot, p.peremption, p.controle, p.quantite, p.etat || 'rentré');
    });
    stmt.finalize();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Erreur d'écriture dans SQLite");
  }
});

app.delete('/supprimer/:code', (req, res) => {
  const code = req.params.code;
  db.run("DELETE FROM stock WHERE code = ?", [code], function (err) {
    if (err) {
      console.error("Erreur suppression:", err);
      return res.status(500).send("Erreur suppression SQL");
    }
    res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
