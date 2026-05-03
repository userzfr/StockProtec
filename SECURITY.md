# 🔒 Politique de sécurité - StockProtec v5.2

[![Version](https://img.shields.io/badge/version-5.2.6-blue.svg)](https://github.com/userzfr/StockProtec/releases/tag/v5.2.6)
[![Security](https://img.shields.io/badge/Security-First-red.svg)](SECURITY.md)

## 📌 Versions supportées

Cette politique de sécurité s'applique uniquement aux versions **v5.x** de StockProtec.

| Version | Support sécurité | Support technique |
|---------|------------------|-------------------|
| `v5.2.x` | ✅ **Complet** | ✅ Supportée |
| `v5.1.x` | ⚠️ **Critique uniquement** | ✅ Supportée |
| `v5.0.x` | ❌ **Non supportée** | ❌ Non supportée |
| `< v5` | ❌ **Non supportée** | ❌ Non supportée |

> **Important** : Les versions antérieures à v5.0 ne reçoivent plus de correctifs de sécurité.

---

## 🚨 Signalement de vulnérabilité

Si vous découvrez une vulnérabilité dans StockProtec, merci de la signaler de manière responsable.

### 📧 Contact sécurisé
- **Email** : [userz_fr@outlook.fr](mailto:userz_fr@outlook.fr)
- **Discord** : Contact direct `userz_fr`
- **GitHub** : [Issues privées](https://github.com/userzfr/StockProtec/security/advisories/new)

### 📋 Informations à fournir
1. **Description précise** du problème de sécurité
2. **Étapes de reproduction** détaillées
3. **Impact potentiel** et gravité
4. **Versions affectées** et environnement
5. **Preuve de concept** (si possible)

### ⏱️ Délais de réponse
- **Accusé de réception** : 24-48 heures
- **Analyse initiale** : 3-5 jours ouvrés
- **Correctif** : Selon la criticité (1-30 jours)
- **Divulgation** : Après correction et tests

---

## 🔐 Mesures de sécurité implémentées

### 🛡️ Authentification & Autorisation

#### Hashage des mots de passe
- **Algorithme** : PBKDF2 avec SHA-256
- **Itérations** : 100,000 (recommandé par OWASP)
- **Sel** : Généré aléatoirement (32 octets)
- **Stockage** : Jamais en clair dans localStorage ou base de données

```javascript
// Exemple d'implémentation
const hash = await pbkdf2(password, salt, 100000, 64, 'sha256');
```

#### Gestion des sessions
- **JWT Tokens** : Signés avec clé secrète
- **Expiration** : Sessions limitées dans le temps
- **Invalidation** : Déconnexion forcée après changement de mot de passe
- **Logs d'audit** : Traçabilité complète des connexions

#### Protection contre les attaques courantes
- **CORS** : Configuration restrictive des origines
- **Rate limiting** : Protection contre les attaques par déni de service
- **Input validation** : Sanitisation de toutes les entrées utilisateur
- **SQL Injection** : Prévention via requêtes préparées SQLite

### 🗄️ Sécurité de la base de données

#### Chiffrement des données sensibles
- **Mots de passe** : Hashés avec PBKDF2 (jamais stockés en clair)
- **Données personnelles** : Chiffrées si nécessaire
- **Clés API** : Stockées de manière sécurisée

#### Contrôle d'accès
- **Principe du moindre privilège** : Utilisateurs ont uniquement les droits nécessaires
- **Rôles définis** : Administrateur vs Utilisateur standard
- **Audit trail** : Historique complet des modifications

### 🔄 Système de sauvegarde sécurisé

#### Sauvegarde automatique
- **Fréquence** : Hebdomadaire (tous les dimanches à 02:00)
- **Chiffrement** : Sauvegardes chiffrées AES-256
- **Rétention** : Conservation des 10 dernières sauvegardes
- **Vérification** : Intégrité vérifiée avant restauration

#### Gestion des sauvegardes
- **Interface sécurisée** : Accès administrateur uniquement
- **Logs d'audit** : Traçabilité des opérations de sauvegarde
- **Restauration contrôlée** : Processus manuel avec confirmation

### 🌐 Sécurité réseau

#### Configuration serveur
- **HTTPS recommandé** : Utilisation de certificats SSL/TLS
- **Headers de sécurité** :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
- **CORS** : Origines autorisées explicitement

#### API REST
- **Authentification requise** : Toutes les routes protégées
- **Validation des entrées** : Schémas stricts pour toutes les requêtes
- **Rate limiting** : Protection contre les abus
- **Logs détaillés** : Monitoring des accès API

### 📱 Sécurité frontend

#### Stockage local
- **Pas de mots de passe** : Jamais stockés dans localStorage/sessionStorage
- **Données sensibles** : Chiffrées ou non stockées localement
- **Nettoyage automatique** : Suppression des données à la déconnexion

#### Protection XSS
- **Sanitisation** : Toutes les entrées utilisateur nettoyées
- **CSP (Content Security Policy)** : Headers restrictifs
- **Validation côté client** : Vérifications avant envoi

### 📊 Conformité RGPD

#### Droits des utilisateurs
- **Accès aux données** : Possibilité de consulter ses données
- **Rectification** : Modification des données personnelles
- **Suppression** : Droit à l'oubli (suppression de compte)
- **Portabilité** : Export des données utilisateur

#### Traçabilité
- **Logs d'audit** : Historique de toutes les actions
- **Conservation limitée** : Logs purgés automatiquement
- **Accès contrôlé** : Logs accessibles uniquement aux admins

### 🔍 Monitoring & Alertes

#### Logs système
- **Niveaux de log** : ERROR, WARN, INFO, DEBUG
- **Rotation automatique** : Fichiers de logs gérés
- **Alertes** : Notifications pour événements critiques
- **Audit trail** : Traçabilité complète des opérations

#### Métriques de sécurité
- **Tentatives de connexion** : Monitoring des échecs
- **Accès aux ressources** : Logs des consultations
- **Modifications sensibles** : Audit des changements

---

## 🚫 Vulnérabilités non couvertes

Cette politique ne couvre pas :
- Vulnérabilités dans les dépendances tierces non maintenues
- Problèmes de sécurité liés à la configuration système (OS, réseau)
- Attaques physiques sur le matériel
- Ingénierie sociale

---

## 📈 Plan d'amélioration continue

### 🔄 Mises à jour de sécurité
- **Dépendances** : Mises à jour régulières des packages
- **Code review** : Révision systématique des changements
- **Tests de sécurité** : Intégration de tests automatisés
- **Audit externe** : Révision périodique par des experts

### 🎯 Prochaines améliorations (v5.3)
- **Authentification multi-facteurs (2FA)**
- **Chiffrement end-to-end pour les données sensibles**
- **Audit de sécurité automatisé**
- **Intégration SIEM pour la surveillance**

---

## 📞 Support & Contact

### 🆘 Urgences sécurité
Pour les vulnérabilités critiques affectant des systèmes en production :
- **Contact immédiat** : userz_fr@outlook.fr
- **Réponse garantie** : Sous 24 heures

### 📚 Ressources
- **[Documentation complète](docs/DOCUMENTATION_INDEX.md)**
- **[Guide développeur](docs/DEVELOPER_GUIDE.md)**
- **[API Reference](docs/API_REFERENCE.md)**

---

*Politique de sécurité - StockProtec v5.2.6*
*Dernière mise à jour : Avril 2026*

*Développé avec une approche "Security First" 🛡️*

### Gestion des sessions

- ✅ **Timeout d'inactivité** : 10 minutes sans interaction = déconnexion automatique
- ✅ **Validation périodique** : Vérification du compte toutes les 10 secondes
- ✅ **Détection de suppression** : Déconnexion immédiate si le compte est supprimé
- ✅ **Stockage sécurisé** : Sessions en localStorage avec lastActivity
- ✅ **Focus validation** : Vérification au retour sur l'application

### Protection des données

- ✅ **Mots de passe** : Stockés en base (salés/hashés envisagés pour v5.1)
- ✅ **Logs d'audit** : 100% des opérations tracées
- ✅ **Anonymisation** : Utilisateurs supprimés remplacés par "Utilisateur supprimé"
- ✅ **Intégrité DB** : Clés étrangères activées
- ✅ **Transactions** : Opérations critiques atomiques

### Contrôles d'accès

- ✅ **Rôles** : admin vs user
- ✅ **Autorisations** : Panel admin réservé aux admins
- ✅ **Audit trail** : Qui a fait quoi et quand
- ✅ **Actions protégées** : Suppression utilisateur = admin uniquement

### Transport et réseau

- ✅ **CORS** : Autorise uniquement localhost:5173 en dev
- ✅ **JSON** : Données sérialisées et validées
- ✅ **API** : Endpoints validés côté serveur
- ✅ **Errors** : Messages génériques (pas de stack trace)

---

## ⚠️ Bonnes pratiques

### Pour les administrateurs

1. **Changez les mots de passe par défaut** immédiatement après installation
2. **Gardez une admin actif** pour ne pas bloquer les opérations
3. **Consultez les logs régulièrement** pour détecter anomalies
4. **Testez la déconnexion** après suppression d'utilisateur
5. **Sauvegardez la base** (`stockprotec.db`) régulièrement

### Pour les développeurs

1. **Ne commitez jamais** de mots de passe ou données sensibles
2. **Validez toujours** les données côté backend
3. **Utilisez des transactions** pour les opérations multi-table
4. **Testez les cas limites** (session expirant, DB inaccessible, etc.)
5. **Loggez les erreurs** pour audit et débogage

### Pour les utilisateurs

1. **Loguez-vous** avant les opérations sensibles
2. **Attendez pas** l'inactivité timeout (10 min est la limite)
3. **Fermez la session** manuellement quand vous partez
4. **Ne partagez pas** votre mot de passe
5. **Reportez les anomalies** aux administrateurs

---

## ❌ Ce qui n'est plus couvert

- versions antérieures à `v5.x`
- anciennes installations basées uniquement sur `localStorage`
- versions legacy non mises à jour depuis 2025

---

## 📞 Contact

Pour tout signalement de bug, vulnérabilité ou problème technique :

- **Discord** : MP à `userz_fr` (ID: 634442174305402883)
- **GitHub** : Ouvrez une [issue](https://github.com/userzfr/StockProtec/issues) ou une [pull request](https://github.com/userzfr/StockProtec/pulls) de rapport de bug

Le mainteneur (`userz_fr`) répondra dans les plus brefs délais.
