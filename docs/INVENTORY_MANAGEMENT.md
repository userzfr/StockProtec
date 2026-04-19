# 📦 Gestion des stocks - StockProtec v5.2

## 🎯 Vue d'ensemble

Le module de gestion des stocks de StockProtec v5.2 offre une solution complète pour la gestion des inventaires de la Protection Civile. Ce guide détaille toutes les fonctionnalités disponibles pour une gestion efficace des produits et matériels.

## 📊 Tableaux de bord

### Vue d'ensemble des stocks

#### Indicateurs principaux
- **Total produits** : Nombre total de références
- **Valeur totale** : Valeur estimée de l'inventaire
- **Alertes stock** : Produits en rupture ou faible quantité
- **Mouvements du jour** : Entrées et sorties de la journée

#### Graphiques interactifs
- **Évolution des stocks** : Courbes sur les 30 derniers jours
- **Répartition par catégories** : Camemberts des familles de produits
- **Top produits** : Articles les plus utilisés
- **Tendances** : Prévisions basées sur l'historique

### Alertes et notifications

#### Types d'alertes
- **🔴 Rupture de stock** : Quantité = 0
- **🟠 Stock faible** : Quantité ≤ seuil minimum
- **🟡 Stock élevé** : Quantité ≥ seuil maximum
- **🔵 Périmé proche** : Expiration dans 30 jours
- **⚫ Périmé** : Date dépassée

#### Configuration des seuils
```json
{
  "alertThresholds": {
    "lowStock": 20,
    "highStock": 500,
    "expirationWarning": 30,
    "expirationCritical": 7
  }
}
```

## 🏷️ Gestion des produits

### Création d'un produit

#### Informations de base (obligatoires)
- **Nom** : Désignation claire et précise
- **Catégorie** : Classification hiérarchique
- **Quantité initiale** : Stock de départ
- **Unité** : Pièce, boîte, kg, litre, etc.

#### Informations détaillées (recommandées)
- **Description** : Caractéristiques techniques
- **Code-barres** : EAN-13 ou génération automatique
- **Numéro de lot** : Traçabilité fournisseur
- **Date d'expiration** : Pour produits périssables
- **Fournisseur** : Origine du produit
- **Emplacement** : Localisation physique
- **Prix unitaire** : Valeur pour inventaire

#### Exemple de création
```json
{
  "name": "Paracétamol 500mg - 100 comprimés",
  "description": "Antalgique et antipyrétique - Boîte de 100",
  "category": "Médicaments/Analgésiques",
  "quantity": 50,
  "unit": "boîtes",
  "barcode": "3400930001234",
  "batchNumber": "LOT2024001",
  "expirationDate": "2026-12-31",
  "supplier": "Pharmacie Centrale",
  "location": "Armoire A-12",
  "price": 12.50,
  "minQuantity": 10,
  "maxQuantity": 100
}
```

### Modification des produits

#### Champs modifiables
- Toutes les informations sauf l'identifiant unique
- Historique des modifications conservé
- Validation des changements sensibles

#### Modification en masse
- **Sélection multiple** : Cases à cocher
- **Actions groupées** : Changement de catégorie, fournisseur
- **Import CSV** : Mise à jour par fichier

### Suppression de produits

#### Suppression logique
- Produit marqué comme inactif
- Historique conservé
- Non visible dans les listes actives

#### Suppression définitive (admin uniquement)
- **Conditions** : Aucun mouvement depuis 2 ans
- **Confirmation** : Validation manuelle requise
- **Audit** : Trace complète de la suppression

## 📁 Organisation par catégories

### Structure hiérarchique

#### Niveaux de catégories
```
🏥 Médicaments
  ├── 💊 Analgésiques
  │   ├── Paracétamol
  │   └── Ibuprofène
  └── 💉 Injectables
      ├── Insuline
      └── Vaccins

🚑 Matériel médical
  ├── 🩹 Pansements
  ├── 🥼 Vêtements
  └── 🛏️ Mobilier
```

#### Gestion des catégories
- **Création** : Nom, description, couleur, parent
- **Modification** : Réorganisation par glisser-déposer
- **Suppression** : Fusion avec catégorie parente
- **Statistiques** : Nombre de produits, valeur totale

### Règles de catégorisation

#### Bonnes pratiques
- **Cohérence** : Nomenclature uniforme
- **Hiérarchie logique** : 3 niveaux maximum
- **Codes couleur** : Identification visuelle rapide
- **Mise à jour** : Révision annuelle

## 📈 Gestion des mouvements

### Types de mouvements

#### Entrée de stock
- **Réception fournisseur** : Livraison programmée
- **Retour** : Produits retournés
- **Ajustement** : Correction d'inventaire
- **Transfert interne** : Déplacement entre sites

#### Sortie de stock
- **Utilisation** : Consommation normale
- **Distribution** : Livraison à autre entité
- **Périmé** : Destruction pour expiration
- **Perte** : Produit endommagé

### Enregistrement d'un mouvement

#### Formulaire standard
```json
{
  "productId": 1,
  "type": "OUT",
  "quantity": 25,
  "reason": "Distribution hôpital",
  "destination": "CHU Saint-Joseph",
  "userId": 2,
  "notes": "Intervention urgence - Lot complet",
  "documents": ["bon_livraison_001.pdf"]
}
```

#### Via code-barres
- **Scan rapide** : Lecture du code-barres
- **Quantité automatique** : +1 ou -1 par défaut
- **Validation** : Confirmation avant enregistrement

#### Import en masse
- **Format CSV** : Colonnes standardisées
- **Validation** : Contrôle des données avant import
- **Rapport** : Résumé des importations réussies/échouées

### Historique et traçabilité

#### Consultation de l'historique
- **Par produit** : Tous les mouvements chronologiques
- **Par période** : Filtrage date/durée
- **Par utilisateur** : Actions d'un opérateur
- **Par type** : Entrées, sorties, ajustements

#### Export d'historique
- **PDF** : Rapport formaté
- **Excel** : Analyse détaillée
- **CSV** : Intégration système externe

## 🔍 Recherche et filtres

### Recherche textuelle

#### Moteur de recherche
- **Produits** : Nom, description, référence
- **Fournisseurs** : Nom, contact
- **Emplacements** : Localisation physique
- **Codes-barres** : Recherche exacte

#### Recherche avancée
```json
{
  "query": "paracetamol",
  "filters": {
    "category": "Médicaments",
    "supplier": "Pharmacie Centrale",
    "quantity": { "min": 10, "max": 100 },
    "expiration": { "before": "2025-12-31" },
    "location": "Armoire A-*"
  },
  "sort": {
    "field": "quantity",
    "order": "asc"
  }
}
```

### Filtres prédéfinis

#### Filtres rapides
- **En alerte** : Stocks faibles ou périmés
- **Récemment utilisés** : 30 derniers jours
- **Nouveaux produits** : Ajoutés ce mois
- **Sans mouvement** : Inactifs depuis 6 mois

#### Filtres personnalisés
- **Sauvegarde** : Filtres nommés et réutilisables
- **Partage** : Filtres disponibles pour l'équipe
- **Programmation** : Rapports automatiques

## 📊 Rapports et analyses

### Rapports standards

#### Inventaire complet
- **État des lieux** : Tous les produits avec quantités
- **Valeur totale** : Estimation financière
- **Répartition** : Par catégories et emplacements
- **Alertes** : Points d'attention

#### Mouvements périodiques
- **Entrées/sorties** : Par jour, semaine, mois
- **Top produits** : Plus utilisés
- **Tendances** : Évolution des consommations
- **Anomalies** : Écarts significatifs

#### Rapports fournisseurs
- **Achats par fournisseur** : Volumes et valeurs
- **Délais de livraison** : Performance
- **Qualité** : Taux de retour
- **Contrats** : Échéances et renouvellements

### Analyses avancées

#### Prévisions de stock
- **Consommation moyenne** : Calcul automatique
- **Seuil de réapprovisionnement** : Calculé dynamiquement
- **Alertes prédictives** : Anticipation des ruptures
- **Optimisation** : Suggestions d'ajustement des stocks

#### Tableaux de bord personnalisés
- **Widgets configurables** : Graphiques et indicateurs
- **Périodes variables** : Jour, semaine, mois, année
- **Comparaisons** : Évolution vs périodes précédentes
- **Export** : Partage des analyses

## 🏭 Gestion des fournisseurs

### Base fournisseurs

#### Informations fournisseur
```json
{
  "name": "Pharmacie Centrale",
  "contact": "Marie Dupont",
  "email": "marie@pharmacie-centrale.fr",
  "phone": "+33123456789",
  "address": "123 Rue de la Santé, 75001 Paris",
  "categories": ["Médicaments", "Matériel médical"],
  "paymentTerms": "30 jours",
  "rating": 4.5
}
```

#### Évaluation des fournisseurs
- **Qualité** : Respect des délais et spécifications
- **Fiabilité** : Taux de livraison
- **Prix** : Comparaison concurrentielle
- **Service** : Support et réactivité

### Gestion des commandes

#### Processus de commande
1. **Identification besoin** : Alerte stock faible
2. **Sélection fournisseur** : Basé sur évaluation
3. **Création commande** : Liste de produits et quantités
4. **Validation** : Approbation hiérarchique
5. **Suivi livraison** : Confirmation réception

#### Intégration commande-stock
- **Réservation** : Stock mis de côté
- **Suivi** : État de la commande
- **Réception** : Mise à jour automatique du stock
- **Écart** : Gestion des différences

## 📍 Gestion des emplacements

### Organisation physique

#### Structure d'emplacement
```
Entrepôt Principal
├── Zone A - Médicaments
│   ├── Armoire A1 - Analgésiques
│   ├── Armoire A2 - Antibiotiques
│   └── Armoire A3 - Injectables
├── Zone B - Matériel
│   ├── Rayon B1 - Pansements
│   ├── Rayon B2 - Mobilier
│   └── Stock B3 - Réserve
└── Zone C - Équipement lourd
    ├── Local C1 - Générateurs
    └── Local C2 - Tentes
```

#### Gestion des emplacements
- **Hiérarchie** : Bâtiment > Zone > Armoire > Étagère
- **Capacité** : Volume et poids maximum
- **Conditions** : Température, humidité, sécurité
- **Accès** : Autorisations par zone

### Optimisation des stocks

#### Répartition intelligente
- **Fréquence d'usage** : Produits courants en accès facile
- **Périssabilité** : Rotation FIFO (First In, First Out)
- **Sécurité** : Produits dangereux isolés
- **Efficacité** : Réduction des déplacements

#### Suivi des emplacements
- **Occupation** : Taux de remplissage par zone
- **Changements** : Historique des déplacements
- **Optimisation** : Suggestions de réorganisation

## ⚠️ Gestion des alertes

### Configuration des alertes

#### Seuils personnalisables
```json
{
  "globalSettings": {
    "defaultMinStock": 10,
    "defaultMaxStock": 200,
    "expirationWarningDays": 30,
    "expirationCriticalDays": 7
  },
  "categoryOverrides": {
    "Médicaments d'urgence": {
      "minStock": 50,
      "maxStock": 500
    }
  }
}
```

#### Types de notifications
- **Email** : Alertes quotidiennes/hebdomadaires
- **Interface** : Badge rouge sur l'icône
- **Push** : Notifications navigateur (PWA)
- **SMS** : Pour alertes critiques (optionnel)

### Actions sur alertes

#### Traitement automatique
- **Réapprovisionnement** : Génération de commandes
- **Transferts** : Déplacement entre sites
- **Destruction** : Produits périmés
- **Ajustements** : Corrections d'inventaire

#### Workflow d'escalade
1. **Alerte niveau 1** : Notification responsable
2. **Alerte niveau 2** : Escalade hiérarchique (48h)
3. **Alerte niveau 3** : Direction (urgence)

## 🔄 Intégrations externes

### Import/Export de données

#### Formats supportés
- **CSV** : Standard pour tableurs
- **Excel** : Analyse avancée
- **JSON** : Échange structuré
- **XML** : Intégrations entreprise

#### Automatisation
- **Imports programmés** : Mise à jour depuis ERP
- **Exports automatiques** : Rapports périodiques
- **API webhooks** : Notifications temps réel
- **Synchronisation** : Bidirectionnelle avec systèmes externes

### Connexions tierces

#### Systèmes de santé
- **Logiciels hôpitaux** : Synchronisation des stocks
- **Systèmes de pharmacie** : Gestion des médicaments
- **Plateformes régionales** : Partage inter-structures

#### Outils logistiques
- **Transporteurs** : Suivi des livraisons
- **Entrepôts externes** : Gestion déléguée
- **Fournisseurs** : Commandes automatisées

---

*Guide de gestion des stocks - StockProtec v5.2.0*
*Fonctionnalités validées - Avril 2026*

**Pour formation complémentaire :** Contactez votre administrateur système