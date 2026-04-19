# 🛠️ Guide développeur - StockProtec v5.2

## 🎯 Vue d'ensemble

Ce guide s'adresse aux développeurs souhaitant contribuer à StockProtec v5.2, comprendre son architecture, ou l'étendre. StockProtec est une application web moderne utilisant React, Node.js et SQLite.

## 🏗️ Architecture technique

### Stack technologique

#### Frontend
- **React 18** : Bibliothèque UI moderne
- **TypeScript** : Typage strict pour la robustesse
- **Vite** : Outil de build rapide et optimisé
- **Tailwind CSS** : Framework CSS utilitaire
- **React Router** : Gestion du routing
- **Context API** : Gestion d'état globale

#### Backend
- **Node.js 18+** : Runtime JavaScript serveur
- **Express.js** : Framework web minimaliste
- **SQLite 3** : Base de données embarquée
- **JWT** : Authentification stateless
- **bcrypt** : Hashage des mots de passe
- **CORS** : Gestion des requêtes cross-origin

#### Outils de développement
- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **Jest** : Tests unitaires
- **SQLite3** : Outil de base de données

### Structure du projet

```
StockProtec/
├── src/                    # Code source frontend
│   ├── main.tsx           # Point d'entrée React
│   ├── app/               # Application principale
│   │   ├── App.tsx        # Composant racine
│   │   ├── routes.ts      # Configuration des routes
│   │   ├── components/    # Composants React
│   │   ├── contexts/      # Contextes React
│   │   ├── hooks/         # Hooks personnalisés
│   │   └── services/      # Services API
│   ├── styles/            # Styles CSS
│   └── imports/           # Imports et types
├── server/                # Code source backend
│   ├── server.js          # Serveur Express principal
│   ├── database.js        # Gestion de la base de données
│   ├── backup.js          # Système de sauvegarde
│   ├── migrate.js         # Migrations de base de données
│   ├── seed.js            # Données de test
│   └── password.js        # Utilitaires de sécurité
├── public/                # Assets statiques
├── docs/                  # Documentation
├── scripts/               # Scripts utilitaires
└── package.json           # Configuration npm
```

## 🚀 Démarrage du développement

### Prérequis
```bash
# Node.js 18+
node --version

# npm 8+
npm --version

# Git
git --version
```

### Installation
```bash
# Clonage du dépôt
git clone https://github.com/userzfr/StockProtec.git
cd StockProtec

# Installation des dépendances
npm run setup

# Configuration de la base de données
npm run migrate

# (Optionnel) Données de test
npm run seed
```

### Démarrage en développement
```bash
# Frontend + Backend simultanément
npm run dev:all

# Ou séparément
npm run dev      # Frontend (Vite)
npm run server:dev  # Backend (avec nodemon)
```

### Tests
```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration
```

## 🔧 Développement frontend

### Structure des composants

#### Anatomie d'un composant
```tsx
// components/ProductCard.tsx
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onEdit(product)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};
```

#### Gestion d'état avec Context

```tsx
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérification du token au démarrage
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Identifiants incorrects');
    }

    const data = await response.json();
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
```

### Services API

```tsx
// services/api.ts
const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur API');
    }

    return response.json();
  }

  // Produits
  async getProducts(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams(params as any);
    return this.request(`/products?${query}`);
  }

  async createProduct(product: Omit<Product, 'id'>) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  }

  async updateProduct(id: number, product: Partial<Product>) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Catégories
  async getCategories() {
    return this.request('/categories');
  }

  // Utilisateurs (admin uniquement)
  async getUsers() {
    return this.request('/users');
  }

  // Sauvegarde (admin uniquement)
  async createBackup(name?: string) {
    return this.request('/backup/create', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }
}

export const api = new ApiService();
```

### Hooks personnalisés

```tsx
// hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data: T; message?: string }>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiCall();
      if (response.success) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: response.message || 'Erreur inconnue' });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// Utilisation
const { data: products, loading, error, refetch } = useApi(
  () => api.getProducts({ page: 1, limit: 20 }),
  []
);
```

## 🔧 Développement backend

### Structure du serveur Express

```javascript
// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de base
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:5173']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token d\'authentification requis' }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { message: 'Token invalide' }
      });
    }
    req.user = user;
    next();
  });
};

// Middleware d'autorisation admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Accès administrateur requis' }
    });
  }
  next();
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/categories', authenticateToken, require('./routes/categories'));
app.use('/api/users', authenticateToken, requireAdmin, require('./routes/users'));
app.use('/api/backup', authenticateToken, requireAdmin, require('./routes/backup'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '5.2.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Erreur interne du serveur'
        : err.message
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
```

### Gestion de la base de données

```javascript
// server/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      path.join(__dirname, 'stockprotec.db'),
      (err) => {
        if (err) {
          console.error('Erreur de connexion à la base de données:', err);
        } else {
          console.log('Connecté à la base de données SQLite');
        }
      }
    );

    // Configuration pour de meilleures performances
    this.db.run('PRAGMA foreign_keys = ON');
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 1000000');
    this.db.run('PRAGMA temp_store = memory');
  }

  // Méthode utilitaire pour les requêtes
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Transactions
  async transaction(callback) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        Promise.resolve(callback(this))
          .then(result => {
            this.db.run('COMMIT');
            resolve(result);
          })
          .catch(error => {
            this.db.run('ROLLBACK');
            reject(error);
          });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
```

### Système d'authentification

```javascript
// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { hashPassword, verifyPassword } = require('../password');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Nom d\'utilisateur et mot de passe requis' }
      });
    }

    // Recherche de l'utilisateur
    const user = await db.get(
      'SELECT id, username, password, role, is_active, last_login FROM users WHERE username = ?',
      [username]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants incorrects' }
      });
    }

    // Vérification du mot de passe
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants incorrects' }
      });
    }

    // Mise à jour de la dernière connexion
    await db.run(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );

    // Génération du token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Log de l'authentification
    console.log(`Utilisateur ${username} connecté`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          lastLogin: user.last_login
        },
        token
      },
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur interne du serveur' }
    });
  }
});

// Vérification du token
router.get('/me', async (req, res) => {
  try {
    // Le middleware authenticateToken a déjà vérifié le token
    const user = await db.get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Utilisateur non trouvé' }
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur de récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur interne du serveur' }
    });
  }
});

// Changement de mot de passe
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mot de passe actuel et nouveau requis' }
      });
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Le mot de passe doit contenir au moins 8 caractères' }
      });
    }

    // Récupération de l'utilisateur
    const user = await db.get(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    // Vérification de l'ancien mot de passe
    const isValidCurrentPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mot de passe actuel incorrect' }
      });
    }

    // Hashage du nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mise à jour
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    // Invalidation des sessions (optionnel)
    // Ici, on pourrait implémenter une liste noire de tokens

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur interne du serveur' }
    });
  }
});

module.exports = router;
```

## 🗄️ Schéma de base de données

### Tables principales

```sql
-- Utilisateurs
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

-- Catégories
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

-- Produits
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

-- Mouvements de stock
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

-- Logs d'audit
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

### Index de performance

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_movements_product ON movements(product_id);
CREATE INDEX idx_movements_date ON movements(created_at);
CREATE INDEX idx_movements_user ON movements(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
```

## 🧪 Tests

### Tests unitaires

```javascript
// tests/password.test.js
const { hashPassword, verifyPassword } = require('../server/password');

describe('Password utilities', () => {
  test('should hash password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  test('should verify correct password', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const password = 'testpassword123';
    const wrongPassword = 'wrongpassword';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });
});
```

### Tests d'intégration

```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../server/server');
const db = require('../server/database');

describe('API Integration Tests', () => {
  let token;

  beforeAll(async () => {
    // Connexion pour obtenir un token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    token = response.body.data.token;
  });

  test('GET /api/products - should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });

  test('POST /api/products - should create product', async () => {
    const newProduct = {
      name: 'Test Product',
      category: 'Test Category',
      quantity: 10
    };

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(newProduct.name);
  });
});
```

## 🚀 Déploiement

### Build de production

```bash
# Build du frontend
npm run build

# Vérification
ls -la dist/

# Démarrage en production
npm run prod
```

### Variables d'environnement

```bash
# .env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-key-here
DATABASE_PATH=./server/stockprotec.db
BACKUP_RETENTION=10
LOG_LEVEL=info
```

### Optimisations de performance

```javascript
// server/server.js - Optimisations production
if (process.env.NODE_ENV === 'production') {
  // Compression des réponses
  const compression = require('compression');
  app.use(compression());

  // Cache des assets statiques
  app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y',
    etag: false
  }));

  // Rate limiting
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}
```

## 🤝 Contribution

### Processus de contribution

1. **Fork** le projet
2. **Clone** votre fork : `git clone https://github.com/your-username/StockProtec.git`
3. **Créez** une branche : `git checkout -b feature/AmazingFeature`
4. **Codez** votre fonctionnalité
5. **Testez** : `npm test`
6. **Commitez** : `git commit -m 'Add some AmazingFeature'`
7. **Push** : `git push origin feature/AmazingFeature`
8. **Ouvrez** une Pull Request

### Standards de code

#### JavaScript/TypeScript
- **ESLint** : Respect des règles définies
- **Prettier** : Formatage automatique
- **TypeScript strict** : Typage obligatoire
- **Fonctions pures** : Préférer l'immuabilité

#### Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Exemples:
- feat(auth): add JWT authentication
- fix(products): resolve quantity update bug
- docs(api): update endpoint documentation
```

#### Branches
- `main` : Branche principale (stable)
- `develop` : Développement actif
- `feature/*` : Nouvelles fonctionnalités
- `bugfix/*` : Corrections de bugs
- `hotfix/*` : Correctifs urgents

### Revue de code

#### Checklist
- [ ] Tests unitaires présents et passant
- [ ] Code respecte les standards ESLint
- [ ] Types TypeScript corrects
- [ ] Documentation mise à jour
- [ ] Sécurité vérifiée (pas de secrets, etc.)
- [ ] Performance acceptable

## 📚 Ressources

### Documentation
- **[Architecture](docs/DEVELOPER_GUIDE.md)** : Guide complet développeur
- **[API Reference](docs/API_REFERENCE.md)** : Référence API complète
- **[Base de données](docs/GUIDE_BASE_DONNEES.md)** : Schéma et migrations

### Outils recommandés
- **VS Code** : Éditeur recommandé
- **Extensions** : TypeScript, ESLint, Prettier
- **Postman** : Test des APIs
- **SQLite Browser** : Gestion base de données

### Communauté
- **GitHub Issues** : Signaler bugs ou demandes
- **Discord** : Support développeur
- **Email** : userz_fr@outlook.fr

---

*Guide développeur - StockProtec v5.2.0*
*Architecture validée - Avril 2026*

**Prêt à contribuer ?** Forkez le projet et commencez à coder ! 🚀