# 🛠️ Installation - StockProtec v5

## ⚠️ Prérequis

### Versions supportées
- ✅ **StockProtec v5** : Seule version supportée
- ❌ Versions antérieures : Non supportées

### Logiciels requis
- **Node.js** : v22.15.1 ou supérieur
- **npm** : v10.9.2 ou supérieur
- **SQLite3** : Inclus dans le projet

### Vérification des prérequis
```bash
# Vérifier Node.js
node --version
# Doit afficher: v22.15.1 ou supérieur

# Vérifier npm
npm --version
# Doit afficher: 10.9.2 ou supérieur
```

## 🚀 Installation

### 1. Cloner le dépôt
```bash
git clone https://github.com/mathieu-bergeron/StockProtec.git
cd StockProtec
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Vérifier l'installation
```bash
# Build le projet
npm run build

# Résultat attendu:
# ✓ built in X.XXs
# dist/index.html, dist/assets/...
```

## 🏃‍♂️ Démarrage

### Option 1: Développement complet
```bash
npm run dev:all
```
- Frontend : `http://localhost:5173`
- Backend : `http://localhost:3001`

### Option 2: Terminaux séparés
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## 🧪 Tests post-installation

### Test 1: Connexion
- Ouvrir `http://localhost:5173`
- Se connecter avec `admin` / `admin123`
- ✅ Connexion réussie

### Test 2: Persistance des données
- Créer un sac
- Rafraîchir la page (F5)
- ✅ Le sac persiste

### Test 3: Base de données
```bash
sqlite3 stockprotec.db
.tables
SELECT COUNT(*) FROM bags;
.quit
```

## 🔧 Configuration

### Variables d'environnement
Le projet utilise des valeurs par défaut. Aucune configuration supplémentaire n'est requise pour un usage standard.

### Ports utilisés
- Frontend : `5173` (Vite dev server)
- Backend : `3001` (Express API)

### Base de données
- Fichier : `stockprotec.db` (SQLite)
- Créé automatiquement au premier lancement
- Contient toutes les données métier

## 🚨 Dépannage

### Erreur: "Port already in use"
```bash
# Windows - Tuer le process sur le port
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Erreur: "Cannot find module"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Build failed"
```bash
# Nettoyer et rebuild
npm run clean
npm install
npm run build
```

## 📁 Structure du projet

```
StockProtec/
├── src/                    # Frontend React
├── server/                 # Backend Node.js
├── dist/                   # Build production
├── stockprotec.db         # Base de données SQLite
├── package.json           # Dépendances et scripts
└── vite.config.ts         # Configuration Vite
```

## 📚 Documentation complémentaire

- [QUICKSTART.md](QUICKSTART.md) : Démarrage rapide
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) : Guide développeur
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) : Migration depuis anciennes versions