# 📚 Index de la Documentation - StockProtec v2.0

Bienvenue dans la documentation complète de StockProtec avec base de données SQLite.

---

## 🚀 Pour Commencer

### Nouveau Utilisateur ?

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡  
   *Démarrage en 3 étapes - 2 minutes chrono*  
   → Installez et lancez StockProtec immédiatement

2. **[INSTALLATION.md](INSTALLATION.md)** 📦  
   *Guide d'installation complet*  
   → Instructions détaillées, dépannage, configuration

### Utilisateur Existant ?

3. **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** 🔄  
   *(Déprécié) Migration localStorage → SQLite*  
   → Ce projet utilise désormais une base de données partagée ; la migration n'est plus nécessaire.

---

## 👨‍💻 Pour les Développeurs

### Documentation Technique

4. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** 🛠️  
   *Guide technique complet (8 pages)*  
   → Architecture, API, tables SQL, exemples de code

5. **[RESUME_TECHNIQUE.md](RESUME_TECHNIQUE.md)** 📊  
   *Résumé technique de la migration*  
   → Statistiques, métriques, fichiers livrés

### Historique

6. **[CHANGELOG.md](CHANGELOG.md)** 📝  
   *Liste des changements v2.0.0*  
   → Nouveautés, améliorations, breaking changes

---

## 📖 Documentation par Thème

### Installation & Démarrage

| Document | Contenu | Temps de lecture |
|----------|---------|------------------|
| [QUICKSTART.md](QUICKSTART.md) | Démarrage rapide | 2 min |
| [INSTALLATION.md](INSTALLATION.md) | Installation détaillée | 5 min |
| Scripts `start.sh` / `start.bat` | Lancement automatique | - |

### Migration

| Document | Contenu | Public |
|----------|---------|--------|
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | Guide de migration | Utilisateurs |
| _(Migration tooling - déprécié)_ | Utilisé pour migrer depuis localStorage (maintenant inutile) | - |

### Développement

| Document | Contenu | Complexité |
|----------|---------|------------|
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Architecture complète | Avancé |
| [/server/database.js](/server/database.js) | Structure SQL | Moyen |
| [/server/server.js](/server/server.js) | API Express | Moyen |
| [/src/app/services/api.ts](/src/app/services/api.ts) | Client API | Facile |

### Utilitaires

| Document | Utilité |
|----------|---------|
| [/server/seed.js](/server/seed.js) | Données d'exemple |
| [.gitignore](/.gitignore) | Fichiers à ignorer |
| [package.json](/package.json) | Scripts npm |

---

## 🎯 Navigation Rapide

### Par Rôle

#### 👤 Utilisateur Final
1. [QUICKSTART.md](QUICKSTART.md) - Commencez ici
2. [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Si vous migrez
3. [README.md](README.md) - Fonctionnalités

#### 👨‍💼 Administrateur Système
1. [INSTALLATION.md](INSTALLATION.md) - Installation
2. [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration
3. [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Dépannage

#### 👨‍💻 Développeur
1. [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Architecture
2. [CHANGELOG.md](CHANGELOG.md) - Changements
3. [RESUME_TECHNIQUE.md](RESUME_TECHNIQUE.md) - Vue d'ensemble

### Par Tâche

#### "Je veux installer StockProtec"
→ [QUICKSTART.md](QUICKSTART.md) puis [INSTALLATION.md](INSTALLATION.md)

#### "Je veux migrer mes données"
→ [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

#### "Je veux comprendre l'architecture"
→ [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

#### "Je veux voir ce qui a changé"
→ [CHANGELOG.md](CHANGELOG.md)

#### "J'ai un problème"
→ [INSTALLATION.md](INSTALLATION.md#dépannage) ou [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#que-faire-en-cas-de-problème)

#### "Je veux tester avec des données d'exemple"
→ `npm run seed` (voir [QUICKSTART.md](QUICKSTART.md))

---

## 📁 Structure des Fichiers

```
/
├── 📄 Documentation
│   ├── README.md                    # Vue d'ensemble du projet
│   ├── QUICKSTART.md               # ⭐ Démarrage rapide
│   ├── INSTALLATION.md             # Guide d'installation
│   ├── MIGRATION_GUIDE.md          # Guide de migration
│   ├── DEVELOPER_GUIDE.md          # ⭐ Documentation technique
│   ├── CHANGELOG.md                # Liste des changements
│   ├── RESUME_TECHNIQUE.md         # Résumé technique
│   └── DOCUMENTATION_INDEX.md      # Ce fichier
│
├── 🖥️ Backend
│   └── server/
│       ├── database.js             # Configuration SQLite
│       ├── server.js               # API Express
│       ├── migrate.js              # Migration localStorage
│       └── seed.js                 # Données d'exemple
│
├── 🎨 Frontend
│   └── src/app/
│       ├── services/
│       │   └── api.ts              # Client API
│       ├── hooks/
│       │   └── useApiConnection.ts # Hook connexion
│       └── components/
│           ├── MigrationDialog.tsx
│           └── ApiConnectionAlert.tsx
│
├── ⚙️ Configuration
│   ├── package.json                # Scripts npm
│   ├── vite.config.ts             # Config Vite + Proxy
│   └── .gitignore                 # Fichiers ignorés
│
├── 🚀 Scripts
│   ├── start.sh                    # Démarrage Linux/Mac
│   └── start.bat                   # Démarrage Windows
│
└── 💾 Base de Données
    └── stockprotec.db              # SQLite (créé auto)
```

---

## 🔍 Recherche Rapide

### Mots-clés et Documents

| Vous cherchez... | Consultez... |
|------------------|--------------|
| Installation | [INSTALLATION.md](INSTALLATION.md) |
| Démarrage rapide | [QUICKSTART.md](QUICKSTART.md) |
| Migration | [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) |
| API | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#api-backend) |
| Tables SQL | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#base-de-données-sqlite) |
| Scripts npm | [package.json](package.json) ou [INSTALLATION.md](INSTALLATION.md) |
| Dépannage | [INSTALLATION.md](INSTALLATION.md#dépannage) |
| Sauvegarde | [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#sauvegarde-de-vos-données) |
| Sécurité | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#sécurité) |
| Nouveautés | [CHANGELOG.md](CHANGELOG.md) |
| Architecture | [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#architecture) |
| Exemples | [/server/seed.js](/server/seed.js) |

---

## 📞 Support & Aide

### En Cas de Problème

1. **Consultez le dépannage** :
   - [INSTALLATION.md - Section Dépannage](INSTALLATION.md#dépannage)
   - [MIGRATION_GUIDE.md - Que faire en cas de problème](MIGRATION_GUIDE.md#que-faire-en-cas-de-problème)

2. **Vérifiez les logs** :
   - Logs serveur (Terminal avec `npm run server`)
   - Console navigateur (F12)

3. **Testez la connexion** :
   - API : `http://localhost:3001/api/health`
   - Frontend : `http://localhost:5173`

### Documentation Externe

- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- [Express.js](https://expressjs.com/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

---

## ✅ Checklist Complète

### Pour les Nouveaux Utilisateurs

- [ ] J'ai lu [QUICKSTART.md](QUICKSTART.md)
- [ ] J'ai installé les dépendances (`npm install`)
- [ ] J'ai démarré l'application (`npm run dev:all`)
- [ ] Je peux accéder à `http://localhost:5173`
- [ ] J'ai ajouté des données d'exemple (`npm run seed`)

### Pour la Migration

- [ ] J'ai lu [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- [ ] J'ai sauvegardé mes données actuelles
- [ ] J'ai démarré le serveur API
- [ ] J'ai lancé la migration
- [ ] J'ai vérifié que toutes mes données sont présentes
- [ ] J'ai créé une sauvegarde de `stockprotec.db`

### Pour le Développement

- [ ] J'ai lu [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- [ ] Je comprends l'architecture
- [ ] Je connais les endpoints API
- [ ] Je sais comment ajouter une table
- [ ] Je sais comment créer un endpoint

---

## 🎉 Vous Êtes Prêt !

Vous avez maintenant accès à toute la documentation nécessaire pour :

✅ Installer StockProtec  
✅ Migrer vos données  
✅ Comprendre l'architecture  
✅ Développer de nouvelles fonctionnalités  
✅ Résoudre les problèmes  

**Bonne utilisation de StockProtec !**

---

**Version 2.0.0** - Mars 2026  
**Protection Civile de la Loire - Antenne de Saint-Étienne**

*Développé avec ❤️ pour sauver des vies*
