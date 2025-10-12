#!/usr/bin/env node
/**
 * ================================================================
 *  Script : create_user_node.js
 *  Auteur : Mathieu M
 *  Description :
 *    Ce script permet de créer un utilisateur dans une base SQLite,
 *    avec un mot de passe haché via bcryptjs. Il est interactif
 *    (nom d’utilisateur, mot de passe, rôle, catégorie).
 *
 *  Fonctionnalités :
 *    - Création automatique de la table "users" si elle n’existe pas.
 *    - Vérification si l’utilisateur existe déjà.
 *    - Suppression de l’utilisateur existant avec l’option --force.
 *    - Hachage sécurisé du mot de passe (bcryptjs).
 *
 *  Prérequis :
 *    npm install sqlite3 bcryptjs prompt-sync
 *
 *  Utilisation :
 *    node create_user_node.js --db donnees.db
 *    node create_user_node.js --db donnees.db --force   (remplace l’utilisateur existant)
 *
 *  Exemple :
 *    node create_user_node.js --db ./data/users.db
 *
 *  Sortie :
 *    Crée ou met à jour un utilisateur dans la table `users` :
 *      id | username | password (haché) | role | categorie | created_at
 *
 *  Fait par : Mathieu M
 *  ================================================================
 */

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const prompt = require('prompt-sync')({ sigint: true });

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--') ? process.argv[idx + 1] : null;
}
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const dbPath = getArg('db') || 'donnees.db';
const force = hasFlag('force');

if (!fs.existsSync(dbPath)) {
  console.error(`Erreur : fichier de base de données introuvable : ${dbPath}`);
  process.exit(1);
}

// === INTERACTIF ===
const username = (() => {
  const v = prompt("Nom d'utilisateur : ").trim();
  if (!v) {
    console.error("Nom d'utilisateur vide.");
    process.exit(1);
  }
  return v;
})();

const password = (() => {
  const p1 = prompt('Mot de passe : ', { echo: '*' }).trim();
  if (!p1) {
    console.error('Mot de passe vide.');
    process.exit(1);
  }
  const p2 = prompt('Confirmer le mot de passe : ', { echo: '*' }).trim();
  if (p1 !== p2) {
    console.error('Les mots de passe ne correspondent pas.');
    process.exit(1);
  }
  return p1;
})();

const role = (() => {
  const r = prompt('Rôle (ex: admin, user) : ').trim();
  return r || 'user';
})();

// === HACHAGE DU MOT DE PASSE ===
const saltRounds = 10;
const hashed = bcrypt.hashSync(password, saltRounds);

// === CONNEXION À LA BASE ===
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Erreur lors de l’ouverture de la base :', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  // Création de la table si elle n’existe pas (ignore l’erreur si elle existe déjà)
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) NOT NULL
    );`,
    (err) => {
      if (err && !String(err.message).includes('already exists')) {
        console.error('Erreur lors de la création de la table :', err.message);
        db.close();
        process.exit(1);
      }
      // On continue même si la table existe déjà
    }
  );

  // Vérifier si l’utilisateur existe déjà
  db.get(`SELECT id, username FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification de l’utilisateur :', err.message);
      db.close();
      process.exit(1);
    }

    if (row) {
      if (force) {
        // Supprimer l’utilisateur existant
        db.run(`DELETE FROM users WHERE id = ?`, [row.id], function (err2) {
          if (err2) {
            console.error('Erreur lors de la suppression :', err2.message);
            db.close();
            process.exit(1);
          }
          console.log(`Utilisateur existant (${username}) supprimé (--force).`);
          insertUser();
        });
      } else {
        console.error(`Erreur : l’utilisateur "${username}" existe déjà. Utilise --force pour le remplacer.`);
        db.close();
        process.exit(1);
      }
    } else {
      insertUser();
    }
  });

  function insertUser() {
    const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
    stmt.run([username, hashed, role], function (err) {
      if (err) {
        console.error('Erreur lors de l’insertion :', err.message);
      } else {
        console.log(`✅ Utilisateur "${username}" créé avec succès (id=${this.lastID}).`);
      }
      stmt.finalize(() => db.close());
    });
  }
});