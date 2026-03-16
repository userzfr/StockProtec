# 🛠️ Guide du Développeur - StockProtec avec SQLite

## 📋 Vue d'ensemble

Cette documentation explique l'architecture technique de StockProtec avec la base de données SQLite locale.

## 🏗️ Architecture

### Structure du projet

```
/
├── server/                    # Backend Node.js + Express
│   ├── database.js           # Configuration SQLite et création des tables
│   ├── migrate.js            # Script de migration depuis localStorage
│   └── server.js             # Serveur API Express
│
├── src/
│   ├── app/
│   │   ├── components/       # Composants React
│   │   ├── services/
│   │   │   └── api.ts        # Service API client
│   │   ├── hooks/
│   │   │   └── useApiConnection.ts  # Hook de connexion API
│   │   └── contexts/         # Contextes React
│
├── stockprotec.db            # Base de données SQLite (créée automatiquement)
└── package.json
```

## 🗄️ Base de Données SQLite

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
  date_creation TEXT DEFAULT (datetime('now'))
)
```

#### 2. bags (Sacs opérationnels)
```sql
CREATE TABLE bags (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  description TEXT,
  last_control_date TEXT,
  status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
  deployment_status TEXT CHECK(deployment_status IN ('present', 'deployed')),
  deployment_location TEXT,
  deployment_date TEXT,
  date_creation TEXT DEFAULT (datetime('now'))
)
```

#### 3. pockets (Poches)
```sql
CREATE TABLE pockets (
  id TEXT PRIMARY KEY,
  bag_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  ordre_affichage INTEGER,
  FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE
)
```

#### 4. bag_items (Items dans les sacs)
```sql
CREATE TABLE bag_items (
  id TEXT PRIMARY KEY,
  pocket_id TEXT NOT NULL,
  name TEXT NOT NULL,
  expected_quantity INTEGER NOT NULL,
  check_type TEXT NOT NULL CHECK(check_type IN ('button', 'quantity')),
  FOREIGN KEY (pocket_id) REFERENCES pockets(id) ON DELETE CASCADE
)
```

#### 5. pharmacy_products (Produits de pharmacie)
```sql
CREATE TABLE pharmacy_products (
  id TEXT PRIMARY KEY,
  nom_produit TEXT NOT NULL,
  code_barre TEXT UNIQUE NOT NULL,
  categorie TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  peremption_date TEXT,
  control_date TEXT,
  lot_number TEXT,
  date_creation TEXT DEFAULT (datetime('now'))
)
```

#### 6. operational_equipment (Matériel opérationnel)
```sql
CREATE TABLE operational_equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT CHECK(status IN ('ok', 'warning', 'critical')),
  control_date TEXT,
  peremption_date TEXT,
  date_creation TEXT DEFAULT (datetime('now'))
)
```

#### 7. control_history (Historique des contrôles)
```sql
CREATE TABLE control_history (
  id TEXT PRIMARY KEY,
  bag_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  control_type TEXT NOT NULL CHECK(control_type IN ('quick', 'departure', 'return')),
  deployment_location TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### 8. control_results (Résultats de contrôle)
```sql
CREATE TABLE control_results (
  id TEXT PRIMARY KEY,
  control_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('present', 'missing', 'damaged')),
  actual_quantity INTEGER,
  FOREIGN KEY (control_id) REFERENCES control_history(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES bag_items(id)
)
```

#### 9. system_logs (Logs système)
```sql
CREATE TABLE system_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT (datetime('now')),
  user_id TEXT,
  action TEXT NOT NULL,
  details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### 10. bug_reports (Rapports de bugs)
```sql
CREATE TABLE bug_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'ouvert' CHECK(status IN ('ouvert', 'en cours', 'résolu')),
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

#### 11. pharmacy_categories (Catégories de pharmacie)
```sql
CREATE TABLE pharmacy_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  date_creation TEXT DEFAULT (datetime('now'))
)
```

## 🔌 API Backend

### Configuration

Le serveur Express est configuré dans `/server/server.js` :
- **Port** : 3001 (par défaut)
- **CORS** : Activé pour permettre les requêtes depuis le frontend
- **Base de données** : Initialisée automatiquement au démarrage

### Endpoints principaux

#### Utilisateurs
- `GET /api/users` - Liste tous les utilisateurs
- `POST /api/users` - Crée un nouvel utilisateur
- `PUT /api/users/:id` - Met à jour un utilisateur
- `DELETE /api/users/:id` - Supprime un utilisateur

> ⚠️ Le système utilise le **nom d'utilisateur** comme identifiant de connexion. Les adresses email ne sont pas utilisées pour l'authentification.

#### Sacs
- `GET /api/bags` - Liste tous les sacs avec poches et items
- `GET /api/bags/qr/:qrCode` - Récupère un sac par QR code
- `POST /api/bags` - Crée un nouveau sac
- `PUT /api/bags/:id` - Met à jour un sac
- `DELETE /api/bags/:id` - Supprime un sac

#### Produits Pharmacie
- `GET /api/pharmacy-products` - Liste tous les produits
- `POST /api/pharmacy-products` - Crée un nouveau produit
- `PUT /api/pharmacy-products/:id` - Met à jour un produit
- `DELETE /api/pharmacy-products/:id` - Supprime un produit

#### Matériel Opérationnel
- `GET /api/operational-equipment` - Liste tout le matériel
- `POST /api/operational-equipment` - Crée un nouvel équipement
- `PUT /api/operational-equipment/:id` - Met à jour un équipement
- `DELETE /api/operational-equipment/:id` - Supprime un équipement

#### Historique de Contrôle
- `GET /api/control-history` - Liste tous les historiques
- `GET /api/control-history/bag/:bagId` - Historique d'un sac spécifique
- `POST /api/control-history` - Crée un nouveau contrôle

#### Logs
- `GET /api/logs` - Liste tous les logs
- `POST /api/logs` - Crée un nouveau log

#### Rapports de Bugs
- `GET /api/bug-reports` - Liste tous les rapports
- `POST /api/bug-reports` - Crée un nouveau rapport
- `PUT /api/bug-reports/:id` - Met à jour le statut d'un rapport

#### Catégories
- `GET /api/categories` - Liste toutes les catégories
- `POST /api/categories` - Crée une nouvelle catégorie
- `DELETE /api/categories/:id` - Supprime une catégorie

#### Migration
La migration depuis le localStorage n'est plus nécessaire : toutes les données sont désormais stockées directement dans la base de données SQLite côté serveur.

#### Santé
- `GET /api/health` - Vérifie l'état de l'API

## 🔧 Service API Client

Le service API client (`/src/app/services/api.ts`) fournit des fonctions pour chaque endpoint :

```typescript
import { bagsApi } from '@/app/services/api';

// Récupérer tous les sacs
const bags = await bagsApi.getAll();

// Créer un nouveau sac
await bagsApi.create({
  id: 'bag-123',
  name: 'Sac PSE1',
  qrCode: 'QR-001',
  pockets: [...]
});

// Mettre à jour un sac
await bagsApi.update('bag-123', {
  name: 'Sac PSE1 Modifié',
  status: 'ok'
});
```

## 🔄 Migration des Données

La migration depuis le localStorage n'est plus nécessaire : l'application utilise désormais une base de données SQLite partagée côté serveur pour stocker toutes les données.

## 🚀 Déploiement

### Développement

```bash
# Démarrer tout ensemble
npm run dev:all

# Ou séparément
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

### Production

```bash
# 1. Build du frontend
npm run build

# 2. Démarrer le serveur
npm run server

# 3. Servir les fichiers statiques avec un serveur web (nginx, apache, etc.)
```

### Variables d'environnement

Vous pouvez configurer :
- `PORT` : Port du serveur API (défaut: 3001)
- `DB_PATH` : Chemin vers la base de données (défaut: `./stockprotec.db`)

## 💾 Sauvegarde et Restauration

### Sauvegarde

Pour sauvegarder toutes les données, il suffit de copier le fichier :
```bash
cp stockprotec.db stockprotec-backup-$(date +%Y%m%d).db
```

### Restauration

Pour restaurer depuis une sauvegarde :
```bash
cp stockprotec-backup-20260310.db stockprotec.db
```

## 🔍 Débogage

### Logs du serveur

Le serveur affiche des logs dans la console :
```
🔧 Initialisation de la base de données SQLite...
✅ Base de données initialisée avec succès
🚀 Serveur API démarré sur http://localhost:3001
📊 Base de données : stockprotec.db
```

### Vérifier la base de données

Vous pouvez inspecter la base SQLite avec des outils comme :
- **DB Browser for SQLite** (GUI)
- **sqlite3** (CLI)

```bash
sqlite3 stockprotec.db
.tables
SELECT * FROM users;
```

## 🔐 Sécurité

⚠️ **Important** :
- Les mots de passe doivent être hashés avant d'être stockés
- Utilisez HTTPS en production
- Validez toutes les entrées utilisateur
- Limitez l'accès à la base de données

## 📚 Ressources

- [Better-SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Protection Civile de la Loire - Antenne de Saint-Étienne**
