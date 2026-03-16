# 📦 StockProtec - Guide d'Installation avec Base de Données SQLite

## 🎯 Objectif

Cette version de StockProtec utilise une **base de données SQLite locale** au lieu du localStorage pour stocker toutes les données de manière plus fiable et performante.

## ✅ Prérequis

- Node.js installé (version 16 ou supérieure)
- npm ou pnpm

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer l'application

Vous avez deux options :

#### Option A : Démarrer tout automatiquement

```bash
npm run dev:all
```

Cette commande démarre automatiquement :
- Le serveur API backend (port 3001)
- L'interface React frontend (port 5173)

#### Option B : Démarrer séparément

Terminal 1 - Serveur API :
```bash
npm run server
```

Terminal 2 - Interface React :
```bash
npm run dev
```

### 3. Accéder à l'application

Ouvrez votre navigateur à l'adresse : `http://localhost:5173`

## 📊 Base de Données

### Création automatique

La base de données **`stockprotec.db`** est créée automatiquement au premier démarrage du serveur dans le dossier racine du projet.

Toutes les tables nécessaires sont créées automatiquement :
- ✅ Utilisateurs
- ✅ Sacs opérationnels
- ✅ Poches
- ✅ Items dans les sacs
- ✅ Produits pharmacie
- ✅ Matériel opérationnel
- ✅ Historique des contrôles
- ✅ Résultats de contrôle
- ✅ Logs système
- ✅ Rapports de bugs
- ✅ Catégories de pharmacie

### Emplacement de la base de données

```
/stockprotec.db
```

## 🔄 Migration des Données Existantes

Toutes les données sont désormais stockées directement dans la base SQLite côté serveur. Il n'est plus nécessaire de migrer des données depuis le localStorage : l'application utilise désormais une base de données partagée accessible par tous les clients.

## 🔧 API Backend

Le serveur API démarre sur `http://localhost:3001`

### Endpoints disponibles :

#### Utilisateurs
- `GET /api/users` - Récupérer tous les utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

> ⚠️ L'authentification se fait uniquement avec **nom d'utilisateur** + **mot de passe**. Les adresses email ne sont pas utilisées.

#### Sacs
- `GET /api/bags` - Récupérer tous les sacs
- `GET /api/bags/qr/:qrCode` - Récupérer un sac par QR code
- `POST /api/bags` - Créer un sac
- `PUT /api/bags/:id` - Mettre à jour un sac
- `DELETE /api/bags/:id` - Supprimer un sac

#### Produits Pharmacie
- `GET /api/pharmacy-products` - Récupérer tous les produits
- `POST /api/pharmacy-products` - Créer un produit
- `PUT /api/pharmacy-products/:id` - Mettre à jour un produit
- `DELETE /api/pharmacy-products/:id` - Supprimer un produit

#### Matériel Opérationnel
- `GET /api/operational-equipment` - Récupérer tout le matériel
- `POST /api/operational-equipment` - Créer un équipement
- `PUT /api/operational-equipment/:id` - Mettre à jour un équipement
- `DELETE /api/operational-equipment/:id` - Supprimer un équipement

#### Historique de Contrôle
- `GET /api/control-history` - Récupérer tous les historiques
- `GET /api/control-history/bag/:bagId` - Récupérer l'historique d'un sac
- `POST /api/control-history` - Créer un contrôle

#### Logs
- `GET /api/logs` - Récupérer tous les logs
- `POST /api/logs` - Créer un log

#### Rapports de Bugs
- `GET /api/bug-reports` - Récupérer tous les rapports
- `POST /api/bug-reports` - Créer un rapport
- `PUT /api/bug-reports/:id` - Mettre à jour le statut

#### Catégories
- `GET /api/categories` - Récupérer toutes les catégories
- `POST /api/categories` - Créer une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie

#### Santé
- `GET /api/health` - Vérifier l'état de l'API

## 💾 Sauvegarde de la Base de Données

Pour sauvegarder vos données, il suffit de copier le fichier :
```
stockprotec.db
```

Pour restaurer, replacez simplement ce fichier dans le dossier racine du projet.

## 🔑 Avantages de SQLite

✅ **Fiabilité** : Données stockées dans un fichier unique et sécurisé
✅ **Performance** : Accès rapide aux données
✅ **Sauvegarde simple** : Un seul fichier à sauvegarder
✅ **Pas de serveur externe** : Fonctionne 100% en local
✅ **Intégrité des données** : Transactions et clés étrangères
✅ **Scalabilité** : Peut gérer des milliers d'enregistrements

## 🆘 Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Vérifiez que toutes les dépendances sont installées

### Erreur de connexion à l'API
- Assurez-vous que le serveur backend est démarré
- Vérifiez l'URL de l'API dans `/src/app/services/api.ts`

### La base de données ne se crée pas
- Vérifiez les permissions d'écriture dans le dossier du projet
- Consultez les logs du serveur pour plus de détails

## 📞 Support

Pour toute question ou problème, consultez la documentation complète ou contactez l'administrateur système.

---

**Protection Civile de la Loire - Antenne de Saint-Étienne**
