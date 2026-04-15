# 👨‍💻 Guide Développeur - StockProtec v5

## ⚠️ Versions supportées

- ✅ **StockProtec v5** : Seule version supportée
- ❌ Versions antérieures : Non supportées

> **Important** : Ce guide concerne uniquement le développement sur v5.

## 🏗️ Architecture technique

### Stack technologique
- **Frontend** : React 18 + TypeScript + Vite
- **Backend** : Node.js + Express + SQLite
- **UI** : Tailwind CSS + shadcn/ui
- **Base de données** : SQLite3 (fichier local)

### Structure du projet
```
StockProtec/
├── src/                          # Frontend
│   ├── main.tsx                  # Point d'entrée
│   ├── app/
│   │   ├── App.tsx               # App principale
│   │   ├── routes.ts             # Configuration routes
│   │   ├── components/           # Composants React
│   │   ├── contexts/             # Contextes React
│   │   ├── services/             # Services API
│   │   └── utils/                # Utilitaires
├── server/                       # Backend
│   ├── server.js                 # API Express
│   ├── database.js               # SQLite setup
│   ├── migrate.js                # Migrations
│   └── seed.js                   # Données test
├── stockprotec.db               # Base SQLite
└── package.json                  # Dépendances
```

## 🚀 Démarrage développement

### Installation
```bash
git clone https://github.com/mathieu-bergeron/StockProtec.git
cd StockProtec
npm install
```

### Développement
```bash
# Frontend + Backend
npm run dev:all

# Ou séparément:
npm run dev      # Frontend :5173
npm run server   # Backend :3001
```

### Build production
```bash
npm run build    # Build frontend
npm run preview  # Test build local
```

## 🔧 Configuration

### Vite (Frontend)
- **Port** : 5173
- **Proxy API** : `/api/*` → `http://localhost:3001`
- **Alias** : `@/` → `src/`

### Express (Backend)
- **Port** : 3001
- **CORS** : Autorise localhost:5173
- **Base** : SQLite `stockprotec.db`

### Base de données
- **Type** : SQLite3
- **Fichier** : `stockprotec.db` (auto-créé)
- **Migrations** : Automatiques au démarrage

## 📡 API Endpoints

### Base URL: `http://localhost:3001/api`

### Bags (Sacs)
```
GET    /bags              # Liste tous les sacs
POST   /bags              # Créer un sac
PUT    /bags/:id          # Modifier un sac
DELETE /bags/:id          # Supprimer un sac
GET    /bags/:id          # Détails d'un sac
```

### Categories
```
GET    /categories        # Liste catégories
POST   /categories        # Créer catégorie
PUT    /categories/:id    # Modifier catégorie
DELETE /categories/:id    # Supprimer catégorie
```

### Pharmacy Products
```
GET    /pharmacy-products  # Liste produits
POST   /pharmacy-products  # Créer produit
PUT    /pharmacy-products/:id  # Modifier
DELETE /pharmacy-products/:id  # Supprimer
```

### Authentification
```
POST   /auth/login        # Connexion
POST   /auth/logout       # Déconnexion
GET    /auth/me           # Info utilisateur
```

### Migration
```
POST   /migrate           # Migrer localStorage → SQLite
```

## 🗄️ Schéma base de données

### Tables principales
```sql
-- Sacs de secours
CREATE TABLE bags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  deployment_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Catégories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Produits pharmacie
CREATE TABLE pharmacy_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  expiration_date DATE,
  lot_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateurs
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs d'audit
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  user_id TEXT,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Migration localStorage → SQLite

### Déclenchement automatique
- Détecte les données `localStorage` au démarrage
- Ouvre `MigrationDialog` automatiquement
- Migration en un clic

### Données migrées
- `bags` → table `bags`
- `categories` → table `categories`
- `pharmacyProducts` → table `pharmacy_products`
- `users` → table `users`

### Post-migration
- `localStorage` nettoyé (sauf `authState`)
- Base SQLite créée/populée
- Confirmation utilisateur

## 🧪 Tests et validation

### Tests automatiques
```bash
npm test          # Tests unitaires
npm run test:e2e  # Tests end-to-end
```

### Tests manuels
- Créer/Modifier/Supprimer des entités
- Vérifier persistance après refresh
- Tester l'authentification
- Valider les migrations

### Debugging
```javascript
// Console navigateur (F12)
// Logs API: 📤 [API] POST /api/bags
// Logs erreurs: ❌ [API] Erreur 500

// Terminal backend
// Logs SQL et erreurs détaillées
```

## 🚀 Déploiement

### Build production
```bash
npm run build
# Génère dist/ avec assets optimisés
```

### Déploiement local
```bash
# Servir le build
npm run preview  # Vite preview server

# Ou avec un serveur static
npx serve dist
```

### Variables environnement
- Pas de variables requises pour usage standard
- Configuration en dur dans le code

## 🔒 Sécurité

### Authentification
- Sessions basées sur `localStorage.authState`
- Mots de passe hashés (bcrypt)
- Routes API protégées

### Données sensibles
- Rien en localStorage (sauf session)
- Base SQLite chiffrable si besoin
- Pas de données envoyées à des serveurs externes

### CORS et headers
- CORS configuré pour développement local
- Headers de sécurité basiques
- Rate limiting non implémenté

## 📈 Performance

### Optimisations frontend
- Vite HMR (Hot Module Replacement)
- Tree shaking automatique
- Code splitting avec dynamic imports

### Optimisations backend
- SQLite optimisé pour lectures/écritures locales
- Requêtes préparées
- Indexes sur les clés étrangères

### Métriques
- Taille bundle : ~600KB gzippé
- Temps de build : ~10s
- Démarrage serveur : ~2s

## 🐛 Debugging et maintenance

### Logs
- **Frontend** : Console navigateur
- **Backend** : Terminal serveur
- **Base** : Requêtes SQL loggées

### Outils de développement
- React DevTools
- SQLite Browser (pour inspection DB)
- VS Code extensions recommandées

### Commandes utiles
```bash
# Inspecter la base
sqlite3 stockprotec.db
.tables
.schema bags
SELECT * FROM bags LIMIT 5;

# Reset base de données
rm stockprotec.db
npm run server  # Recréé automatiquement

# Nettoyer cache
npm run clean
rm -rf node_modules/.vite
```

## 📚 Ressources complémentaires

- [QUICKSTART.md](QUICKSTART.md) : Démarrage rapide
- [INSTALLATION.md](INSTALLATION.md) : Installation détaillée
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) : Guide migration
- [GUIDE_BASE_DONNEES.md](GUIDE_BASE_DONNEES.md) : Schéma base de données