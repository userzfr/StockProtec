# 🖥️ StockProtec - Backend API

Backend Express.js avec base de données SQLite pour StockProtec.

## 📁 Structure

```
server/
├── database.js    # Configuration SQLite + Création tables
├── server.js      # API Express + Routes
├── seed.js        # Données d'exemple
└── README.md      # Ce fichier
```

## 🚀 Démarrage

### Démarrer le serveur

```bash
npm run server
```

Le serveur démarre sur `http://localhost:3001`

### Vérifier que ça fonctionne

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "message": "API StockProtec fonctionne correctement"
}
```

## 🗄️ Base de Données

### Création automatique

La base `stockprotec.db` est créée automatiquement au premier démarrage.

### Tables créées

- `users` - Utilisateurs
- `bags` - Sacs opérationnels
- `pockets` - Poches des sacs
- `bag_items` - Items dans les poches
- `pharmacy_products` - Produits pharmacie
- `operational_equipment` - Matériel opérationnel
- `control_history` - Historique contrôles
- `control_results` - Résultats contrôles
- `system_logs` - Logs système
- `bug_reports` - Rapports de bugs
- `pharmacy_categories` - Catégories

### Ajouter des données d'exemple

```bash
npm run seed
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:3001/api
```

### Routes principales

#### Utilisateurs
- `GET /users` - Liste des utilisateurs
- `GET /users/email/:email` - Utilisateur par email
- `POST /users` - Créer un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

#### Sacs
- `GET /bags` - Liste des sacs
- `GET /bags/qr/:qrCode` - Sac par QR code
- `POST /bags` - Créer un sac
- `PUT /bags/:id` - Modifier un sac
- `DELETE /bags/:id` - Supprimer un sac

#### Produits Pharmacie
- `GET /pharmacy-products` - Liste des produits
- `POST /pharmacy-products` - Créer un produit
- `PUT /pharmacy-products/:id` - Modifier un produit
- `DELETE /pharmacy-products/:id` - Supprimer un produit

#### Matériel Opérationnel
- `GET /operational-equipment` - Liste du matériel
- `POST /operational-equipment` - Créer un équipement
- `PUT /operational-equipment/:id` - Modifier un équipement
- `DELETE /operational-equipment/:id` - Supprimer un équipement

#### Historique
- `GET /control-history` - Tous les contrôles
- `GET /control-history/bag/:bagId` - Contrôles d'un sac
- `POST /control-history` - Enregistrer un contrôle

#### Système
- `GET /logs` - Logs système
- `POST /logs` - Créer un log
- `GET /bug-reports` - Rapports de bugs
- `POST /bug-reports` - Créer un rapport
- `PUT /bug-reports/:id` - Mettre à jour un rapport
- `GET /categories` - Catégories
- `POST /categories` - Créer une catégorie
- `DELETE /categories/:id` - Supprimer une catégorie

#### Utilitaires
- `GET /health` - État de l'API

## 🔧 Configuration

### Variables d'environnement

```bash
# Port du serveur (défaut: 3001)
PORT=3001

# Chemin de la base de données (défaut: ../stockprotec.db)
DB_PATH=./stockprotec.db

# Hôte d'écoute du serveur en production
# Pour accepter les connexions depuis un reverse proxy sur une autre machine
SERVER_HOST=0.0.0.0

# Hôtes certifiés autorisés dans l'en-tête Host
ALLOWED_HOSTS=proxy.example.com,api.example.com
```

### CORS

CORS est activé par défaut pour permettre les requêtes depuis le frontend.

## 📊 Exemples de Requêtes

### Récupérer tous les sacs

```bash
curl http://localhost:3001/api/bags
```

### Créer un utilisateur

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user-123",
    "nom": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Récupérer un sac par QR code

```bash
curl http://localhost:3001/api/bags/qr/QR-PSE1-001
```

### Enregistrer un contrôle

```bash
curl -X POST http://localhost:3001/api/control-history \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ctrl-001",
    "bagId": "bag-001",
    "userId": "user-001",
    "controlType": "quick",
    "timestamp": "2026-03-10T10:00:00Z",
    "results": [
      {
        "itemId": "item-001",
        "status": "present",
        "actualQuantity": 5
      }
    ]
  }'
```

## 🛠️ Développement

### Ajouter une nouvelle table

Éditez `database.js` :

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS ma_table (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    date_creation TEXT DEFAULT (datetime('now'))
  )
`);
```

### Ajouter un endpoint

Éditez `server.js` :

```javascript
app.get('/api/ma-route', (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM ma_table').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🔒 Sécurité

### Recommandations

- [ ] Hasher les mots de passe avec bcrypt
- [ ] Implémenter JWT pour l'authentification
- [ ] Valider toutes les entrées utilisateur
- [ ] Utiliser HTTPS en production
- [ ] Activer rate limiting
- [ ] Logger toutes les erreurs

## 📝 Logs

Les logs sont affichés dans la console :

```
🔧 Initialisation de la base de données SQLite...
✅ Base de données initialisée avec succès
🚀 Serveur API démarré sur http://localhost:3001
📊 Base de données : stockprotec.db
```

## 🆘 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier si le port 3001 est libre
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows
```

### Erreur de base de données

```bash
# Supprimer et recréer la base
rm stockprotec.db
npm run server
```

### Erreur de permission

```bash
# Vérifier les permissions du dossier
chmod 755 server/
chmod 644 stockprotec.db
```

## 📚 Documentation Complète

Consultez la documentation principale :
- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)
- [INSTALLATION.md](../INSTALLATION.md)

---

**StockProtec Backend v2.0**  
Protection Civile de la Loire - Antenne de Saint-Étienne
