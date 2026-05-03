# 💾 Système de sauvegarde - StockProtec v5.2

## 🎯 Vue d'ensemble

StockProtec v5.2 intègre un système de sauvegarde automatique complet et sécurisé, essentiel pour la protection des données critiques de la Protection Civile. Ce guide détaille le fonctionnement, la configuration et l'utilisation du système de sauvegarde.

## 🏗️ Architecture du système

### Composants principaux

#### Moteur de sauvegarde
- **Sauvegarde complète** : Base de données + fichiers
- **Chiffrement AES-256** : Protection des données sensibles
- **Compression** : Réduction de l'espace disque
- **Vérification d'intégrité** : Contrôle des sauvegardes

#### Planificateur automatique
- **Fréquence configurable** : Quotidienne, hebdomadaire, mensuelle
- **Exécution programmée** : Tâches cron intégrées
- **Surveillance** : Alertes en cas d'échec
- **Logs détaillés** : Traçabilité des opérations

#### Interface de gestion
- **Panneau d'administration** : Contrôle complet
- **Création manuelle** : Sauvegardes à la demande
- **Restauration assistée** : Processus guidé
- **Historique** : Liste des sauvegardes avec métadonnées

### Stockage des sauvegardes

#### Structure de fichiers
```
backups/
├── manual/           # Sauvegardes manuelles
│   ├── backup-2024-01-15-manual.json
│   └── backup-2024-01-10-urgence.json
├── automatic/        # Sauvegardes automatiques
│   ├── weekly/
│   │   ├── backup-2024-01-14-weekly.json
│   │   └── backup-2024-01-07-weekly.json
│   └── daily/        # Si activé
│       └── backup-2024-01-15-daily.json
└── temp/            # Fichiers temporaires
    └── backup-in-progress.tmp
```

#### Métadonnées des sauvegardes
```json
{
  "filename": "backup-2024-01-14-weekly.json",
  "type": "automatic",
  "schedule": "weekly",
  "createdAt": "2024-01-14T02:00:00.000Z",
  "size": 2457600,
  "compressedSize": 1843200,
  "checksum": "a1b2c3d4e5f6...",
  "encrypted": true,
  "version": "5.2.6",
  "includes": {
    "database": true,
    "files": true,
    "config": true
  },
  "statistics": {
    "users": 15,
    "products": 1250,
    "movements": 15420,
    "categories": 25
  }
}
```

## ⚙️ Configuration

### Paramètres généraux

#### Configuration de base
```json
{
  "backup": {
    "enabled": true,
    "path": "./backups",
    "retention": {
      "manual": 50,
      "automatic": {
        "daily": 7,
        "weekly": 10,
        "monthly": 12
      }
    },
    "encryption": {
      "enabled": true,
      "algorithm": "aes-256-gcm",
      "keyRotation": "monthly"
    },
    "compression": {
      "enabled": true,
      "level": 6
    }
  }
}
```

#### Planification automatique
```json
{
  "schedules": {
    "daily": {
      "enabled": false,
      "time": "02:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "weekly": {
      "enabled": true,
      "time": "02:00",
      "day": "sunday",
      "retention": 10
    },
    "monthly": {
      "enabled": true,
      "time": "02:00",
      "day": 1,
      "retention": 12
    }
  }
}
```

### Sécurité des sauvegardes

#### Chiffrement
- **Algorithme** : AES-256-GCM (Galois Counter Mode)
- **Clé maître** : Générée automatiquement et stockée sécurisée
- **Rotation** : Changement périodique des clés
- **Backup des clés** : Stockage séparé et sécurisé

#### Accès et permissions
- **Droits restreints** : Uniquement administrateurs
- **Logs d'audit** : Toutes les opérations tracées
- **Authentification** : Double vérification pour restaurations
- **Réseau isolé** : Accès uniquement en local

## 🚀 Utilisation quotidienne

### Sauvegarde manuelle

#### Via l'interface web
1. **Accès** : Menu Administration → Sauvegarde
2. **Création** : Bouton "Créer une sauvegarde"
3. **Nom** : Description optionnelle
4. **Chiffrement** : Activation recommandée
5. **Lancement** : Confirmation et exécution

#### Via API
```bash
# Création de sauvegarde
curl -X POST http://localhost:3001/api/backup/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sauvegarde_mensuelle",
    "description": "Sauvegarde fin de mois",
    "encrypt": true
  }'
```

#### Via ligne de commande
```bash
# Script de sauvegarde
node server/backup.js create --name "manual-backup" --encrypt
```

### Consultation des sauvegardes

#### Liste des sauvegardes
```json
{
  "success": true,
  "data": [
    {
      "filename": "backup-2024-01-14-weekly.json",
      "type": "automatic",
      "size": "2.3 MB",
      "createdAt": "2024-01-14T02:00:00.000Z",
      "status": "completed",
      "encrypted": true
    },
    {
      "filename": "backup-2024-01-10-manual.json",
      "type": "manual",
      "size": "2.1 MB",
      "createdAt": "2024-01-10T15:30:00.000Z",
      "status": "completed",
      "encrypted": true
    }
  ]
}
```

#### Détails d'une sauvegarde
- **Taille originale/compressée**
- **Date de création**
- **Contenu** : Statistiques incluses
- **Intégrité** : Checksum de vérification
- **Statut** : Terminée, en cours, échouée

## 🔄 Restauration des données

### Processus de restauration

#### Préparation
1. **Arrêt du système** : Éviter les conflits de données
2. **Sauvegarde actuelle** : Copie de sécurité supplémentaire
3. **Vérification** : Intégrité de la sauvegarde cible
4. **Plan de rollback** : Stratégie de retour arrière

#### Restauration complète
```bash
# Arrêt de l'application
npm run stop

# Restauration
curl -X POST http://localhost:3001/api/backup/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "backup-2024-01-14-weekly.json",
    "confirm": true
  }'

# Redémarrage
npm run prod
```

#### Restauration partielle (futur)
- **Utilisateurs uniquement**
- **Produits spécifiques**
- **Période donnée**

### Validation post-restauration

#### Contrôles automatiques
- **Intégrité base** : Vérification SQLite
- **Cohérence données** : Contraintes respectées
- **Fonctionnalités** : Tests des opérations critiques
- **Performances** : Vérification des temps de réponse

#### Tests manuels
- **Connexion** : Authentification fonctionnelle
- **CRUD** : Création, lecture, modification
- **Rapports** : Génération correcte
- **Intégrations** : APIs externes opérationnelles

## 📊 Monitoring et alertes

### Métriques de suivi

#### Statistiques de sauvegarde
```json
{
  "lastBackup": {
    "date": "2024-01-14T02:00:00.000Z",
    "duration": 45,
    "size": 2457600,
    "status": "success"
  },
  "backupHistory": {
    "total": 25,
    "successful": 24,
    "failed": 1,
    "averageSize": 2300000,
    "averageDuration": 42
  },
  "storage": {
    "used": "45 MB",
    "available": "1.2 GB",
    "retentionDays": 365
  }
}
```

#### Alertes configurables
- **Échec de sauvegarde** : Notification immédiate
- **Espace disque faible** : Alerte préventive
- **Sauvegarde ancienne** : Plus de X jours
- **Taille anormale** : Écart significatif

### Logs et audit

#### Logs de sauvegarde
```
[2024-01-14 02:00:01] INFO: Starting automatic weekly backup
[2024-01-14 02:00:05] INFO: Database export completed (1.2 MB)
[2024-01-14 02:00:08] INFO: Files backup completed (0.8 MB)
[2024-01-14 02:00:12] INFO: Compression completed (2.0 MB -> 1.5 MB)
[2024-01-14 02:00:15] INFO: Encryption completed
[2024-01-14 02:00:18] INFO: Integrity check passed
[2024-01-14 02:00:20] INFO: Backup completed successfully
```

#### Audit trail
- **Qui** : Utilisateur ayant déclenché l'opération
- **Quand** : Timestamp précis
- **Quoi** : Type d'opération (create/restore/delete)
- **Résultat** : Succès ou échec avec détails

## 🛠️ Maintenance avancée

### Nettoyage automatique

#### Purge des anciennes sauvegardes
```bash
# Script de nettoyage
node server/backup.js cleanup

# Configuration de rétention
{
  "retention": {
    "manual": 50,
    "automatic": {
      "daily": 7,
      "weekly": 10,
      "monthly": 12
    }
  }
}
```

#### Optimisation du stockage
- **Déduplication** : Élimination des doublons
- **Compression avancée** : Algorithmes optimisés
- **Archivage** : Déplacement vers stockage froid

### Diagnostic et réparation

#### Vérification d'intégrité
```bash
# Test de toutes les sauvegardes
node server/backup.js verify

# Résultat
{
  "total": 25,
  "valid": 24,
  "corrupted": 1,
  "missing": 0
}
```

#### Réparation de sauvegardes
```bash
# Tentative de réparation
node server/backup.js repair backup-2024-01-10-manual.json

# Reconstruction si nécessaire
node server/backup.js rebuild
```

### Migration de sauvegardes

#### Changement de format
- **Compatibilité ascendante** : Anciens formats lisibles
- **Migration automatique** : Conversion lors de l'accès
- **Validation** : Vérification post-migration

#### Déplacement de stockage
- **Changement de chemin** : Migration vers nouveau disque
- **Cloud storage** : Support pour stockage distant (futur)
- **Synchronisation** : Multi-sites (futur)

## 🔒 Sécurité avancée

### Gestion des clés de chiffrement

#### Rotation des clés
```bash
# Rotation manuelle
node server/backup.js rotate-keys

# Rotation automatique (programmée)
# Configuration dans le planificateur
{
  "keyRotation": {
    "enabled": true,
    "interval": "monthly",
    "backupKeys": true
  }
}
```

#### Sauvegarde des clés
- **Stockage séparé** : Clés dans vault sécurisé
- **Récupération d'urgence** : Procédure documentée
- **Destruction sécurisée** : Effacement cryptographique

### Conformité et audit

#### Traçabilité légale
- **RGPD compliant** : Conservation selon réglementations
- **Horodatage** : Timestamps certifiés
- **Immuabilité** : Intégrité garantie
- **Audit externe** : Vérification possible

#### Tests de sécurité
- **Tentatives d'accès** : Monitoring des échecs
- **Intégrité** : Vérifications périodiques
- **Récupération** : Tests de restauration réguliers

## 📈 Performance et optimisation

### Optimisations de performance

#### Parallélisation
- **Multi-threading** : Utilisation des cœurs CPU
- **Traitement par blocs** : Données traitées par chunks
- **I/O optimisé** : Buffers et cache intelligents

#### Métriques de performance
```json
{
  "performance": {
    "averageBackupTime": 42,
    "averageRestoreTime": 38,
    "compressionRatio": 0.68,
    "cpuUsage": 15,
    "memoryUsage": 85
  }
}
```

### Recommandations d'infrastructure

#### Configuration minimale
- **CPU** : 2 cœurs pour sauvegardes simultanées
- **RAM** : 2 GB pour bases importantes
- **Disque** : SSD recommandé pour performance
- **Réseau** : Stable pour sauvegardes distantes

#### Optimisations par taille
- **Petite base** (< 100 MB) : Sauvegarde complète rapide
- **Base moyenne** (100 MB - 1 GB) : Compression et chiffrement
- **Grande base** (> 1 GB) : Parallélisation et optimisation

## 🚨 Plan de continuité

### Scénarios de sinistre

#### Perte de données
1. **Arrêt immédiat** : Isolation du système
2. **Évaluation** : Étendue des dommages
3. **Restauration** : Utilisation de la dernière sauvegarde
4. **Vérification** : Tests post-restauration

#### Récupération d'urgence
- **Site de secours** : Serveur de backup configuré
- **Procédures documentées** : Runbook détaillé
- **Tests réguliers** : Simulations de sinistre
- **Temps de récupération** : Objectif < 4 heures

### Haute disponibilité (futur)

#### Architecture distribuée
- **Sauvegardes multiples** : Sites géographiques
- **Réplication temps réel** : Synchronisation continue
- **Basculement automatique** : Redondance active
- **Monitoring avancé** : Alertes prédictives

---

*Guide du système de sauvegarde - StockProtec v5.2.6*
*Sauvegarde testée et validée - Avril 2026*

**Point de contact :** Administrateur système pour questions techniques