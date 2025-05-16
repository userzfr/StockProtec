const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static('.'));
app.use(express.json());

app.post('/sauvegarder', (req, res) => {
  fs.writeFile('donnees.json', JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send("Erreur d'écriture du fichier");
    res.sendStatus(200);
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});