# StockProtec v5.2.6 🏥

[![Version](https://img.shields.io/badge/version-5.2.6-blue.svg)](https://github.com/userzfr/StockProtec/releases/tag/v5.2.6)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0+-orange.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Application de gestion de stock et de matériel pour la Protection Civile**

StockProtec est une application web moderne conçue pour la gestion complète du matériel médical, des équipements et des stocks de la Protection Civile. L'application offre une interface intuitive pour la gestion des inventaires, le suivi des mouvements, et la génération de rapports.

## ✨ Fonctionnalités principales

### 📦 Gestion des stocks
- **Gestion des produits** : Ajout, modification, suppression de produits
- **Catégorisation** : Organisation par catégories et sous-catégories
- **Suivi des lots** : Gestion des numéros de lot et dates d'expiration
- **Codes-barres** : Génération et lecture de codes-barres
- **Mouvements** : Entrées, sorties, transferts avec historique complet

### 👥 Gestion des utilisateurs
- **Authentification sécurisée** : Connexion avec hashage PBKDF2
- **Rôles utilisateurs** : Administrateur, Utilisateur standard
- **Gestion des comptes** : Création, modification, suppression d'utilisateurs
- **Réinitialisation de mot de passe** : Système sécurisé de récupération

### 🔒 Sécurité & Conformité
- **Chiffrement des mots de passe** : Hashage PBKDF2 avec sel
- **Sauvegarde automatique** : Sauvegardes hebdomadaires programmées
- **Conformité RGPD** : Protection des données personnelles
- **Logs d'audit** : Traçabilité complète des actions

### 📊 Tableaux de bord
- **Statistiques en temps réel** : Vue d'ensemble des stocks
- **Rapports** : Génération de rapports détaillés
- **Alertes** : Notifications pour stocks faibles ou expirations
- **Historique** : Consultation des mouvements passés

### 🔧 Administration
- **Panneau d'administration** : Interface complète pour les admins
- **Gestion des sauvegardes** : Création, restauration, suppression
- **Migration de base de données** : Mises à jour automatiques
- **Logs système** : Monitoring et dépannage

## 🏗️ Architecture technique

```
StockProtec v5.2
├── Frontend (React + TypeScript + Vite)
│   ├── Interface utilisateur moderne
│   ├── Composants réutilisables
│   └── Gestion d'état avec Context API
├── Backend (Node.js + Express)
│   ├── API REST sécurisée
│   ├── Authentification JWT
│   └── Services métier
└── Base de données (SQLite)
    ├── Schéma relationnel
    ├── Migrations automatiques
    └── Sauvegarde intégrée
```

## 🚀 Installation & Démarrage

### Prérequis système
- **Node.js** : Version 18.0 ou supérieure
- **npm** : Version 8.0 ou supérieure
- **SQLite3** : Inclus dans le projet
- **Navigateur web** : Chrome, Firefox, Safari, Edge

### Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/userzfr/StockProtec.git
cd StockProtec

# 2. Installer les dépendances
npm run setup

# 3. Démarrer l'application
npm run prod
```

L'application sera accessible sur `http://localhost:5173`

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run setup` | Installation complète des dépendances |
| `npm run dev` | Démarrage en mode développement |
| `npm run dev:all` | Démarrage simultané frontend + backend |
| `npm run prod` | Démarrage en mode production |
| `npm run build` | Construction du frontend pour production |
| `npm run server` | Démarrage du serveur backend uniquement |
| `npm run migrate` | Exécution des migrations de base de données |
| `npm run seed` | Remplissage de la base avec des données de test |

### Configuration

Le fichier `package.json` contient toutes les configurations nécessaires. Les ports par défaut sont :
- **Frontend** : `http://localhost:5173`
- **Backend API** : `http://localhost:3001`
- **Base de données** : `server/stockprotec.db`

## 📚 Documentation

### 📖 Guides utilisateur
- **[Installation complète](docs/INSTALLATION.md)** - Guide d'installation détaillé
- **[Démarrage rapide](docs/QUICKSTART.md)** - Mise en route en 5 minutes
- **[Guide utilisateur](docs/USER_GUIDE.md)** - Utilisation de l'application
- **[Gestion des stocks](docs/INVENTORY_MANAGEMENT.md)** - Guide complet des fonctionnalités

### 🛠️ Guides développeur
- **[Guide développeur](docs/DEVELOPER_GUIDE.md)** - Architecture et développement
- **[API REST](docs/API_REFERENCE.md)** - Référence complète de l'API
- **[Base de données](docs/GUIDE_BASE_DONNEES.md)** - Schéma et migrations
- **[Tests](docs/GUIDE_TESTS_PERSISTANCE-new.md)** - Tests et qualité du code

### 🔒 Sécurité
- **[Politique de sécurité](SECURITY.md)** - Mesures de sécurité implémentées
- **[Sauvegarde](docs/BACKUP_README.md)** - Système de sauvegarde automatique
- **[RGPD](docs/GDPR_COMPLIANCE.md)** - Conformité aux réglementations

### 📋 Historique
- **[Changelog](docs/CHANGELOG.md)** - Historique des versions
- **[Corrections](docs/CORRECTIONS_APPLIQUEES-new.md)** - Bugs corrigés

## 🔄 Migration depuis les versions précédentes

### Depuis v5.0.x ou v5.1.x
```bash
# Mise à jour automatique
npm run migrate
```

### Depuis v4.x ou antérieur
Consultez le **[guide de migration](docs/MIGRATION_GUIDE.md)** pour les instructions détaillées.

## 🐛 Dépannage

### Problèmes courants

**Erreur de connexion à la base de données**
```bash
# Vérifier les permissions
chmod 644 server/stockprotec.db

# Redémarrer l'application
npm run prod
```

**Port déjà utilisé**
```bash
# Changer le port du serveur
PORT=3002 npm run server
```

**Problème de dépendances**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm run setup
```

Consultez le **[guide de dépannage](docs/TROUBLESHOOTING.md)** pour plus d'aide.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- **TypeScript** : Typage strict obligatoire
- **ESLint** : Respect des règles de style
- **Tests** : Tests unitaires pour les nouvelles fonctionnalités
- **Documentation** : Mise à jour de la documentation

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support & Contact

- **📧 Email** : [userz_fr@outlook.fr](mailto:userz_fr@outlook.fr)
- **🐛 Issues** : [GitHub Issues](https://github.com/userzfr/StockProtec/issues)
- **💬 Discord** : Contact `userz_fr` pour le support direct
- **📖 Documentation** : [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)

## 🙏 Remerciements

- **Protection Civile** pour les spécifications fonctionnelles
- **Communauté React** pour les outils et frameworks
- **Contributeurs** pour leur temps et expertise

---

**StockProtec v5.2.6** - *Application de gestion de stock pour la Protection Civile* 🏥

*Développé avec ❤️ par userz_fr*
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
