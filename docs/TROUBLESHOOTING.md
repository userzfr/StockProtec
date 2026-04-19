# 🐛 Guide de dépannage - StockProtec v5.2

## 🚨 Problèmes courants et solutions

Ce guide vous aide à résoudre les problèmes les plus fréquents rencontrés avec StockProtec v5.2.

## 🔍 Diagnostic rapide

### Vérification de l'état du système

```bash
# 1. Vérifier que l'application fonctionne
curl http://localhost:5173
curl http://localhost:3001/api/health

# 2. Vérifier les processus
ps aux | grep -E "(node|vite)"

# 3. Vérifier les ports
netstat -tlnp | grep -E "(5173|3001)"

# 4. Vérifier la base de données
ls -la server/stockprotec.db
sqlite3 server/stockprotec.db "SELECT COUNT(*) FROM users;"

# 5. Vérifier les logs
tail -f logs/stockprotec.log
```

## 🌐 Problèmes de connexion

### Application inaccessible

#### Symptômes
- Erreur "Connexion refusée"
- Page blanche
- Erreur 404 ou 500

#### Solutions

**Vérifier le démarrage de l'application :**
```bash
# Redémarrer l'application
npm run prod

# Vérifier les logs
tail -f logs/stockprotec.log
```

**Vérifier les ports :**
```bash
# Ports utilisés
netstat -tlnp | grep -E "(5173|3001)"

# Changer de port si conflit
PORT=3002 npm run server
```

**Vérifier le firewall :**
```bash
# Linux
sudo ufw status
sudo ufw allow 5173/tcp
sudo ufw allow 3001/tcp

# Windows
netsh advfirewall firewall show rule name=all
```

### Problème de connexion à l'API

#### Symptômes
- Interface chargée mais données vides
- Erreurs "API non disponible"
- Timeout des requêtes

#### Solutions

**Test de l'API :**
```bash
# Test de santé
curl http://localhost:3001/api/health

# Test d'authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Vérifier la configuration CORS :**
```javascript
// Dans server/server.js
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
};
```

## 👤 Problèmes d'authentification

### Connexion impossible

#### Symptômes
- "Identifiants incorrects"
- Erreur de hashage des mots de passe

#### Solutions

**Vérifier les comptes de test :**
```sql
-- Connexion à la base
sqlite3 server/stockprotec.db

-- Lister les utilisateurs
SELECT username, role FROM users;

-- Reset mot de passe admin
UPDATE users SET password = '$2b$10$...' WHERE username = 'admin';
```

**Recréer les comptes de test :**
```bash
npm run seed
```

### Session expirée

#### Symptômes
- Déconnexion automatique
- Perte des données non sauvegardées

#### Solutions

**Augmenter le timeout de session :**
```env
# Dans .env
SESSION_TIMEOUT=7200000  # 2 heures
```

**Vérifier le stockage local :**
```javascript
// Vider localStorage si corrompu
localStorage.clear();
sessionStorage.clear();
```

## 🗄️ Problèmes de base de données

### Base de données corrompue

#### Symptômes
- Erreurs SQL
- Données incohérentes
- Application qui plante

#### Solutions

**Vérifier l'intégrité :**
```bash
sqlite3 server/stockprotec.db "PRAGMA integrity_check;"
```

**Réparer la base :**
```bash
# Sauvegarde
cp server/stockprotec.db server/stockprotec.db.backup

# Reconstruction
sqlite3 server/stockprotec.db ".recover" > recovered.sql
rm server/stockprotec.db
sqlite3 server/stockprotec.db < recovered.sql
```

**Recréer depuis zéro :**
```bash
rm server/stockprotec.db
npm run migrate
npm run seed
```

### Migrations échouées

#### Symptômes
- Erreur lors de `npm run migrate`
- Schéma de base de données incorrect

#### Solutions

**Vérifier le statut des migrations :**
```bash
npm run migrate:status
```

**Réinitialiser les migrations :**
```bash
# Supprimer la table de migrations
sqlite3 server/stockprotec.db "DROP TABLE IF EXISTS migrations;"

# Relancer
npm run migrate
```

## 🔄 Problèmes de sauvegarde

### Sauvegarde automatique ne fonctionne pas

#### Symptômes
- Pas de nouvelles sauvegardes
- Erreurs dans les logs

#### Solutions

**Vérifier le planificateur :**
```bash
# Vérifier les tâches cron (Linux)
crontab -l

# Redémarrer le service de sauvegarde
npm run server
```

**Test manuel de sauvegarde :**
```bash
# Test de création
curl -X POST http://localhost:3001/api/backup/create \
  -H "Authorization: Bearer YOUR_TOKEN"

# Lister les sauvegardes
curl http://localhost:3001/api/backup/list
```

### Restauration échouée

#### Symptômes
- Erreur lors de la restauration
- Données corrompues après restauration

#### Solutions

**Vérifier l'intégrité de la sauvegarde :**
```bash
# Tester la sauvegarde
node -e "
const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('backups/backup-2024-01-01.json'));
console.log('Sauvegarde valide:', backup.timestamp);
"
```

**Restaurer étape par étape :**
```bash
# Arrêter l'application
npm run stop

# Restaurer
curl -X POST http://localhost:3001/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"filename":"backup-2024-01-01.json"}'

# Redémarrer
npm run prod
```

## ⚡ Problèmes de performance

### Application lente

#### Symptômes
- Chargement long des pages
- Requêtes API lentes
- Interface freezing

#### Solutions

**Optimisations frontend :**
```bash
# Construction optimisée
npm run build

# Activer la compression
# Dans server/server.js
app.use(compression());
```

**Optimisations base de données :**
```sql
-- Optimiser SQLite
VACUUM;
ANALYZE;

-- Ajouter des index
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(created_at);
```

**Monitoring des performances :**
```bash
# Utilisation mémoire
ps aux --sort=-%mem | head

# Utilisation CPU
top -p $(pgrep -f "node.*server.js")
```

### Mémoire pleine

#### Symptômes
- Erreur "Out of memory"
- Application qui plante

#### Solutions

**Augmenter la mémoire Node.js :**
```bash
# Démarrage avec plus de mémoire
NODE_OPTIONS="--max-old-space-size=2048" npm run prod
```

**Optimiser les requêtes :**
```javascript
// Utiliser la pagination
const products = await Product.findAll({
  limit: 50,
  offset: page * 50
});
```

## 🌐 Problèmes réseau

### Timeout des requêtes

#### Symptômes
- Requêtes qui expirent
- Erreur "Network timeout"

#### Solutions

**Augmenter les timeouts :**
```javascript
// Dans le frontend
const api = axios.create({
  timeout: 30000, // 30 secondes
  baseURL: 'http://localhost:3001/api'
});
```

**Vérifier la connectivité :**
```bash
# Test de latence
ping localhost

# Test de connectivité
telnet localhost 3001
```

### Problèmes CORS

#### Symptômes
- Erreur "CORS policy"
- Requêtes bloquées

#### Solutions

**Configuration CORS correcte :**
```javascript
// Dans server/server.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

## 📱 Problèmes spécifiques

### Interface mobile

#### Symptômes
- Interface non responsive
- Problèmes de touch

#### Solutions

**Vérifier la configuration responsive :**
```css
/* Dans src/styles/index.css */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
```

**Activer le mode mobile :**
```html
<!-- Dans index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Scanner de code-barres

#### Symptômes
- Scanner ne fonctionne pas
- Erreur caméra

#### Solutions

**Permissions caméra :**
```javascript
// Demander la permission
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    // Permission accordée
  })
  .catch(err => {
    console.error('Erreur caméra:', err);
  });
```

**Test du scanner :**
```bash
# Vérifier WebRTC
curl https://webrtc.github.io/samples/src/content/getusermedia/gum/
```

## 🔧 Outils de diagnostic

### Collecte d'informations système

```bash
# Informations système
uname -a
node --version
npm --version

# État des processus
ps aux | grep node

# Utilisation disque
df -h
du -sh server/

# Logs récents
tail -n 50 logs/stockprotec.log
```

### Tests automatisés

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests de performance
npm run test:performance
```

### Mode debug

```bash
# Démarrage en mode debug
DEBUG=* npm run dev

# Debug base de données
sqlite3 server/stockprotec.db ".trace on" ".read debug.sql"
```

## 📞 Support et escalade

### Niveau 1 : Auto-diagnostic
- Utiliser ce guide de dépannage
- Vérifier les logs d'erreur
- Tester les solutions proposées

### Niveau 2 : Support communautaire
- Consulter les [Issues GitHub](https://github.com/userzfr/StockProtec/issues)
- Vérifier la [FAQ](FAQ.md)
- Rechercher dans la documentation

### Niveau 3 : Support direct
- **Email** : userz_fr@outlook.fr
- **Discord** : `userz_fr`
- **Informations à fournir** :
  - Version de StockProtec
  - Système d'exploitation
  - Logs d'erreur complets
  - Étapes de reproduction

---

*Guide de dépannage - StockProtec v5.2.0*
*Mis à jour pour la version 5.2 - Avril 2026*