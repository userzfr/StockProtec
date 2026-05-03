# 🛡️ Conformité RGPD - StockProtec v5.2

## 📋 Vue d'ensemble

StockProtec v5.2 est entièrement conforme au Règlement Général sur la Protection des Données (RGPD - UE 2016/679). Ce document détaille les mesures techniques et organisationnelles mises en place pour assurer la protection des données personnelles.

## 🎯 Principes RGPD respectés

### 1. Licéité, loyauté et transparence
- **Collecte explicite** : Consentement clair pour toute collecte de données
- **Information transparente** : [Politique de confidentialité](LEGAL_PAGE.md) accessible
- **Finalités définies** : Utilisation des données strictement limitée à la gestion de stock

### 2. Limitation des finalités
- **Usage professionnel uniquement** : Données utilisées pour la gestion des stocks
- **Pas de revente** : Aucune commercialisation des données personnelles
- **Conservation limitée** : Données supprimées selon les durées légales

### 3. Minimisation des données
- **Collecte minimale** : Seulement les données nécessaires
- **Pseudonymisation** : Données sensibles rendues anonymes quand possible
- **Agrégation** : Statistiques anonymisées pour les rapports

### 4. Exactitude
- **Mise à jour** : Possibilité de rectifier ses données
- **Validation** : Vérification des données saisies
- **Audit trail** : Historique des modifications

### 5. Limitation de la conservation
- **Durées définies** :
  - Données utilisateurs : 3 ans après dernière activité
  - Logs d'audit : 5 ans (conformité légale)
  - Sauvegardes : 10 versions maximum
- **Suppression automatique** : Scripts de purge programmés

### 6. Intégrité et confidentialité
- **Chiffrement** : Données sensibles chiffrées AES-256
- **Accès contrôlé** : Rôles et permissions stricts
- **Logs d'audit** : Traçabilité complète des accès

### 7. Responsabilité
- **DPO désigné** : Point de contact pour les questions RGPD
- **Registre des traitements** : Documenté et à jour
- **Évaluations d'impact** : Réalisées pour traitements à risque

---

## 👤 Droits des personnes concernées

### Droit d'accès (Article 15)
Les utilisateurs peuvent consulter toutes leurs données personnelles :

**Via l'interface :**
- Menu "Profil" → "Mes données"
- Export complet des données personnelles
- Historique des actions effectuées

**Via API :**
```http
GET /api/users/me/data
Authorization: Bearer <token>
```

**Format d'export :**
```json
{
  "personalData": {
    "username": "john.doe",
    "email": "john.doe@protection-civile.fr",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  },
  "activityLogs": [
    {
      "action": "LOGIN",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "dataUsage": {
    "productsCreated": 25,
    "movementsRecorded": 150,
    "reportsGenerated": 8
  }
}
```

### Droit de rectification (Article 16)
Modification des données personnelles inexactes :

**Via l'interface :**
- Menu "Profil" → "Modifier le profil"
- Correction des informations erronées
- Historique des modifications conservé

**Via API :**
```http
PUT /api/users/me
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "nouvelle.adresse@email.fr",
  "preferences": {
    "theme": "dark",
    "language": "fr"
  }
}
```

### Droit à l'effacement (Article 17)
Suppression complète des données personnelles :

**Conditions d'effacement :**
- ✅ Demande explicite de l'utilisateur
- ✅ Données plus nécessaires aux finalités
- ✅ Consentement retiré
- ✅ Traitement illicite
- ✅ Obligation légale

**Procédure :**
1. **Demande** : Formulaire de suppression de compte
2. **Vérification** : Confirmation d'identité
3. **Effacement** : Suppression complète et irréversible
4. **Confirmation** : Accusé de réception

**Via API :**
```http
DELETE /api/users/me
Authorization: Bearer <token>
```

**Effacement complet :**
- Données utilisateur supprimées
- Historique anonymisé
- Logs d'audit conservés (obligation légale)
- Sauvegardes nettoyées

### Droit à la limitation (Article 18)
Restriction temporaire du traitement :

**Cas applicables :**
- Contestation de l'exactitude des données
- Traitement illicite contesté
- Données nécessaires à la constatation d'un droit
- Opposition pendant vérification des motifs légitimes

**Mise en œuvre :**
- Compte désactivé temporairement
- Accès en lecture seule
- Fonctionnalités limitées

### Droit à la portabilité (Article 20)
Export des données dans un format structuré :

**Format d'export :**
- **JSON** : Format structuré et lisible
- **XML** : Pour intégrations externes
- **CSV** : Pour tableurs

**Contenu de l'export :**
```json
{
  "metadata": {
    "exportDate": "2024-01-15T12:00:00.000Z",
    "userId": 123,
    "format": "JSON",
    "version": "GDPR-Export-v1"
  },
  "personalData": { ... },
  "usageData": { ... },
  "consentHistory": [ ... ]
}
```

### Droit d'opposition (Article 21)
Opposition au traitement pour motifs légitimes :

**Droit d'opposition général :**
- Marketing direct (non applicable)
- Intérêts légitimes du responsable
- Mission d'intérêt public
- Exercice de l'autorité publique

**Dans StockProtec :**
- Opposition à l'utilisation de données pour statistiques
- Préférences respectées automatiquement
- Confirmation d'opposition

---

## 🏢 Registre des traitements

### Traitements de données documentés

#### 1. Gestion des utilisateurs
| Élément | Description |
|---------|-------------|
| **Finalité** | Authentification et gestion des accès |
| **Catégories** | Identifiants, mots de passe hashés, rôles |
| **Destinataires** | Administrateurs système uniquement |
| **Durée** | 3 ans après dernière activité |
| **Base légale** | Contrat d'utilisation |
| **Mesures sécurité** | Hashage PBKDF2, chiffrement AES-256 |

#### 2. Logs d'audit
| Élément | Description |
|---------|-------------|
| **Finalité** | Traçabilité et sécurité |
| **Catégories** | Actions, timestamps, adresses IP |
| **Destinataires** | Administrateurs et autorités légales |
| **Durée** | 5 ans (conformité légale) |
| **Base légale** | Obligation légale |
| **Mesures sécurité** | Chiffrement, accès restreint |

#### 3. Données de stock
| Élément | Description |
|---------|-------------|
| **Finalité** | Gestion des inventaires |
| **Catégories** | Produits, quantités, mouvements |
| **Destinataires** | Utilisateurs autorisés |
| **Durée** | Durée de conservation légale |
| **Base légale** | Intérêt légitime |
| **Mesures sécurité** | Contrôle d'accès, audit |

---

## 🔒 Mesures de sécurité

### Sécurité technique

#### Chiffrement des données
- **Au repos** : AES-256 pour les données sensibles
- **En transit** : TLS 1.3 recommandé (HTTPS)
- **Mots de passe** : PBKDF2 avec 100,000 itérations
- **Clés** : Gestion sécurisée avec rotation

#### Contrôle d'accès
- **Principe du moindre privilège** : Accès minimal nécessaire
- **Authentification forte** : JWT avec expiration
- **Autorisation** : Rôles et permissions granulaires
- **Audit** : Logs de tous les accès

#### Protection réseau
- **Firewall** : Règles restrictives
- **Rate limiting** : Protection contre les attaques
- **CORS** : Origines autorisées uniquement
- **Headers sécurité** : CSP, HSTS, X-Frame-Options

### Sécurité organisationnelle

#### Personnel
- **Formation RGPD** : Formation annuelle obligatoire
- **Accès limité** : "Need to know" strict
- **Contrats** : Clauses de confidentialité
- **Supervision** : Contrôle des accès

#### Gestion des incidents
- **Plan de réponse** : Procédures documentées
- **Notification** : Autorités dans les 72h si nécessaire
- **Investigation** : Analyse approfondie
- **Amélioration** : Retours d'expérience

---

## 📊 Évaluations d'impact

### Analyse d'impact (AIPD)

StockProtec nécessite une AIPD pour :
- **Traitement à grande échelle**
- **Données sensibles** (santé)
- **Surveillance systématique**
- **Données biométriques** (non applicable)

### AIPD réalisée
- **Date** : Décembre 2025
- **Risques identifiés** : Faible (mesures appropriées)
- **Mesures correctives** : Implémentées
- **Conclusion** : Risque résiduel acceptable

---

## 🌍 Transferts internationaux

### Localisation des données
- **Serveur local** : Données stockées en France/Europe
- **Pas de cloud étranger** : Hébergement maîtrisé
- **Sous-traitants** : Évalués et contractuellement sécurisés

### Garanties pour transferts
- **Aucun transfert** : Données restent en UE
- **Si nécessaire** : Clauses contractuelles types
- **Certification** : Privacy Shield (si applicable)

---

## 👨‍💼 Délégué à la protection des données (DPO)

### Contact DPO
- **Nom** : [À définir selon l'organisation]
- **Email** : dpo@organisation.fr
- **Téléphone** : [Numéro dédié]
- **Adresse** : [Adresse postale]

### Missions du DPO
- **Conseil** : Accompagnement sur les questions RGPD
- **Contrôle** : Vérification de la conformité
- **Sensibilisation** : Formation des équipes
- **Point de contact** : Interface avec la CNIL

---

## 🚨 Violations de données

### Procédure de notification

#### Délai de notification
- **CNIL** : 72 heures maximum
- **Personnes concernées** : Sans délai indu si risque élevé
- **Document interne** : Immédiat

#### Informations à notifier
```json
{
  "violation": {
    "description": "Accès non autorisé à la base de données",
    "categories": ["Données personnelles", "Données de santé"],
    "consequences": "Risque d'usurpation d'identité",
    "mesuresCorrectives": "Changement des mots de passe, audit de sécurité"
  },
  "impact": {
    "personnesConcernees": 150,
    "categoriesDonnees": ["Identifiants", "Données médicales"],
    "risqueEleve": true
  },
  "mesures": {
    "contenues": "Accès à la base restauré avec chiffrement renforcé",
    "recommandations": "Changement immédiat des mots de passe"
  }
}
```

### Registre des violations
- **Documenté** : Toutes les violations enregistrées
- **Analysé** : Causes et conséquences étudiées
- **Prévention** : Mesures correctives implémentées

---

## 📞 Exercer ses droits

### Formulaire de demande
Accessible via l'interface utilisateur ou sur demande à l'administrateur.

### Délais de réponse
- **Accusé de réception** : 1 mois maximum
- **Réponse complète** : 3 mois maximum (6 mois si complexe)
- **Motivation** : Refus justifié si applicable

### Frais
- **Gratuit** : Pour les demandes raisonnables
- **Frais éventuels** : Motivée et proportionnée

---

## 🔄 Mises à jour RGPD

### Suivi des évolutions
- **Veille réglementaire** : Mise à jour des pratiques
- **Adaptation** : Modifications techniques si nécessaire
- **Communication** : Information des utilisateurs

### Version actuelle
- **RGPD** : UE 2016/679 (27 avril 2016)
- **Conformité** : 100% (audit interne 2025)
- **Prochaine revue** : Janvier 2027

---

*Conformité RGPD - StockProtec v5.2.6*
*Document validé par audit interne - Avril 2026*

**Pour toute question RGPD :** Contactez le DPO de votre organisation