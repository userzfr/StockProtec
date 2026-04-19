# 🗄️ Guide base de données - StockProtec v5.2

## 🎯 Vue d'ensemble

StockProtec v5.2 utilise SQLite comme système de base de données principal. Ce guide détaille la structure de la base de données, les migrations, et les bonnes pratiques d'utilisation.

## 🏗️ Architecture de la base de données

### Choix technologiques

#### SQLite : Pourquoi ?
- **Embarqué** : Pas de serveur séparé, base de données dans un fichier
- **Portable** : Fichier unique facile à sauvegarder/déplacer
- **Robuste** : ACID, transactions, contraintes d'intégrité
- **Performant** : Excellent pour applications mono-utilisateur
- **Zéro configuration** : Pas d'installation complexe

#### Configuration recommandée
```sql
-- Configuration pour de meilleures performances
PRAGMA foreign_keys = ON;        -- Contraintes d'intégrité
PRAGMA journal_mode = WAL;       -- Mode journal optimisé
PRAGMA synchronous = NORMAL;     -- Performance vs sécurité équilibrée
PRAGMA cache_size = 1000000;     -- Cache 1GB
PRAGMA temp_store = memory;      -- Tables temporaires en RAM
PRAGMA mmap_size = 268435456;    -- Memory mapping 256MB
```

## 📊 Schéma de base de données

### Tables principales

#### Utilisateurs (`users`)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

**Contraintes :**
- `username` UNIQUE : Un seul compte par nom d'utilisateur
- `role` CHECK : Valeurs autorisées uniquement
- `is_active` : Suppression logique

**Index :**
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### Catégories (`categories`)
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  parent_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

**Contraintes :**
- `parent_id` : Référence circulaire pour hiérarchie
- `ON DELETE CASCADE` : Suppression en cascade des sous-catégories

**Index :**
```sql
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
```

#### Produits (`products`)
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER,
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pièces',
  barcode TEXT UNIQUE,
  batch_number TEXT,
  expiration_date DATE,
  supplier TEXT,
  location TEXT,
  price DECIMAL(10,2),
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**Contraintes :**
- `quantity` : Stock actuel (calculé via mouvements)
- `min_quantity`, `max_quantity` : Seuils d'alerte
- `barcode` UNIQUE : Un seul produit par code-barres
- `is_active` : Suppression logique

**Index :**
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_expiration ON products(expiration_date);
CREATE INDEX idx_products_supplier ON products(supplier);
```

#### Mouvements (`movements`)
```sql
CREATE TABLE movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'TRANSFER')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  user_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Contraintes :**
- `type` CHECK : Types de mouvement autorisés
- `quantity` : Quantité affectée (positive pour IN, négative pour OUT)

**Index :**
```sql
CREATE INDEX idx_movements_product ON movements(product_id);
CREATE INDEX idx_movements_type ON movements(type);
CREATE INDEX idx_movements_date ON movements(created_at);
CREATE INDEX idx_movements_user ON movements(user_id);
```

#### Logs d'audit (`audit_logs`)
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Index :**
```sql
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
```

### Tables de configuration

#### Paramètres système (`system_settings`)
```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Sessions utilisateur (`user_sessions`)
```sql
CREATE TABLE user_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔄 Système de migrations

### Structure des migrations

#### Fichier de migration
```javascript
// server/migrations/001_initial_schema.js
module.exports = {
  up: async (db) => {
    // Création des tables
    await db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Création des index
    await db.run(`CREATE INDEX idx_users_username ON users(username)`);

    // Insertion de données initiales
    await db.run(`
      INSERT INTO users (username, password, role)
      VALUES ('admin', '$2b$10$...', 'admin')
    `);
  },

  down: async (db) => {
    // Suppression des tables (dans l'ordre inverse)
    await db.run(`DROP TABLE IF EXISTS users`);
  }
};
```

#### Table de suivi des migrations
```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Exécution des migrations

#### Script de migration
```javascript
// server/migrate.js
const fs = require('fs');
const path = require('path');
const db = require('./database');

async function runMigrations() {
  try {
    // Création de la table migrations si elle n'existe pas
    await db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Récupération des migrations déjà exécutées
    const executedMigrations = await db.all(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Récupération des fichiers de migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Exécution des migrations non exécutées
    for (const file of migrationFiles) {
      if (!executedNames.includes(file)) {
        console.log(`Exécution de la migration: ${file}`);

        const migration = require(path.join(migrationsDir, file));

        if (migration.up) {
          await migration.up(db);
          await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
          console.log(`✅ Migration ${file} exécutée`);
        }
      }
    }

    console.log('Toutes les migrations ont été exécutées');

  } catch (error) {
    console.error('Erreur lors des migrations:', error);
    process.exit(1);
  }
}

// Fonction rollback (optionnel)
async function rollbackMigrations(steps = 1) {
  try {
    const executedMigrations = await db.all(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT ?',
      [steps]
    );

    for (const migration of executedMigrations) {
      console.log(`Rollback de la migration: ${migration.name}`);

      const migrationModule = require(path.join(__dirname, 'migrations', migration.name));

      if (migrationModule.down) {
        await migrationModule.down(db);
        await db.run('DELETE FROM migrations WHERE name = ?', [migration.name]);
        console.log(`✅ Rollback ${migration.name} effectué`);
      }
    }

  } catch (error) {
    console.error('Erreur lors du rollback:', error);
    process.exit(1);
  }
}

// Interface CLI
const command = process.argv[2];
switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    const steps = parseInt(process.argv[3]) || 1;
    rollbackMigrations(steps);
    break;
  case 'status':
    showMigrationStatus();
    break;
  default:
    console.log('Usage: node migrate.js [up|down|status] [steps]');
}
```

## 🌱 Données de test (Seed)

### Script de seed
```javascript
// server/seed.js
const db = require('./database');
const { hashPassword } = require('./password');

async function seedDatabase() {
  try {
    console.log('🌱 Début du seeding...');

    // Utilisateurs de test
    const hashedPassword = await hashPassword('admin123');

    await db.run(`
      INSERT OR IGNORE INTO users (username, password, role, email)
      VALUES
        ('admin', ?, 'admin', 'admin@stockprotec.local'),
        ('user', ?, 'user', 'user@stockprotec.local')
    `, [hashedPassword, hashedPassword]);

    // Catégories de test
    const categories = [
      { name: 'Médicaments', description: 'Produits pharmaceutiques', color: '#FF6B6B' },
      { name: 'Matériel médical', description: 'Équipements médicaux', color: '#4ECDC4' },
      { name: 'Consommables', description: 'Matériel à usage unique', color: '#45B7D1' }
    ];

    for (const category of categories) {
      await db.run(`
        INSERT OR IGNORE INTO categories (name, description, color)
        VALUES (?, ?, ?)
      `, [category.name, category.description, category.color]);
    }

    // Produits de test
    const products = [
      {
        name: 'Paracétamol 500mg',
        description: 'Antalgique et antipyrétique',
        category_id: 1,
        quantity: 150,
        unit: 'comprimés',
        barcode: '3400930001234',
        supplier: 'Pharmacie Centrale',
        min_quantity: 50,
        max_quantity: 300
      },
      {
        name: 'Bandage élastique 5cm',
        description: 'Bandage de contention',
        category_id: 2,
        quantity: 25,
        unit: 'rouleaux',
        barcode: '3400940005678',
        supplier: 'Matériel Médical SA',
        min_quantity: 10,
        max_quantity: 100
      }
    ];

    for (const product of products) {
      await db.run(`
        INSERT OR IGNORE INTO products
        (name, description, category_id, quantity, unit, barcode, supplier, min_quantity, max_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name, product.description, product.category_id, product.quantity,
        product.unit, product.barcode, product.supplier, product.min_quantity, product.max_quantity
      ]);
    }

    console.log('✅ Seeding terminé');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
```

## 🔍 Optimisations de performance

### Index stratégiques

#### Index pour les requêtes fréquentes
```sql
-- Recherche de produits
CREATE INDEX idx_products_search ON products(name, description);

-- Jointures catégories-produits
CREATE INDEX idx_products_category_quantity ON products(category_id, quantity);

-- Historique des mouvements
CREATE INDEX idx_movements_product_date ON movements(product_id, created_at DESC);

-- Audit récent
CREATE INDEX idx_audit_recent ON audit_logs(created_at DESC, user_id);
```

#### Index composites pour les filtres
```sql
-- Filtres avancés
CREATE INDEX idx_products_filters ON products(
  category_id, supplier, expiration_date, quantity
);

-- Statistiques par période
CREATE INDEX idx_movements_stats ON movements(
  type, created_at, product_id
);
```

### Optimisations des requêtes

#### Pagination efficace
```sql
-- Au lieu de LIMIT/OFFSET (lent)
SELECT * FROM products ORDER BY id LIMIT 50 OFFSET 1000;

-- Utiliser les index (rapide)
SELECT * FROM products WHERE id > ? ORDER BY id LIMIT 50;
```

#### Requêtes optimisées
```javascript
// Comptage optimisé
const count = await db.get(`
  SELECT COUNT(*) as total
  FROM products
  WHERE is_active = 1
`);

// Jointure optimisée
const productsWithCategory = await db.all(`
  SELECT p.*, c.name as category_name, c.color as category_color
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = 1
  ORDER BY p.name
`);

// Recherche avec LIKE optimisé
const searchResults = await db.all(`
  SELECT * FROM products
  WHERE name LIKE ? OR description LIKE ?
  ORDER BY name
`, [`%${searchTerm}%`, `%${searchTerm}%`]);
```

### Maintenance de la base

#### VACUUM et ANALYZE
```sql
-- Récupération d'espace
VACUUM;

-- Mise à jour des statistiques
ANALYZE;

-- Maintenance complète
VACUUM INTO 'backup.db';
```

#### Vérification d'intégrité
```sql
-- Vérification rapide
PRAGMA integrity_check;

-- Vérification complète
PRAGMA integrity_check(100);

-- Réparation si nécessaire
PRAGMA foreign_key_check;
```

## 🔐 Sécurité de la base de données

### Protection des données sensibles

#### Chiffrement des mots de passe
```javascript
// Dans password.js
const crypto = require('crypto');

async function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return hash.toString('hex') === hashHex;
}
```

#### Sanitisation des entrées
```javascript
// Middleware de sanitisation
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.replace(/[<>'"&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char];
    });
  }
  return input;
};
```

### Contrôle d'accès

#### Vues pour la sécurité
```sql
-- Vue pour utilisateurs non-admin
CREATE VIEW user_products AS
SELECT id, name, description, category_id, quantity, unit,
       barcode, supplier, location, min_quantity, max_quantity,
       created_at, updated_at
FROM products
WHERE is_active = 1;

-- Vue pour statistiques publiques
CREATE VIEW public_stats AS
SELECT
  COUNT(*) as total_products,
  SUM(quantity) as total_quantity,
  COUNT(CASE WHEN quantity <= min_quantity THEN 1 END) as low_stock
FROM products
WHERE is_active = 1;
```

#### Triggers d'audit
```sql
-- Trigger pour audit des modifications
CREATE TRIGGER audit_products_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (
    (SELECT id FROM users WHERE username = 'current_user'),
    'UPDATE',
    'products',
    NEW.id,
    json_object(
      'name', OLD.name,
      'quantity', OLD.quantity,
      'category_id', OLD.category_id
    ),
    json_object(
      'name', NEW.name,
      'quantity', NEW.quantity,
      'category_id', NEW.category_id
    )
  );
END;
```

## 📊 Requêtes complexes

### Statistiques avancées

#### Évolution des stocks
```sql
SELECT
  DATE(created_at) as date,
  SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as entries,
  SUM(CASE WHEN type = 'OUT' THEN -quantity ELSE 0 END) as exits,
  SUM(CASE WHEN type = 'IN' THEN quantity WHEN type = 'OUT' THEN -quantity ELSE 0 END)
    OVER (ORDER BY DATE(created_at)) as running_total
FROM movements
WHERE created_at >= date('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY date;
```

#### Produits les plus utilisés
```sql
SELECT
  p.name,
  p.barcode,
  SUM(ABS(m.quantity)) as total_movements,
  COUNT(m.id) as movement_count,
  MAX(m.created_at) as last_movement
FROM products p
LEFT JOIN movements m ON p.id = m.product_id
WHERE p.is_active = 1
  AND m.created_at >= date('now', '-90 days')
GROUP BY p.id, p.name, p.barcode
ORDER BY total_movements DESC
LIMIT 10;
```

#### Alertes de péremption
```sql
SELECT
  name,
  expiration_date,
  quantity,
  supplier,
  CASE
    WHEN expiration_date < date('now') THEN 'Périmé'
    WHEN expiration_date < date('now', '+30 days') THEN 'Bientôt périmé'
    WHEN expiration_date < date('now', '+90 days') THEN 'À surveiller'
    ELSE 'OK'
  END as status,
  julianday(expiration_date) - julianday('now') as days_remaining
FROM products
WHERE is_active = 1
  AND expiration_date IS NOT NULL
  AND expiration_date < date('now', '+90 days')
ORDER BY expiration_date;
```

### Rapports métier

#### Valeur du stock par catégorie
```sql
SELECT
  c.name as category,
  c.color,
  COUNT(p.id) as product_count,
  SUM(p.quantity * p.price) as total_value,
  AVG(p.quantity) as avg_quantity,
  MIN(p.quantity) as min_quantity,
  MAX(p.quantity) as max_quantity
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
WHERE c.is_active = 1
GROUP BY c.id, c.name, c.color
ORDER BY total_value DESC;
```

#### Analyse des fournisseurs
```sql
SELECT
  supplier,
  COUNT(DISTINCT id) as product_types,
  SUM(quantity) as total_quantity,
  AVG(price) as avg_price,
  SUM(quantity * price) as total_value,
  MAX(created_at) as last_restock,
  COUNT(CASE WHEN quantity <= min_quantity THEN 1 END) as low_stock_products
FROM products
WHERE is_active = 1 AND supplier IS NOT NULL
GROUP BY supplier
ORDER BY total_value DESC;
```

## 🔄 Export et import

### Export de données

#### Export JSON complet
```javascript
const exportDatabase = async () => {
  const tables = ['users', 'categories', 'products', 'movements'];

  const export = {
    metadata: {
      version: '5.2.0',
      exportedAt: new Date().toISOString(),
      tables: tables
    },
    data: {}
  };

  for (const table of tables) {
    export.data[table] = await db.all(`SELECT * FROM ${table}`);
  }

  return JSON.stringify(export, null, 2);
};
```

#### Export CSV
```javascript
const exportToCSV = async (tableName) => {
  const rows = await db.all(`SELECT * FROM ${tableName}`);
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');

  return csvContent;
};
```

### Import de données

#### Import avec validation
```javascript
const importProducts = async (productsData) => {
  const db = await db.transaction();

  try {
    for (const product of productsData) {
      // Validation des données
      if (!product.name || !product.category_id) {
        throw new Error(`Produit invalide: ${JSON.stringify(product)}`);
      }

      // Vérification de l'existence de la catégorie
      const category = await db.get('SELECT id FROM categories WHERE id = ?', [product.category_id]);
      if (!category) {
        throw new Error(`Catégorie ${product.category_id} inexistante`);
      }

      // Insertion
      await db.run(`
        INSERT INTO products (name, description, category_id, quantity, unit, barcode, supplier)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name,
        product.description || '',
        product.category_id,
        product.quantity || 0,
        product.unit || 'pièces',
        product.barcode || null,
        product.supplier || null
      ]);
    }

    await db.commit();
    console.log(`${productsData.length} produits importés`);

  } catch (error) {
    await db.rollback();
    throw error;
  }
};
```

## 📈 Monitoring et maintenance

### Métriques de performance

#### Statistiques de la base
```sql
-- Taille de la base
SELECT page_count * page_size as size_bytes FROM pragma_page_count(), pragma_page_size();

-- Tables les plus volumineuses
SELECT name, SUM(pgsize) as size
FROM dbstat
GROUP BY name
ORDER BY size DESC;

-- Index les plus utilisés
SELECT name, stat.get as gets, stat.miss as misses
FROM sqlite_stat1 stat
JOIN sqlite_master m ON stat.tbl = m.name
WHERE m.type = 'index';
```

#### Optimisations recommandées
```javascript
// Analyse des requêtes lentes
const slowQueries = await db.all(`
  SELECT sql, execution_time
  FROM sqlite_stat4
  WHERE execution_time > 1000
  ORDER BY execution_time DESC
`);

// Recommandations d'index
const missingIndexes = await db.all(`
  SELECT sql
  FROM sqlite_stat1
  WHERE stat IS NULL OR stat LIKE '%no index%'
`);
```

### Sauvegarde et restauration

#### Sauvegarde cohérente
```bash
# Sauvegarde avec verrouillage
sqlite3 stockprotec.db ".backup backup.db"

# Ou via script
const backupDatabase = async () => {
  // Arrêter les écritures
  await db.run('BEGIN IMMEDIATE');

  // Copie du fichier
  const fs = require('fs');
  fs.copyFileSync('server/stockprotec.db', `backups/backup-${Date.now()}.db`);

  // Reprendre les écritures
  await db.run('COMMIT');
};
```

#### Restauration
```bash
# Restauration depuis sauvegarde
cp backup-1640995200000.db server/stockprotec.db

# Vérification d'intégrité
sqlite3 server/stockprotec.db "PRAGMA integrity_check;"

# Rebuild des index si nécessaire
sqlite3 server/stockprotec.db "REINDEX;"
```

---

*Guide base de données - StockProtec v5.2.0*
*Schéma validé et optimisé - Avril 2026*

**Pour les questions techniques :** Consulter le [guide développeur](DEVELOPER_GUIDE.md)