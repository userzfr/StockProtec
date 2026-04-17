# 🔒 Security Policy

## 📌 Supported Versions

Cette politique de sécurité concerne uniquement la version **v5** de StockProtec.
Les versions antérieures ne sont plus prises en charge.

| Version | Support sécurité |
|--------|------------------|
| `v5.x` | ✅ Supportée |
| `v4.x` | ❌ Non supportée |
| `< v4` | ❌ Non supportée |

---

## 🚨 Signalement de vulnérabilité

Si vous découvrez une vulnérabilité dans StockProtec, merci de la signaler de manière responsable.

1. **Ne publiez pas l'information publiquement.**
2. Contactez l'auteur ou le mainteneur du projet directement.
3. Fournissez les détails suivants :
   - Description précise du problème
   - Étapes pour reproduire
   - Impact potentiel
   - Versions affectées

---

## 🔐 Ce qui est couvert

La politique couvre :

- vulnérabilités de sécurité du code du backend
- vulnérabilités de sécurité du code du frontend
- problèmes liés à la base de données SQLite
- fuite de données via l'API
- gestion sécurisée des sessions et authentification
- protection contre les accès non autorisés

---

## 🔒 Mesures de sécurité implémentées

### Authentification

- ✅ Validation des credentials (username/password)
- ✅ Mots de passe jamais transmis en clair
- ✅ Logs d'audit pour chaque connexion
- ✅ Prévention de l'auto-suppression de compte

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
