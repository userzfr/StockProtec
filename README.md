# 📦 Gestion de Stock - Protection Civile

Application web de gestion de stock simple et efficace, conçue pour la Protection Civile.  
Fonctionne en local avec enregistrement automatique des données sur le serveur dès qu'une modification est faite.

## ✅ Fonctionnalités

- Ajout de produits avec génération automatique de code-barres
- Affichage dynamique des produits dans un tableau
- Système d’alerte visuelle :
  - 🔴 Péremption dépassée ou contrôle non effectué depuis plus de 30 jours
  - 🟡 Péremption proche ou contrôle > 20 jours
- Contrôle de date mis à jour d’un clic
- Modification & suppression de produits
- Recherche instantanée par code-barres
- Code-barres générés automatiquement en SVG
- Sauvegarde automatique dans un fichier `donnees.json` à chaque changement

---

## 📁 Structure du projet

```
gestion-stock/
├── index.html        # Interface principale (frontend)
├── server.js         # Serveur Node.js (backend)
├── donnees.json      # Base de données JSON (stock)
└── README.md         # Documentation (ce fichier)
```

---

## 🚀 Lancer le projet en local

### 1. Installer les dépendances

Pas de dépendance externe nécessaire, sauf **Node.js** installé sur ta machine.

### 2. Lancer le serveur

```bash
node server.js
```

> Le serveur démarre sur : [http://localhost:3000](http://localhost:3000)

### 3. Utiliser l'application

- Ouvre ton navigateur à l'adresse : [http://localhost:3000](http://localhost:3000)
- Utilise les boutons pour ajouter, modifier, contrôler et supprimer les produits
- Le tableau est automatiquement mis à jour
- Chaque modification est enregistrée en temps réel dans `donnees.json`

---

## 🔒 Données sauvegardées

Les données sont sauvegardées localement dans le fichier `donnees.json` sous la forme suivante :

```json
[
  {
    "code": "INV-123456",
    "nom": "Pansement",
    "lot": "A1B2",
    "peremption": "2025-10-01",
    "controle": "2025-05-16",
    "quantite": 20
  }
]
```

---

## 🛠️ Dépendances utilisées

- [Bootstrap 5](https://getbootstrap.com/)
- [SheetJS](https://sheetjs.com/)
- [JsBarcode](https://github.com/lindell/JsBarcode)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)

---

## 💡 Astuce

Les boutons ⚠️ s’affichent en clignotant pour indiquer une urgence :
- Produit bientôt périmé
- Contrôle oublié

---

## 🧑‍💻 Auteur

- Projet réalisé par **Mathieu M.** pour la **Protection Civile**
- Licence libre pour usage associatif, pédagogique ou personnel

---

## 📜 Licence

Ce projet est libre de droits tant qu’il est utilisé dans un cadre **bénévole ou associatif**.  
Pour un usage commercial, merci de demander l'autorisation préalable.
