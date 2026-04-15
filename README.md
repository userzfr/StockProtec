# StockProtec

**StockProtec v5 est la seule version actuellement prise en charge.**
Les versions antérieures ne sont plus supportées et ne reçoivent plus de correctifs de sécurité ni de mises à jour.

Ce projet contient :
- Un frontend React + Vite
- Un backend Node.js + Express
- Une base de données SQLite locale (`stockprotec.db`)

---

## ⚠️ Support de version

| Version | Statut |
|--------|--------|
| `v5.x` | ✅ Supportée |
| `v4.x` | ❌ Non supportée |
| `< v4` | ❌ Non supportée |

> Toute installation doit être mise à jour vers la branche **main** et la version **v5**.

---

## 🚀 Démarrage rapide

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Lancer le serveur et le frontend :
   ```bash
   npm run dev:all
   ```

3. Ouvrir l'application :
   - Frontend : `http://localhost:5173`
   - API : `http://localhost:3001`

---

## 📁 Documentation

La documentation principale se trouve dans le dossier `doc/` :

- [doc/QUICKSTART.md](doc/QUICKSTART.md)
- [doc/INSTALLATION.md](doc/INSTALLATION.md)
- [doc/DEVELOPER_GUIDE.md](doc/DEVELOPER_GUIDE.md)
- [doc/MIGRATION_GUIDE.md](doc/MIGRATION_GUIDE.md)
- [doc/CHANGELOG.md](doc/CHANGELOG.md)
- [doc/GUIDE_BASE_DONNEES.md](doc/GUIDE_BASE_DONNEES.md)
- [doc/DOCUMENTATION_INDEX.md](doc/DOCUMENTATION_INDEX.md)

---

## 🔒 Objectif du projet

StockProtec est conçu pour la gestion du matériel et du stock pharmacie de la Protection Civile. L'application vise à fournir :
- inventaire précis des sacs de secours
- suivi des équipements opérationnels
- gestion du stock pharmacie
- contrôles et historiques centralisés
- persistance sécurisée dans SQLite

---

## 📌 Architecture

- `src/` : frontend React
- `server/` : backend Node.js + Express
- `stockprotec.db` : fichier SQLite local

---

## 📌 Notes importantes

- Le backend doit être lancé sur `http://localhost:3001`
- Le frontend est servi sur `http://localhost:5173`
- Les données métier ne doivent plus être sauvegardées dans `localStorage`
- Le seul stockage local accepté est le `authState` de session utilisateur

---

## 🛠️ Fichiers utiles

- `vite.config.ts` : configuration du proxy et de l'alias `@`
- `src/app/services/api.ts` : client API principal
- `server/server.js` : routes API et point d'entrée backend
- `server/database.js` : initialisation de la base SQLite

---

## 🧪 Validation

Pour vérifier le bon fonctionnement :
- `npm run build`
- `npm run server`
- `npm run dev`

Si l'une des commandes échoue, consultez le dossier `doc/` et la documentation de démarrage.

---

## 📞 Contact et support

Pour les bugs, problèmes ou questions :

- **Discord** : MP à `userz_fr` (ID: 634442174305402883)
- **GitHub Issues** : [Ouvrir une issue](https://github.com/userzfr/StockProtec/issues) pour signaler un bug
- **Documentation** : Consultez le dossier `doc/` pour les guides détaillés
