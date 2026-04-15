# ⚡ QuickStart - StockProtec v5

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Lancer l'application complète
```bash
npm run dev:all
```

### 3. Accéder à l'application
- Frontend : `http://localhost:5173`
- API : `http://localhost:3001`

### 4. Test rapide
- Se connecter avec `admin` / `admin123`
- Créer un sac
- Rafraîchir la page (F5)
- ✅ Le sac doit persister

## 🧪 Vérifications importantes

### Vérifier localStorage
```javascript
// Console navigateur (F12 → Application → Local Storage)
// ✅ Doit voir UNIQUEMENT : authState
// ❌ NE doit pas voir : bags, pharmacyProducts, categories, etc.
```

### Vérifier la base de données
```bash
sqlite3 stockprotec.db
SELECT COUNT(*) FROM bags;
.quit
```

### Vérifier les logs API
```javascript
// Console navigateur (F12 → Console)
// Chaque opération doit afficher :
// 📤 [API] POST /api/bags
// ✅ [API] /api/bags OK
```

## 📋 Checklist de démarrage

- [ ] `npm install` terminé
- [ ] `npm run dev:all` lancé
- [ ] Frontend accessible sur `http://localhost:5173`
- [ ] API accessible sur `http://localhost:3001`
- [ ] Connexion réussie avec admin/admin123
- [ ] Création d'un sac fonctionne
- [ ] Persistance après refresh (F5)
- [ ] localStorage contient uniquement authState

## 🚨 Versions supportées

- ✅ `v5.x` : Supportée
- ❌ `v4.x` et antérieures : Non supportées

## 📚 Documentation complémentaire

- [INSTALLATION.md](INSTALLATION.md) : Installation détaillée
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) : Guide technique
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) : Migration depuis anciennes versions