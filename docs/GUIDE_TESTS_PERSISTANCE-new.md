# 🧪 Guide des tests - StockProtec v5.2

## 🎯 Vue d'ensemble

StockProtec v5.2 intègre une stratégie de tests complète pour assurer la qualité et la fiabilité de l'application. Ce guide présente les différents types de tests, leurs implémentations et les bonnes pratiques.

## 🏗️ Stratégie de test

### Types de tests implémentés

#### Tests unitaires
- **Couverture** : Fonctions individuelles et modules
- **Outils** : Jest pour JavaScript, Vitest pour composants
- **Cible** : Utilitaires, services, hooks personnalisés

#### Tests d'intégration
- **Couverture** : Interactions entre composants
- **Outils** : Jest + Supertest pour APIs
- **Cible** : Routes API, base de données, Context API

#### Tests end-to-end (E2E)
- **Couverture** : Parcours utilisateur complets
- **Outils** : Playwright (recommandé pour le futur)
- **Cible** : Workflows critiques (login, CRUD, sauvegarde)

#### Tests de performance
- **Couverture** : Charges et temps de réponse
- **Outils** : k6 ou Artillery
- **Cible** : APIs, base de données, interface

### Métriques de qualité

#### Couverture de code
- **Objectif** : > 80% de couverture globale
- **Critique** : > 90% pour les utilitaires et APIs
- **Minimum** : > 70% pour l'interface utilisateur

#### Seuils de performance
- **API Response** : < 200ms pour les requêtes simples
- **Page Load** : < 2s pour le premier chargement
- **Database Query** : < 100ms pour les requêtes standards

## 🧪 Tests unitaires

### Configuration Jest

#### jest.config.js
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/server'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'server/**/*.js',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!server/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
```

#### Setup des tests
```javascript
// src/setupTests.js
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extension des matchers Jest
expect.extend(matchers);

// Nettoyage après chaque test
afterEach(() => {
  cleanup();
});
```

### Tests d'utilitaires

#### Test des fonctions de hashage
```javascript
// server/__tests__/password.test.js
const { hashPassword, verifyPassword } = require('../password');

describe('Password utilities', () => {
  test('should hash password correctly', async () => {
    const password = 'testPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toContain(password); // Sécurité
  });

  test('should verify correct password', async () => {
    const password = 'testPassword123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  test('should reject incorrect password', async () => {
    const password = 'testPassword123!';
    const wrongPassword = 'wrongPassword456!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });

  test('should handle empty password', async () => {
    await expect(hashPassword('')).rejects.toThrow();
  });

  test('should generate different hashes for same password', async () => {
    const password = 'testPassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2); // Sel différent
  });
});
```

#### Test des utilitaires de code
```javascript
// src/utils/__tests__/codeGenerator.test.js
const { generateBarcode, validateBarcode } = require('../codeGenerator');

describe('Code Generator', () => {
  describe('generateBarcode', () => {
    test('should generate valid EAN-13 barcode', () => {
      const barcode = generateBarcode();

      expect(barcode).toBeDefined();
      expect(typeof barcode).toBe('string');
      expect(barcode.length).toBe(13);
      expect(/^\d{13}$/.test(barcode)).toBe(true);
      expect(validateBarcode(barcode)).toBe(true);
    });

    test('should generate unique barcodes', () => {
      const barcode1 = generateBarcode();
      const barcode2 = generateBarcode();

      expect(barcode1).not.toBe(barcode2);
    });
  });

  describe('validateBarcode', () => {
    test('should validate correct EAN-13', () => {
      expect(validateBarcode('1234567890128')).toBe(true); // Exemple valide
      expect(validateBarcode('4006381333931')).toBe(true); // Coca-Cola
    });

    test('should reject invalid EAN-13', () => {
      expect(validateBarcode('1234567890123')).toBe(false); // Checksum invalide
      expect(validateBarcode('12345678901')).toBe(false);   // Trop court
      expect(validateBarcode('12345678901234')).toBe(false); // Trop long
      expect(validateBarcode('abcdefghijklm')).toBe(false);  // Non numérique
    });

    test('should handle empty input', () => {
      expect(validateBarcode('')).toBe(false);
      expect(validateBarcode(null)).toBe(false);
      expect(validateBarcode(undefined)).toBe(false);
    });
  });
});
```

### Tests de composants React

#### Test d'un composant simple
```tsx
// src/components/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: 1,
  name: 'Paracétamol 500mg',
  description: 'Antalgique',
  quantity: 100,
  category: 'Médicaments'
};

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render product information', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Paracétamol 500mg')).toBeInTheDocument();
    expect(screen.getByText('Antalgique')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /modifier/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  test('should call onDelete when delete button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /supprimer/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('should have correct accessibility attributes', () => {
    render(
      <ProductCard
        product={mockProduct}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /modifier/i });
    const deleteButton = screen.getByRole('button', { name: /supprimer/i });

    expect(editButton).toHaveAttribute('type', 'button');
    expect(deleteButton).toHaveAttribute('type', 'button');
  });
});
```

#### Test avec Context API
```tsx
// src/contexts/__tests__/AuthContext.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de fetch
global.fetch = jest.fn();

const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <span>Connecté: {user.username}</span>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <div>
          <button onClick={() => login('admin', 'password')}>
            Connexion
          </button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should show loading initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should login successfully', async () => {
    const mockToken = 'mock-jwt-token';
    const mockUser = { id: 1, username: 'admin', role: 'admin' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { user: mockUser, token: mockToken } })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /connexion/i });
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Connecté: admin')).toBeInTheDocument();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('should handle login error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Identifiants incorrects' } })
    });

    // Mock console.error pour éviter les warnings
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /connexion/i });
    await userEvent.click(loginButton);

    // Le composant devrait rester en état non connecté
    expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('should logout correctly', async () => {
    // Simuler un utilisateur connecté
    localStorageMock.getItem.mockReturnValue('mock-token');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 1, username: 'admin', role: 'admin' }
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Connecté: admin')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Déconnexion');
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });
});
```

## 🔗 Tests d'intégration

### Tests API avec Supertest

#### Configuration des tests API
```javascript
// server/__tests__/setup.js
const { createTables, seedTestData } = require('../test-helpers');

beforeAll(async () => {
  // Création des tables de test
  await createTables();

  // Données de test
  await seedTestData();
});

afterAll(async () => {
  // Nettoyage
  await cleanupTestDatabase();
});
```

#### Test des routes d'authentification
```javascript
// server/__tests__/auth.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Authentication API', () => {
  beforeEach(async () => {
    // Nettoyer les données de test
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM audit_logs');
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      // Créer un utilisateur de test
      const { hashPassword } = require('../password');
      const hashedPassword = await hashPassword('testpass123');

      await db.run(`
        INSERT INTO users (username, password, role, is_active)
        VALUES ('testuser', ?, 'user', 1)
      `, [hashedPassword]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe('testuser');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('incorrects');
    });

    test('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle inactive users', async () => {
      const { hashPassword } = require('../password');
      const hashedPassword = await hashPassword('testpass123');

      await db.run(`
        INSERT INTO users (username, password, role, is_active)
        VALUES ('inactiveuser', ?, 'user', 0)
      `, [hashedPassword]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'inactiveuser',
          password: 'testpass123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      // Créer un utilisateur et obtenir un token
      const { hashPassword } = require('../password');
      const hashedPassword = await hashPassword('testpass123');

      await db.run(`
        INSERT INTO users (id, username, password, role, is_active)
        VALUES (1, 'testuser', ?, 'user', 1)
      `, [hashedPassword]);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      token = loginResponse.body.data.token;
    });

    test('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.role).toBe('user');
    });

    test('should reject without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
```

#### Test des routes produits
```javascript
// server/__tests__/products.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Products API', () => {
  let adminToken, userToken;

  beforeAll(async () => {
    // Créer des utilisateurs de test
    const { hashPassword } = require('../password');
    const hashedPassword = await hashPassword('testpass123');

    await db.run(`
      INSERT INTO users (id, username, password, role, is_active)
      VALUES
        (1, 'admin', ?, 'admin', 1),
        (2, 'user', ?, 'user', 1)
    `, [hashedPassword, hashedPassword]);

    // Créer une catégorie de test
    await db.run(`
      INSERT INTO categories (id, name, is_active)
      VALUES (1, 'Test Category', 1)
    `);

    // Obtenir les tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'testpass123' });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user', password: 'testpass123' });

    adminToken = adminLogin.body.data.token;
    userToken = userLogin.body.data.token;
  });

  beforeEach(async () => {
    // Nettoyer les produits entre les tests
    await db.run('DELETE FROM movements');
    await db.run('DELETE FROM products');
  });

  describe('GET /api/products', () => {
    test('should return empty array when no products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toEqual([]);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      });
    });

    test('should return products with pagination', async () => {
      // Créer des produits de test
      for (let i = 1; i <= 5; i++) {
        await db.run(`
          INSERT INTO products (name, category_id, quantity, is_active)
          VALUES (?, 1, ?, 1)
        `, [`Product ${i}`, i * 10]);
      }

      const response = await request(app)
        .get('/api/products?limit=2&page=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 5,
        pages: 3
      });
    });

    test('should filter by category', async () => {
      await db.run(`
        INSERT INTO products (name, category_id, quantity, is_active)
        VALUES
          ('Product 1', 1, 10, 1),
          ('Product 2', 1, 20, 1),
          ('Product 3', 2, 30, 1)
      `);

      const response = await request(app)
        .get('/api/products?category=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products.every(p => p.category_id === 1)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    test('should create product as admin', async () => {
      const newProduct = {
        name: 'New Test Product',
        description: 'A test product',
        category_id: 1,
        quantity: 100,
        unit: 'pieces',
        barcode: '1234567890123'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.id).toBeDefined();

      // Vérifier en base
      const product = await db.get('SELECT * FROM products WHERE id = ?', [response.body.data.id]);
      expect(product.name).toBe(newProduct.name);
    });

    test('should reject creation without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product' });

      expect(response.status).toBe(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Missing name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should prevent duplicate barcodes', async () => {
      // Créer un produit avec un barcode
      await db.run(`
        INSERT INTO products (name, category_id, barcode, is_active)
        VALUES ('Existing Product', 1, '1234567890123', 1)
      `);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          category_id: 1,
          barcode: '1234567890123' // Même barcode
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const result = await db.run(`
        INSERT INTO products (name, category_id, quantity, is_active)
        VALUES ('Test Product', 1, 50, 1)
      `);
      productId = result.id;
    });

    test('should update product as admin', async () => {
      const updates = {
        name: 'Updated Product',
        quantity: 75,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.quantity).toBe(updates.quantity);
    });

    test('should reject update of non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const result = await db.run(`
        INSERT INTO products (name, category_id, quantity, is_active)
        VALUES ('Test Product', 1, 50, 1)
      `);
      productId = result.id;
    });

    test('should soft delete product as admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Vérifier que le produit est marqué comme inactif
      const product = await db.get('SELECT is_active FROM products WHERE id = ?', [productId]);
      expect(product.is_active).toBe(0);
    });

    test('should reject deletion of non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## 🏃‍♂️ Tests de performance

### Configuration k6

#### Script de test de charge
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<300'], // 99% of requests must complete below 300ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Test d'authentification
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    username: 'admin',
    password: 'admin123',
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  const authToken = loginResponse.json().data.token;

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  // Test de récupération des produits
  const productsResponse = http.get(`${BASE_URL}/api/products`, { headers });

  check(productsResponse, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test de création d'un mouvement
  const movementData = {
    product_id: 1,
    type: 'OUT',
    quantity: 1,
    reason: 'Test performance',
  };

  const movementResponse = http.post(
    `${BASE_URL}/api/movements`,
    JSON.stringify(movementData),
    { headers }
  );

  check(movementResponse, {
    'movement status is 201': (r) => r.status === 201,
    'movement response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1); // Pause entre les itérations
}
```

#### Test de stress de la base de données
```javascript
// tests/performance/database-stress.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50, // 50 utilisateurs virtuels
  duration: '30s', // Test de 30 secondes
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

  // Authentification
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, {
    username: 'admin',
    password: 'admin123',
  });

  const token = loginResponse.json().data.token;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test de requêtes complexes
  const complexQueries = [
    `${BASE_URL}/api/products?limit=100&sort=name`,
    `${BASE_URL}/api/products?category=1&alert=true`,
    `${BASE_URL}/api/movements?startDate=2024-01-01&endDate=2024-12-31`,
    `${BASE_URL}/api/stats/overview`,
  ];

  complexQueries.forEach(url => {
    const response = http.get(url, { headers });
    check(response, {
      'complex query status is 200': (r) => r.status === 200,
      'complex query response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  });
}
```

## 🔄 Intégration continue

### Configuration GitHub Actions

#### Workflow de test
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm run setup

    - name: Run database migrations
      run: npm run migrate

    - name: Seed test data
      run: npm run seed

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  performance:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20.x
        cache: 'npm'

    - name: Install dependencies
      run: npm run setup

    - name: Build application
      run: npm run build

    - name: Start application
      run: |
        npm run prod &
        sleep 10

    - name: Run performance tests
      uses: grafana/k6-action@v0.2.0
      with:
        filename: tests/performance/load-test.js
```

### Métriques de qualité

#### Badge de couverture
```markdown
[![Coverage](https://codecov.io/gh/userzfr/StockProtec/branch/main/graph/badge.svg)](https://codecov.io/gh/userzfr/StockProtec)
```

#### Rapport de couverture détaillé
```javascript
// jest.config.js - Configuration couverture
coverageReporters: [
  'text',
  'lcov',
  'html',
  'json-summary'
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/components/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  './server/': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85
  }
}
```

## 🐛 Débogage des tests

### Outils de débogage

#### Mode verbose
```bash
# Tests avec détails
npm test -- --verbose

# Test spécifique
npm test -- --testNamePattern="should create product"

# Debug mode
npm test -- --inspect-brk
```

#### Tests lents
```javascript
// Identifier les tests lents
jest.setTimeout(10000); // Timeout plus long

// Profiling des tests
npm test -- --coverage --testResultsProcessor=jest-slow-test-reporter
```

### Bonnes pratiques

#### Structure des tests
```javascript
describe('Feature Name', () => {
  describe('When condition', () => {
    it('should expected behavior', () => {
      // Arrange
      const input = 'test input';
      const expected = 'expected output';

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

#### Mocks et spies
```javascript
// Mock d'une fonction
const mockFunction = jest.fn();
mockFunction.mockReturnValue('mocked value');

// Spy sur une méthode
const spy = jest.spyOn(object, 'method');
expect(spy).toHaveBeenCalledWith('argument');

// Mock d'un module
jest.mock('../api', () => ({
  getProducts: jest.fn(),
}));
```

#### Tests asynchrones
```javascript
// Avec async/await
test('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Avec callback
test('should call callback', (done) => {
  functionWithCallback((result) => {
    expect(result).toBe('expected');
    done();
  });
});
```

## 📊 Rapports et métriques

### Génération de rapports

#### Rapport HTML de couverture
```javascript
// jest.config.js
coverageReporters: ['html'],
// Génère ./coverage/lcov-report/index.html
```

#### Export des résultats
```javascript
// Script d'export
const fs = require('fs');
const { execSync } = require('child_process');

function generateTestReport() {
  // Exécuter les tests
  const output = execSync('npm test -- --json --outputFile=test-results.json', {
    encoding: 'utf8'
  });

  // Lire les résultats
  const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));

  // Générer un rapport personnalisé
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      numTotalTests: results.numTotalTests,
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      success: results.success
    },
    details: results.testResults.map(result => ({
      file: result.testFilePath,
      duration: result.perfStats.runtime,
      tests: result.assertionResults.map(assertion => ({
        name: assertion.title,
        status: assertion.status,
        duration: assertion.duration
      }))
    }))
  };

  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('Rapport de test généré: test-report.json');
}

generateTestReport();
```

### Métriques de suivi

#### Évolution de la couverture
```javascript
// Suivi historique
const coverageHistory = [
  { date: '2024-01-01', coverage: 75.2 },
  { date: '2024-01-15', coverage: 78.1 },
  { date: '2024-02-01', coverage: 82.3 },
  // ...
];

// Graphique d'évolution
function plotCoverageHistory(history) {
  // Utiliser une librairie de graphiques
  // ou exporter vers un outil externe
}
```

#### Alertes de régression
```javascript
// Vérification des métriques
function checkTestMetrics(results) {
  const thresholds = {
    minCoverage: 80,
    maxFailedTests: 5,
    maxTestDuration: 300000 // 5 minutes
  };

  if (results.coverage < thresholds.minCoverage) {
    console.error(`❌ Couverture trop basse: ${results.coverage}% (min: ${thresholds.minCoverage}%)`);
    process.exit(1);
  }

  if (results.numFailedTests > thresholds.maxFailedTests) {
    console.error(`❌ Trop de tests échoués: ${results.numFailedTests} (max: ${thresholds.maxFailedTests})`);
    process.exit(1);
  }

  console.log('✅ Métriques de test validées');
}
```

---

*Guide des tests - StockProtec v5.2.0*
*Stratégie de test complète - Avril 2026*

**Pour exécuter les tests :** `npm test`

**Rapport de couverture :** `npm run test:coverage`