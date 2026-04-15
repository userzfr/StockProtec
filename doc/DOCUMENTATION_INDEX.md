# 📚 Index de Documentation - StockProtec v5

## ⚠️ Versions supportées

- ✅ **StockProtec v5** : Seule version supportée
- ❌ Versions antérieures : Non supportées

> **Important** : Cette documentation concerne uniquement la version v5. Les anciennes versions ne sont plus documentées ni supportées.

## 📋 Documents principaux

### 🚀 Démarrage et Installation
- **[QUICKSTART.md](QUICKSTART.md)** : Démarrage rapide en 5 minutes
- **[INSTALLATION.md](INSTALLATION.md)** : Installation détaillée et prérequis

### 🔄 Migration
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** : Migration depuis localStorage vers SQLite
- **[MIGRATION_POSTGRESQL.md](MIGRATION_POSTGRESQL.md)** : Migration avancée (PostgreSQL)

### 🛠️ Développement
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** : Guide complet pour les développeurs
- **[GUIDE_BASE_DONNEES.md](GUIDE_BASE_DONNEES.md)** : Structure et schémas base de données

### 📝 Historique
- **[CHANGELOG.md](CHANGELOG.md)** : Historique des versions et changements

## 🏗️ Architecture du projet

### Frontend (React + Vite)
- `src/app/` : Composants principaux
- `src/app/components/` : Composants UI
- `src/app/contexts/` : Contextes React (Auth)
- `src/app/services/` : Client API
- `src/app/utils/` : Utilitaires

### Backend (Node.js + Express)
- `server/server.js` : Point d'entrée API
- `server/database.js` : Initialisation SQLite
- `server/migrate.js` : Scripts de migration
- `server/seed.js` : Données de test

### Base de données (SQLite)
- `stockprotec.db` : Fichier base de données local
- Tables : bags, categories, pharmacy_products, users, logs

## 🔧 Scripts npm utiles

```bash
# Développement
npm run dev:all          # Frontend + Backend
npm run dev              # Frontend uniquement
npm run server           # Backend uniquement

# Production
npm run build            # Build frontend
npm run preview          # Preview build

# Base de données
npm run migrate          # Migration base de données
npm run seed             # Données de test

# Maintenance
npm run clean            # Nettoyer build
```

## 📊 Fonctionnalités principales

### Gestion des sacs
- Création avec QR code automatique
- Suivi du statut de déploiement
- Historique des mouvements
- Impression des codes-barres

### Gestion pharmacie
- Inventaire des produits
- Suivi des lots et dates d'expiration
- Alertes de péremption
- Statistiques de stock

### Gestion opérationnelle
- Équipements opérationnels
- Contrôles périodiques
- Historique des inspections
- Rapports d'activité

### Administration
- Gestion des utilisateurs
- Logs d'audit
- Sauvegarde/Export des données
- Réinitialisation sécurisée

## 🔒 Sécurité et conformité

### Authentification
- Sessions utilisateur sécurisées
- Mots de passe hashés
- Déconnexion automatique

### Données
- Base de données locale (SQLite)
- Pas de données sensibles en localStorage
- Export/Sauvegarde possibles

### Conformité
- RGPD : Données locales uniquement
- Audit trail complet
- Logs des opérations sensibles

## 🚨 Support et maintenance

### Versions supportées
- ✅ v5.x : Support actif
- ❌ v4.x et antérieures : Non supportées

### Signalement de bugs
- Utiliser le composant `BugReportButton`
- Inclure les logs console et serveur
- Décrire les étapes de reproduction

### Mises à jour
- Suivre la branche `main`
- Vérifier le CHANGELOG.md
- Migration automatique des données

## 📞 Contact et support

Pour toute question technique :
- Consulter d'abord cette documentation
- Vérifier les logs d'erreur
- Utiliser les outils de débogage intégrés

## 📈 Évolution du projet

### v5.0.0 (actuelle)
- Migration complète vers SQLite
- Nouveau système de persistance
- Améliorations de sécurité
- Interface utilisateur modernisée

### Versions futures
- Optimisations de performance
- Nouvelles fonctionnalités métier
- Améliorations d'accessibilité
- Support mobile (PWA)