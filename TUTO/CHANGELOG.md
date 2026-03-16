# 📝 Changelog - Migration SQLite

## Version 2.0.0 - Migration vers SQLite (Mars 2026)

### 🎯 Objectif de la mise à jour

Migration complète du système de stockage depuis localStorage vers une base de données SQLite locale pour améliorer la fiabilité, les performances et la gestion des données.

### ✨ Nouveautés

#### Infrastructure Backend
- ✅ **Serveur Express API** sur port 3001
- ✅ **Base de données SQLite** (`stockprotec.db`)
- ✅ **11 tables structurées** avec relations et contraintes
- ✅ **API REST complète** pour toutes les opérations CRUD
- ✅ **Initialisation automatique** de la base de données
- ✅ **Transactions garantissant** l'intégrité des données

#### Migration des Données
- ✅ **Migration automatique** depuis localStorage
- ✅ **Dialogue de migration** intuitif
- ✅ **Script de migration** manuel disponible
- ✅ **Vérification de l'intégrité** des données migrées
- ✅ **Sauvegarde simple** (un seul fichier)

#### Scripts et Commandes
- ✅ `npm run dev:all` - Démarrer frontend + backend ensemble
- ✅ `npm run server` - Démarrer uniquement l'API
- ✅ `npm run seed` - Remplir avec des données d'exemple
- ✅ Scripts de démarrage : `start.sh` (Linux/Mac) et `start.bat` (Windows)

#### Documentation
- ✅ **INSTALLATION.md** - Guide d'installation complet
- ✅ **DEVELOPER_GUIDE.md** - Documentation technique détaillée
- ✅ **MIGRATION_GUIDE.md** - Guide de migration pour utilisateurs
- ✅ **CHANGELOG.md** - Ce fichier de changements
- ✅ **.gitignore** - Configuration Git appropriée

### 🗄️ Structure de la Base de Données

#### Tables créées

1. **users** - Comptes utilisateurs
   - Champs : id, nom, password, role, date_creation

2. **bags** - Sacs opérationnels
   - Champs : id, nom, qr_code, description, statuts, dates
   - Index : qr_code (unique)

3. **pockets** - Poches des sacs
   - Champs : id, bag_id, name, color, ordre_affichage
   - Relation : bag_id → bags(id)

4. **bag_items** - Items dans les poches
   - Champs : id, pocket_id, name, expected_quantity, check_type
   - Relation : pocket_id → pockets(id)

5. **pharmacy_products** - Produits de pharmacie
   - Champs : id, nom_produit, code_barre, categorie, quantity, dates, lot_number
   - Index : code_barre (unique)

6. **operational_equipment** - Matériel opérationnel
   - Champs : id, name, qr_code, type, category, status, dates
   - Index : qr_code (unique)

7. **control_history** - Historique des contrôles
   - Champs : id, bag_id, user_id, control_type, deployment_location, timestamp
   - Relations : bag_id → bags(id), user_id → users(id)

8. **control_results** - Résultats détaillés de contrôle
   - Champs : id, control_id, item_id, status, actual_quantity
   - Relations : control_id → control_history(id), item_id → bag_items(id)

9. **system_logs** - Logs du système
   - Champs : id, timestamp, user_id, action, details
   - Relation : user_id → users(id)

10. **bug_reports** - Rapports de bugs
    - Champs : id, user_id, category, description, status, timestamp
    - Relation : user_id → users(id)

11. **pharmacy_categories** - Catégories de pharmacie
    - Champs : id, name, color, date_creation
    - Index : name (unique)

### 🔌 Endpoints API

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

> ⚠️ L'authentification se fait uniquement avec **nom d'utilisateur** + **mot de passe**. Les adresses email ne sont pas utilisées.

#### Sacs
- `GET /api/bags` - Liste des sacs avec poches et items
- `GET /api/bags/qr/:qrCode` - Sac par QR code
- `POST /api/bags` - Créer un sac
- `PUT /api/bags/:id` - Modifier un sac
- `DELETE /api/bags/:id` - Supprimer un sac

#### Produits Pharmacie
- `GET /api/pharmacy-products` - Liste des produits
- `POST /api/pharmacy-products` - Créer un produit
- `PUT /api/pharmacy-products/:id` - Modifier un produit
- `DELETE /api/pharmacy-products/:id` - Supprimer un produit

#### Matériel Opérationnel
- `GET /api/operational-equipment` - Liste du matériel
- `POST /api/operational-equipment` - Créer un équipement
- `PUT /api/operational-equipment/:id` - Modifier un équipement
- `DELETE /api/operational-equipment/:id` - Supprimer un équipement

#### Historique
- `GET /api/control-history` - Tous les contrôles
- `GET /api/control-history/bag/:bagId` - Contrôles d'un sac
- `POST /api/control-history` - Enregistrer un contrôle

#### Système
- `GET /api/logs` - Logs système
- `POST /api/logs` - Créer un log
- `GET /api/bug-reports` - Rapports de bugs
- `POST /api/bug-reports` - Créer un rapport
- `PUT /api/bug-reports/:id` - Mettre à jour un rapport
- `GET /api/categories` - Catégories
- `POST /api/categories` - Créer une catégorie
- `DELETE /api/categories/:id` - Supprimer une catégorie
- `POST /api/migrate` - Migrer depuis localStorage
- `GET /api/health` - État de l'API

### 🔧 Améliorations Techniques

#### Performance
- ✅ Requêtes optimisées avec index
- ✅ Transactions pour les opérations complexes
- ✅ Chargement plus rapide des données volumineuses

#### Fiabilité
- ✅ Intégrité référentielle avec clés étrangères
- ✅ Contraintes de validation sur les champs
- ✅ Transactions ACID garanties
- ✅ Pas de perte de données au vidage du cache

#### Scalabilité
- ✅ Gestion de milliers d'enregistrements
- ✅ Recherche et filtrage efficaces
- ✅ Structure extensible pour futures fonctionnalités

### 📦 Dépendances Ajoutées

```json
{
  "better-sqlite3": "^12.6.2",
  "express": "^5.2.1",
  "cors": "^2.8.6",
  "concurrently": "^9.2.1"
}
```

### 🔄 Compatibilité

- ✅ **Rétrocompatible** : Les fonctionnalités existantes sont préservées
- ✅ **Interface identique** : Aucun changement visible pour l'utilisateur
- ✅ **Migration transparente** : Processus automatisé et guidé

### ⚠️ Breaking Changes

**Aucun breaking change pour l'utilisateur final.**

Les développeurs doivent noter :
- Le système nécessite maintenant un serveur backend (Express)
- Les données ne sont plus dans localStorage mais dans SQLite
- L'application doit tourner sur deux ports (3001 pour API, 5173 pour frontend)

### 📊 Statistiques

- **Fichiers créés** : 14
- **Tables SQL** : 11
- **Endpoints API** : 35+
- **Scripts npm** : 5
- **Documentation** : 4 fichiers majeurs
- **Lignes de code backend** : ~1500

### 🚀 Comment Mettre à Jour

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'application
npm run dev:all

# 3. Migrer les données (automatique au premier lancement)
# Une fenêtre vous guidera

# 4. (Optionnel) Ajouter des données d'exemple
npm run seed
```

### 📝 Notes Importantes

1. **Sauvegarde** : Avant de migrer, vos anciennes données restent dans localStorage
2. **Base de données** : Le fichier `stockprotec.db` est créé automatiquement
3. **Ports** : Assurez-vous que les ports 3001 et 5173 sont disponibles
4. **Node.js** : Version 16+ requise

### 🎯 Prochaines Étapes

Fonctionnalités futures possibles :
- [ ] Authentification JWT sécurisée
- [ ] Export des données (Excel, PDF)
- [ ] Synchronisation multi-appareils
- [ ] Application mobile native
- [ ] Notifications push
- [ ] Rapports et statistiques avancés

### 🙏 Remerciements

Merci à tous les utilisateurs de StockProtec pour leurs retours et suggestions qui ont permis d'améliorer cette application.

---

**Version 2.0.0** - Mars 2026
**Protection Civile de la Loire - Antenne de Saint-Étienne**
