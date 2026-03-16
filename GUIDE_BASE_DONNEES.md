# Guide d'utilisation - Base de Données et Migration

## 🎉 Tout est prêt !

Votre application StockProtec est maintenant configurée avec une base de données SQLite et démarre automatiquement avec des données d'exemple.

## 📁 Structure des données

### Base de données SQLite
- **Fichier** : `stockprotec.db` (dans le répertoire racine du projet)
- **Stockage** : Local, asynque, persistent
- **Avantages** : Pas besoin de serveur externe, fonctionne hors ligne

### Données disponibles

L'application contient déjà des données d'exemple :

#### Utilisateurs
- **Admin** : admin@protectioncivile42.fr / admin123
- **Utilisateur Test** : user@protectioncivile42.fr / user123

#### Matériel opérationnel
- **Sac de Premiers Secours PSE1** - Status OK
- **Sac Intervention Urbaine** - Status Critique (Déployé à Stade Geoffroy-Guichard)
- **Sac Matériel de Réanimation** - Status OK

#### Stock pharmacie
- **Paracétamol 500mg** - 150 unités
- **Compresses stériles 10x10cm** - 200 unités
- **Sérum physiologique 500ml** - Stock bas (3 unités)

#### Matériel embarqué
- **Défibrillateur Automatique DSA** - 2 unités
- **Aspirateur de mucosités électrique** - 1 unité
- **Bouteille O2 5L avec manodétendeur** - 4 unités

## 🔄 Bouton Migration

Un bouton **Migration** a été ajouté au header de l'application (à côté d'Admin et Déconnexion).

### Comment l'utiliser

1. **Cliquez sur le bouton "Migration"** dans le header
2. Le système détecte automatiquement si vous avez des données dans le localStorage
3. **Cliquez sur "Migrer"** pour transférer vos données vers la base de données SQLite
4. L'application se recharge automatiquement avec les données migrées

### Cas d'usage

- **Si vous aviez des données locales** : Utilisez Migration pour les transférer dans la base de données persistente
- **Si vous commencez frais** : Le système utilise les données d'exemple pour commencer

## 💾 Sauvegarde et restore

### Sauvegarder vos données
```bash
# Copier simplement le fichier stockprotec.db
cp stockprotec.db stockprotec.backup.db
```

### Restaurer
```bash
# Remplacer le fichier courant
cp stockprotec.backup.db stockprotec.db
```

## 🚀 Futures améliorations

- Support de PostgreSQL (déjà implémenté, voir `MIGRATION_POSTGRESQL.md`)
- Synchronisation multi-appareils
- Export/Import de données
- Sauvegarde cloud optionnelle

## ⚙️ Démarrage

```bash
# Démarrage automatique avec le fichier START.bat
START.bat

# Ou manuellement
npm run dev:all
```

L'application se lance sur les ports :
- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001/api
