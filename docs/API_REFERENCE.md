# 🔌 API Reference - StockProtec v5.2

## 📋 Vue d'ensemble

L'API REST de StockProtec v5.2 fournit un accès programmatique complet aux fonctionnalités de l'application. Elle suit les standards REST et utilise JSON pour les échanges de données.

### 🌐 Endpoint de base
```
Base URL: http://localhost:3001/api
Content-Type: application/json
```

### 🔐 Authentification
Toutes les requêtes (sauf login) nécessitent un token JWT :
```
Authorization: Bearer <token>
```

### 📊 Format de réponse
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔑 Authentification

### POST /auth/login
Connexion utilisateur

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/logout
Déconnexion

**Response:**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### GET /auth/me
Informations de l'utilisateur connecté

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "email": "admin@stockprotec.local",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /auth/change-password
Changement de mot de passe

**Request:**
```json
{
  "currentPassword": "ancien123",
  "newPassword": "nouveau123"
}
```

---

## 📦 Produits (Products)

### GET /products
Liste des produits avec pagination

**Query Parameters:**
- `page` (number): Page (défaut: 1)
- `limit` (number): Éléments par page (défaut: 50)
- `category` (string): Filtre par catégorie
- `search` (string): Recherche textuelle
- `alert` (boolean): Produits en alerte uniquement

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Paracétamol 500mg",
        "category": "Médicaments",
        "quantity": 150,
        "minQuantity": 50,
        "maxQuantity": 500,
        "unit": "comprimés",
        "barcode": "1234567890123",
        "expirationDate": "2025-12-31",
        "supplier": "Pharmacie Centrale",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

### GET /products/{id}
Détails d'un produit

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Paracétamol 500mg",
    "description": "Antalgique et antipyrétique",
    "category": "Médicaments",
    "quantity": 150,
    "minQuantity": 50,
    "maxQuantity": 500,
    "unit": "comprimés",
    "barcode": "1234567890123",
    "batchNumber": "LOT2024001",
    "expirationDate": "2025-12-31",
    "supplier": "Pharmacie Centrale",
    "location": "Armoire A-12",
    "price": 0.15,
    "notes": "Conserver à l'abri de la lumière",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /products
Création d'un produit

**Request:**
```json
{
  "name": "Ibuprofène 400mg",
  "description": "Anti-inflammatoire non stéroïdien",
  "category": "Médicaments",
  "quantity": 100,
  "minQuantity": 20,
  "maxQuantity": 300,
  "unit": "comprimés",
  "barcode": "9876543210987",
  "batchNumber": "LOT2024002",
  "expirationDate": "2026-06-30",
  "supplier": "Laboratoire Pharma",
  "location": "Armoire B-05",
  "price": 0.25
}
```

### PUT /products/{id}
Modification d'un produit

**Request:** (mêmes champs que création, optionnels)

### DELETE /products/{id}
Suppression d'un produit

**Note:** La suppression est logique (isActive = false)

---

## 📁 Catégories (Categories)

### GET /categories
Liste des catégories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Médicaments",
      "description": "Produits pharmaceutiques",
      "color": "#FF6B6B",
      "parentId": null,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Analgésiques",
      "description": "Médicaments contre la douleur",
      "color": "#4ECDC4",
      "parentId": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /categories
Création d'une catégorie

**Request:**
```json
{
  "name": "Matériel médical",
  "description": "Équipements et dispositifs médicaux",
  "color": "#45B7D1",
  "parentId": null
}
```

### PUT /categories/{id}
Modification d'une catégorie

### DELETE /categories/{id}
Suppression d'une catégorie

---

## 📊 Mouvements (Movements)

### GET /movements
Historique des mouvements

**Query Parameters:**
- `page`, `limit`: Pagination
- `productId`: Filtre par produit
- `type`: 'IN', 'OUT', 'TRANSFER'
- `startDate`, `endDate`: Période

**Response:**
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "id": 1,
        "productId": 1,
        "productName": "Paracétamol 500mg",
        "type": "OUT",
        "quantity": 10,
        "reason": "Utilisation médicale",
        "userId": 2,
        "userName": "Dr. Martin",
        "notes": "Intervention d'urgence",
        "createdAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "pages": 5
    }
  }
}
```

### POST /movements
Enregistrement d'un mouvement

**Request:**
```json
{
  "productId": 1,
  "type": "OUT",
  "quantity": 5,
  "reason": "Distribution",
  "notes": "Livraison hôpital Saint-Joseph"
}
```

---

## 👥 Utilisateurs (Users) - Admin uniquement

### GET /users
Liste des utilisateurs

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@stockprotec.local",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /users
Création d'utilisateur

**Request:**
```json
{
  "username": "nouveau_user",
  "email": "user@stockprotec.local",
  "password": "motdepasse123",
  "role": "user"
}
```

### PUT /users/{id}
Modification d'utilisateur

### DELETE /users/{id}
Suppression d'utilisateur

---

## 💾 Sauvegarde (Backup) - Admin uniquement

### GET /backup/list
Liste des sauvegardes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "backup-2024-01-14.json",
      "size": 2457600,
      "createdAt": "2024-01-14T02:00:00.000Z",
      "isEncrypted": true
    }
  ]
}
```

### POST /backup/create
Création d'une sauvegarde

**Request:**
```json
{
  "name": "sauvegarde_mensuelle",
  "encrypt": true
}
```

### POST /backup/restore
Restauration d'une sauvegarde

**Request:**
```json
{
  "filename": "backup-2024-01-14.json",
  "confirm": true
}
```

### DELETE /backup/{filename}
Suppression d'une sauvegarde

---

## 📈 Statistiques (Statistics)

### GET /stats/overview
Statistiques générales

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 1250,
    "totalCategories": 15,
    "lowStockAlerts": 8,
    "expiringSoon": 12,
    "totalValue": 45678.90,
    "movementsToday": 45,
    "activeUsers": 8
  }
}
```

### GET /stats/movements
Statistiques des mouvements

**Query Parameters:**
- `period`: 'day', 'week', 'month', 'year'

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "entries": 1250,
    "exits": 1180,
    "netMovement": 70,
    "topProducts": [
      {
        "productId": 1,
        "name": "Paracétamol 500mg",
        "movements": 45
      }
    ]
  }
}
```

### GET /stats/categories
Répartition par catégories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Médicaments",
      "count": 450,
      "value": 12500.00,
      "percentage": 36.0
    }
  ]
}
```

---

## 🔍 Recherche (Search)

### GET /search
Recherche globale

**Query Parameters:**
- `q`: Terme de recherche
- `type`: 'products', 'categories', 'users', 'all'
- `limit`: Nombre de résultats

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "paracetamol",
    "results": {
      "products": [
        {
          "id": 1,
          "name": "Paracétamol 500mg",
          "category": "Médicaments",
          "quantity": 150
        }
      ],
      "categories": [],
      "users": []
    }
  }
}
```

---

## 🏥 Santé système (Health)

### GET /health
État du système

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "5.2.0",
    "uptime": 3600,
    "database": {
      "status": "connected",
      "size": "15.2 MB"
    },
    "memory": {
      "used": "85 MB",
      "free": "1.2 GB"
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## 📊 Codes d'erreur

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Créé |
| `400` | Requête invalide |
| `401` | Non authentifié |
| `403` | Non autorisé |
| `404` | Ressource non trouvée |
| `409` | Conflit (ressource existe) |
| `422` | Données invalides |
| `429` | Trop de requêtes |
| `500` | Erreur serveur |

### Format d'erreur
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "field": "quantity",
      "issue": "Doit être un nombre positif"
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

## 🔧 Utilisation avancée

### Pagination
```javascript
// Exemple de pagination
const page = 1;
const limit = 50;
const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
const data = await response.json();
```

### Filtres et tris
```javascript
// Recherche avec filtres
const params = new URLSearchParams({
  search: 'paracetamol',
  category: 'Médicaments',
  alert: 'true',
  sort: 'name',
  order: 'asc'
});
const response = await fetch(`/api/products?${params}`);
```

### Gestion d'erreurs
```javascript
try {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const result = await response.json();
  console.log('Produit créé:', result.data);
} catch (error) {
  console.error('Erreur:', error.message);
}
```

### Rate Limiting
- **100 requêtes/minute** par utilisateur
- **1000 requêtes/heure** par IP
- Headers de réponse :
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

*API Reference - StockProtec v5.2.0*
*Dernière mise à jour : Avril 2026*

**Swagger UI disponible sur :** `http://localhost:3001/api/docs`