# 📦 Gestion de Stock - Protection Civile

Application web de gestion de stock simple et efficace, conçue pour la Protection Civile.  
Fonctionne en local avec enregistrement automatique des données sur le serveur dès qu'une modification est faite.

---

## ✅ Fonctionnalités

- Ajout de produits avec génération automatique de code-barres
- Affichage dynamique des produits dans un tableau
- Système d’alerte visuelle :
  - 🔴 Péremption dépassée ou contrôle non effectué depuis plus de 30 jours
  - 🟡 Péremption proche ou contrôle > 20 jours
- Contrôle de date mis à jour d’un clic
- Modification & suppression de produits avec enregistrement direct en base SQLite
- Recherche instantanée par code-barres
- Code-barres générés automatiquement en SVG
- Sauvegarde automatique dans une base **SQLite** (`donnees.db`)
- Boutons d'état visuels : 📥 (rentré) / 📤 (sorti)
- Info-bulles sur les boutons d'action
- Vérification automatique des mises à jour depuis GitHub

---

## 📁 Structure du projet

```
gestion-stock/
├── index.html        # Interface principale (frontend)
├── server.js         # Serveur Node.js avec base SQLite
├── donnees.db        # Base de données SQLite (stock)
├── README.md         # Documentation (ce fichier)
└── CGU.pdf           # Conditions d'utilisation (affichées en bas de page)
````

---

## 🚀 Lancer le projet en local

### 1. Installer les dépendances

Installe Node.js puis les modules nécessaires :

```bash
npm install express sqlite3
````

### 2. Lancer le serveur

```bash
node server.js
```

OU

Lancer le `START.bat`

> Le serveur démarre sur : [http://localhost:3000](http://localhost:3000)

### 3. Utiliser l'application

* Ouvre ton navigateur à l'adresse : [http://localhost:3000](http://localhost:3000)
* Utilise les boutons pour ajouter, modifier, contrôler, supprimer, ou changer l'état d'un produit
* Le tableau est automatiquement mis à jour
* Chaque modification est enregistrée en temps réel dans `donnees.db`

---

## 🔒 Données sauvegardées

Les données sont stockées dans une base SQLite `donnees.db` au format suivant :

```
Table stock (
  code TEXT PRIMARY KEY,
  nom TEXT,
  lot TEXT,
  peremption TEXT,
  controle TEXT,
  quantite INTEGER,
  etat TEXT DEFAULT 'rentré'
)
```

---

## 🛠️ Dépendances utilisées

* [Bootstrap 5](https://getbootstrap.com/)
* [SheetJS](https://sheetjs.com/) (en option)
* [JsBarcode](https://github.com/lindell/JsBarcode)
* [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
* [SQLite3](https://www.npmjs.com/package/sqlite3)

---

## 💡 Astuces

* Les boutons ⚠️ s’affichent en clignotant pour indiquer une urgence :
  * Produit bientôt périmé
  * Contrôle oublié
* Les boutons 📤 et 📥 permettent de marquer le stock comme sorti ou rentré pour un événement
* Le message sous la recherche te rappelle de passer ton clavier en QWERTY pour le scan code-barres

---

## 🧑‍💻 Auteur

* Projet réalisé par **Mathieu MERLE** pour la **Protection Civile**
* Licence libre pour usage associatif, pédagogique ou personnel

---

## 📜 Licence

Ce projet est libre de droits tant qu’il est utilisé dans un cadre **bénévole ou associatif**.
Pour un usage commercial, merci de demander l'autorisation préalable.