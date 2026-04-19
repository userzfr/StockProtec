# 📦 Guide d'installation - StockProtec v5.2

## 🎯 Vue d'ensemble

Ce guide vous accompagne pas à pas dans l'installation complète de StockProtec v5.2, l'application de gestion de stock pour la Protection Civile.

## 📋 Prérequis système

### 🔧 Configuration minimale requise

| Composant | Version minimale | Version recommandée |
|-----------|------------------|-------------------|
| **Node.js** | 18.0.0 | 20.x LTS |
| **npm** | 8.0.0 | 10.x |
| **SQLite** | 3.0 | 3.40+ |
| **Mémoire RAM** | 2 GB | 4 GB |
| **Espace disque** | 500 MB | 2 GB |
| **Navigateur** | Chrome 90+ | Chrome 120+ |

### 🖥️ Systèmes d'exploitation supportés

- ✅ **Linux** : Ubuntu 20.04+, Debian 11+, CentOS 8+
- ✅ **macOS** : 12.0+ (Monterey)
- ✅ **Windows** : 10+ (avec WSL recommandé)
- ⚠️ **Docker** : Supporté via conteneurisation

## 🚀 Installation rapide (5 minutes)

### Étape 1 : Téléchargement
```bash
# Cloner le dépôt officiel
git clone https://github.com/userzfr/StockProtec.git
cd StockProtec

# Vérifier la version
git checkout v5.2.0
```

### Étape 2 : Installation des dépendances
```bash
# Installation automatique (recommandé)
npm run setup

# Ou installation manuelle
npm install
```

### Étape 3 : Configuration initiale
```bash
# Migration de la base de données
npm run migrate

# (Optionnel) Remplissage avec des données de test
npm run seed
```

### Étape 4 : Démarrage
```bash
# Démarrage en production
npm run prod

# L'application sera accessible sur http://localhost:5173
```

## 📚 Installation détaillée

### 🔍 Vérification des prérequis

Avant l'installation, vérifiez que votre système remplit les conditions :

```bash
# Vérifier Node.js
node --version
npm --version

# Vérifier l'espace disque disponible
df -h .

# Vérifier les permissions d'écriture
touch test.txt && rm test.txt
```

### 📥 Téléchargement du code source

#### Depuis GitHub (recommandé)
```bash
# Clonage du dépôt
git clone https://github.com/userzfr/StockProtec.git
cd StockProtec

# Passage à la version stable
git checkout v5.2.0

# Vérification de l'intégrité
git verify-commit HEAD
```

#### Téléchargement direct
```bash
# Téléchargement de l'archive
wget https://github.com/userzfr/StockProtec/archive/refs/tags/v5.2.0.zip
unzip v5.2.0.zip
cd StockProtec-5.2.0
```

### 🏗️ Installation des dépendances

#### Installation automatique
```bash
# Script d'installation complet (recommandé)
npm run setup
```

Ce script effectue automatiquement :
- Installation des dépendances npm
- Vérification des versions
- Configuration des permissions
- Tests de compatibilité

#### Installation manuelle
```bash
# Installation des dépendances
npm install

# Installation des dépendances de développement (optionnel)
npm install --include=dev

# Vérification de l'installation
npm list --depth=0
```

### 🗄️ Configuration de la base de données

#### Migration automatique
```bash
# Exécution des migrations
npm run migrate

# Vérification du statut
npm run migrate:status
```

#### Migration manuelle (si nécessaire)
```bash
# Accès direct au script de migration
cd server
node migrate.js

# Vérification de la base
sqlite3 stockprotec.db ".schema"
```

#### Données de test (optionnel)
```bash
# Remplissage avec des données d'exemple
npm run seed

# Comptes de test créés :
# - Admin: admin / admin123
# - User: user / user123
```

### ⚙️ Configuration avancée

#### Variables d'environnement
Créer un fichier `.env` dans le répertoire racine :

```env
# Configuration du serveur
PORT=3001
NODE_ENV=production

# Base de données
DATABASE_PATH=./server/stockprotec.db

# Sécurité
JWT_SECRET=votre-cle-secrete-très-longue-et-complexe
SESSION_TIMEOUT=3600000

# Sauvegarde
BACKUP_RETENTION=10
BACKUP_SCHEDULE=0 2 * * 0

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/stockprotec.log
```

#### Configuration réseau
```bash
# Configuration du firewall (Linux)
sudo ufw allow 5173/tcp  # Frontend
sudo ufw allow 3001/tcp  # API

# Configuration Nginx (optionnel)
sudo cp nginx-example.conf /etc/nginx/sites-available/stockprotec
sudo ln -s /etc/nginx/sites-available/stockprotec /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 🐳 Installation avec Docker

### Image Docker officielle
```bash
# Construction de l'image
docker build -t stockprotec:v5.2 .

# Démarrage du conteneur
docker run -d \
  --name stockprotec \
  -p 5173:5173 \
  -p 3001:3001 \
  -v stockprotec-data:/app/server \
  stockprotec:v5.2
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  stockprotec:
    build: .
    ports:
      - "5173:5173"
      - "3001:3001"
    volumes:
      - stockprotec-data:/app/server
    environment:
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  stockprotec-data:
```

```bash
# Démarrage avec Docker Compose
docker-compose up -d
```

## 🔧 Démarrage et arrêt

### Démarrage en production
```bash
# Démarrage complet (frontend + backend)
npm run prod

# Démarrage séparé
npm run server    # Backend uniquement
npm run build     # Construction frontend
npm run preview   # Serveur frontend
```

### Démarrage en développement
```bash
# Mode développement complet
npm run dev:all

# Développement séparé
npm run dev       # Frontend (Vite)
npm run server:dev # Backend avec nodemon
```

### Arrêt de l'application
```bash
# Arrêt propre
npm run stop

# Ou tuer les processus
pkill -f "node.*server.js"
pkill -f "vite"
```

## ✅ Vérification de l'installation

### Tests automatisés
```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance
```

### Vérification manuelle
1. **Accès à l'application** : `http://localhost:5173`
2. **Connexion API** : `http://localhost:3001/api/health`
3. **Base de données** : Vérifier la présence de `server/stockprotec.db`
4. **Logs** : Vérifier l'absence d'erreurs dans les logs

### Commandes de diagnostic
```bash
# État des processus
ps aux | grep node

# Ports utilisés
netstat -tlnp | grep -E "(5173|3001)"

# Logs d'erreur
tail -f logs/stockprotec.log

# Santé de l'API
curl http://localhost:3001/api/health
```

## 🔄 Mise à jour

### Mise à jour automatique
```bash
# Script de mise à jour
npm run update

# Ou manuellement
git pull origin main
npm install
npm run migrate
npm run build
```

### Rollback en cas de problème
```bash
# Retour à la version précédente
git checkout v5.1.0
npm install
npm run migrate
```

## 🐛 Dépannage

### Problèmes courants

#### Erreur de port occupé
```bash
# Identifier le processus
lsof -i :5173
lsof -i :3001

# Changer de port
PORT=3002 npm run server
```

#### Problème de permissions
```bash
# Corriger les permissions
chmod +x launcher.sh
chmod 644 server/stockprotec.db
chown -R $USER:$USER .
```

#### Erreur de base de données
```bash
# Vérifier l'intégrité
sqlite3 server/stockprotec.db "PRAGMA integrity_check;"

# Recréer la base si nécessaire
rm server/stockprotec.db
npm run migrate
```

### Logs et debug
```bash
# Activer les logs détaillés
DEBUG=* npm run dev

# Logs de l'application
tail -f logs/stockprotec.log

# Logs système
journalctl -u stockprotec -f
```

## 📞 Support

### Ressources d'aide
- **[Documentation complète](DOCUMENTATION_INDEX.md)**
- **[FAQ](FAQ.md)**
- **[Guide de dépannage](TROUBLESHOOTING.md)**

### Contact
- **Email** : userz_fr@outlook.fr
- **GitHub Issues** : [Signaler un problème](https://github.com/userzfr/StockProtec/issues)
- **Discord** : `userz_fr`

---

*Guide d'installation - StockProtec v5.2.0*
*Installation validée sur Ubuntu 24.04, macOS 14, Windows 11*