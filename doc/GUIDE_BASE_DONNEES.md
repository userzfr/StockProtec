# 🗄️ Guide Base de Données - StockProtec v5

## ⚠️ Versions supportées

- ✅ **StockProtec v5** : Seule version supportée
- ❌ Versions antérieures : Non supportées

## 📊 Architecture base de données

### Type de base
- **SQLite3** : Base de données fichier locale
- **Fichier** : `stockprotec.db`
- **Création** : Automatique au premier lancement

### Avantages SQLite
- Pas de serveur séparé requis
- Fichier portable
- ACID compliant
- Performant pour usage local

## 🏗️ Schéma complet

### Table: bags (Sacs de secours)
```sql
CREATE TABLE bags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  deployment_status TEXT CHECK(deployment_status IN ('present', 'deployed', 'maintenance')),
  location TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performances
CREATE INDEX idx_bags_qr_code ON bags(qr_code);
CREATE INDEX idx_bags_status ON bags(deployment_status);
```

### Table: categories (Catégories d'équipements)
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,  -- Pour UI
  icon TEXT,   -- Pour UI
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_categories_name ON categories(name);
```

### Table: pharmacy_products (Produits pharmacie)
```sql
CREATE TABLE pharmacy_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'unités',
  lot_number TEXT,
  expiration_date DATE,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  location TEXT,
  supplier TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherches fréquentes
CREATE INDEX idx_pharmacy_name ON pharmacy_products(name);
CREATE INDEX idx_pharmacy_category ON pharmacy_products(category);
CREATE INDEX idx_pharmacy_expiration ON pharmacy_products(expiration_date);
CREATE INDEX idx_pharmacy_lot ON pharmacy_products(lot_number);
```

### Table: operational_equipment (Équipements opérationnels)
```sql
CREATE TABLE operational_equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT,
  serial_number TEXT UNIQUE,
  status TEXT CHECK(status IN ('active', 'maintenance', 'retired')),
  location TEXT,
  last_inspection DATE,
  next_inspection DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Index
CREATE INDEX idx_equipment_category ON operational_equipment(category_id);
CREATE INDEX idx_equipment_status ON operational_equipment(status);
CREATE INDEX idx_equipment_inspection ON operational_equipment(next_inspection);
```

### Table: users (Utilisateurs)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user', 'viewer')),
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### Table: logs (Historique d'audit)
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,  -- CREATE, UPDATE, DELETE, LOGIN, etc.
  entity_type TEXT NOT NULL,  -- bags, pharmacy_products, etc.
  entity_id TEXT,
  user_id TEXT,
  details TEXT,  -- JSON avec changements
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour audit
CREATE INDEX idx_logs_entity ON logs(entity_type, entity_id);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
```

### Table: inspections (Contrôles périodiques)
```sql
CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  inspector_id TEXT,
  inspection_date DATE NOT NULL,
  status TEXT CHECK(status IN ('passed', 'failed', 'pending')),
  notes TEXT,
  next_inspection DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES operational_equipment(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- Index
CREATE INDEX idx_inspections_equipment ON inspections(equipment_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
```

## 🔄 Migrations

### Système de migration
- **Fichier** : `server/migrate.js`
- **Déclenchement** : Automatique au démarrage serveur
- **Versioning** : Basé sur numéro de version

### Migration localStorage → SQLite
```javascript
// Données migrées automatiquement
const migrations = {
  bags: localStorage.getItem('bags'),
  categories: localStorage.getItem('categories'),
  pharmacyProducts: localStorage.getItem('pharmacyProducts'),
  users: localStorage.getItem('users')
};
```

### Structure migration
1. **Détection** : Présence de données localStorage
2. **Validation** : Format JSON valide
3. **Transformation** : Adapté au schéma SQLite
4. **Insertion** : Bulk insert avec transactions
5. **Nettoyage** : Suppression localStorage (sauf authState)
6. **Confirmation** : Toast utilisateur

## 📈 Requêtes fréquentes

### Statistiques générales
```sql
-- Nombre total de sacs
SELECT COUNT(*) as total_bags FROM bags;

-- Sacs par statut
SELECT deployment_status, COUNT(*) as count
FROM bags
GROUP BY deployment_status;

-- Produits proches de péremption (30 jours)
SELECT name, expiration_date, quantity
FROM pharmacy_products
WHERE expiration_date <= date('now', '+30 days')
ORDER BY expiration_date;
```

### Recherches et filtres
```sql
-- Recherche sacs par nom/QR
SELECT * FROM bags
WHERE name LIKE '%search%' OR qr_code LIKE '%search%';

-- Produits par catégorie avec stock faible
SELECT name, quantity, min_stock
FROM pharmacy_products
WHERE quantity <= min_stock
ORDER BY category, name;
```

### Audit et historique
```sql
-- Dernières actions d'un utilisateur
SELECT action, entity_type, entity_id, timestamp
FROM logs
WHERE user_id = ?
ORDER BY timestamp DESC
LIMIT 50;

-- Historique d'un sac
SELECT action, details, timestamp, u.username
FROM logs l
LEFT JOIN users u ON l.user_id = u.id
WHERE entity_type = 'bags' AND entity_id = ?
ORDER BY timestamp DESC;
```

## 🔧 Maintenance base de données

### Sauvegarde
```bash
# Copie simple du fichier
cp stockprotec.db stockprotec.backup.db

# Export SQL
sqlite3 stockprotec.db .dump > backup.sql
```

### Restauration
```bash
# Remplacer le fichier
cp stockprotec.backup.db stockprotec.db

# Import SQL
sqlite3 stockprotec.db < backup.sql
```

### Optimisation
```sql
-- Vacuum pour réduire taille fichier
VACUUM;

-- Analyser statistiques pour optimiseur
ANALYZE;

-- Vérifier intégrité
PRAGMA integrity_check;
```

### Reset complet
```bash
# Supprimer et recréer
rm stockprotec.db
npm run server  # Recréé automatiquement avec schéma
```

## 🧪 Tests et validation

### Vérifications automatiques
```bash
# Structure des tables
sqlite3 stockprotec.db ".schema"

# Comptage des enregistrements
sqlite3 stockprotec.db "SELECT 'bags: ' || COUNT(*) FROM bags;"

# Intégrité référentielle
sqlite3 stockprotec.db "PRAGMA foreign_key_check;"
```

### Tests de performance
```sql
-- Temps d'exécution requête
.timer ON
SELECT COUNT(*) FROM logs WHERE timestamp > '2024-01-01';

-- Plan d'exécution
.explain QUERY PLAN
SELECT * FROM bags WHERE deployment_status = 'present';
```

## 🔒 Sécurité base de données

### Chiffrement (optionnel)
SQLite supporte le chiffrement via extension :
- SQLCipher pour chiffrement AES
- Configuration dans `database.js`

### Permissions fichier
- `stockprotec.db` : Lecture/écriture propriétaire uniquement
- Pas d'accès réseau (base locale uniquement)

### Injection SQL
- Utilisation de requêtes préparées
- Validation des entrées utilisateur
- Sanitisation automatique via SQLite3

## 📊 Métriques et monitoring

### Taille base
```sql
-- Taille fichier
SELECT file_size('stockprotec.db') / 1024.0 / 1024.0 || ' MB' as size_mb;

-- Taille par table
SELECT name, SUM(pgsize) / 1024.0 / 1024.0 || ' MB' as size_mb
FROM dbstat
GROUP BY name
ORDER BY SUM(pgsize) DESC;
```

### Statistiques usage
```sql
-- Activité récente
SELECT entity_type, action, COUNT(*) as count
FROM logs
WHERE timestamp > datetime('now', '-7 days')
GROUP BY entity_type, action
ORDER BY count DESC;

-- Utilisateurs actifs
SELECT u.username, COUNT(l.id) as actions
FROM users u
LEFT JOIN logs l ON u.id = l.user_id
WHERE l.timestamp > datetime('now', '-30 days')
GROUP BY u.id, u.username
ORDER BY actions DESC;
```

## 📚 Ressources complémentaires

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) : Guide développeur
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) : Guide migration
- [QUICKSTART.md](QUICKSTART.md) : Démarrage rapide