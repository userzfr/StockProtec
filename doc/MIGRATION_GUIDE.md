# 🔄 Guide de Migration - StockProtec v5

## ⚠️ Versions supportées

- ✅ **StockProtec v5** : Seule version supportée
- ❌ Versions antérieures : Non supportées

> **Important** : Toute installation doit être migrée vers v5. Les anciennes versions ne reçoivent plus de support.

## 📋 Vue d'ensemble de la migration

### Changements majeurs en v5
- **Base de données** : Migration de `localStorage` vers SQLite
- **Persistance** : Toutes les données métier stockées en base
- **Authentification** : `authState` reste en localStorage (session uniquement)
- **API** : Nouvelles routes pour toutes les opérations CRUD

### Données concernées par la migration
- `bags` : Sacs de secours
- `categories` : Catégories d'équipements
- `pharmacyProducts` : Produits pharmacie
- `operationalEquipment` : Équipements opérationnels
- `users` : Utilisateurs (si présents)

## 🚀 Procédure de migration

### Étape 1: Sauvegarde des données actuelles
```bash
# Ouvrir la console navigateur (F12)
# Exécuter:
localStorage.getItem('bags')
localStorage.getItem('categories')
localStorage.getItem('pharmacyProducts')
# Copier les valeurs JSON pour sauvegarde
```

### Étape 2: Installation de v5
```bash
# Cloner la nouvelle version
git clone https://github.com/mathieu-bergeron/StockProtec.git
cd StockProtec

# Installer les dépendances
npm install

# Build et test
npm run build
npm run dev:all
```

### Étape 3: Migration automatique
1. Ouvrir `http://localhost:5173`
2. Si des données `localStorage` sont détectées :
   - Une boîte de dialogue `MigrationDialog` s'ouvre automatiquement
   - Cliquer sur "Migrer les données"
3. ✅ Toast de confirmation : "Migration réussie !"

### Étape 4: Vérification post-migration
```bash
# Vérifier la base de données
sqlite3 stockprotec.db
SELECT COUNT(*) FROM bags;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM pharmacy_products;
.quit

# Vérifier localStorage (doit être vide sauf authState)
# Console navigateur:
Object.keys(localStorage)
# Doit afficher: ["authState"]
```

## 🧪 Tests de validation

### Test 1: Persistance des données
- Créer un nouveau sac après migration
- Rafraîchir la page (F5)
- ✅ Le sac doit persister

### Test 2: Intégrité des données migrées
- Vérifier que tous les sacs migrés sont présents
- Vérifier que les catégories sont intactes
- Vérifier que les produits pharmacie sont migrés

### Test 3: Fonctionnalités CRUD
- Créer, modifier, supprimer un sac
- ✅ Toutes les opérations doivent fonctionner
- ✅ Persistance après refresh

## 🔧 Dépannage migration

### Problème: MigrationDialog ne s'ouvre pas
```bash
# Vérifier que des données existent en localStorage
# Console navigateur:
localStorage.length > 1  # Doit être true

# Forcer la migration manuellement
# Console navigateur:
window.location.reload()  # Refresh forcé
```

### Problème: Erreur pendant la migration
```bash
# Vérifier les logs console
# Console navigateur (F12 → Console)
# Chercher les erreurs API:
# ❌ [API] POST /api/migrate - Erreur 500

# Vérifier les logs serveur
# Terminal backend:
# Database error: ...
```

### Problème: Données corrompues après migration
```bash
# Restaurer depuis sauvegarde
# 1. Supprimer la base
rm stockprotec.db

# 2. Redémarrer l'application
npm run dev:all

# 3. Remettre les données en localStorage
# Console navigateur:
localStorage.setItem('bags', '[sauvegarde JSON]')

# 4. Relancer la migration
window.location.reload()
```

## 📊 Structure de la base de données v5

### Tables principales
- `bags` : Sacs de secours
- `categories` : Catégories
- `pharmacy_products` : Produits pharmacie
- `operational_equipment` : Équipements opérationnels
- `users` : Utilisateurs
- `logs` : Historique des opérations

### Schéma SQLite
```sql
-- Exemple de structure
CREATE TABLE bags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  deployment_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚨 Points d'attention

### Sécurité
- Les mots de passe utilisateurs sont hashés
- `authState` reste en session localStorage
- Toutes les données métier sont en base sécurisée

### Performance
- SQLite est optimisé pour les opérations locales
- Pas de limite pratique sur la taille des données
- Requêtes indexées pour les performances

### Compatibilité
- v5 n'est pas rétrocompatible avec v4
- Migration unidirectionnelle uniquement
- Pas de retour en arrière possible

## 📚 Documentation complémentaire

- [QUICKSTART.md](QUICKSTART.md) : Démarrage rapide
- [INSTALLATION.md](INSTALLATION.md) : Installation détaillée
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) : Guide développeur
- [GUIDE_BASE_DONNEES.md](GUIDE_BASE_DONNEES.md) : Structure base de données