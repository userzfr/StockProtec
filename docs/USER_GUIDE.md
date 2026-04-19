# 👥 Guide utilisateur - StockProtec v5.2

## 🎯 Bienvenue dans StockProtec

StockProtec est une application web moderne conçue pour la gestion complète du matériel et des stocks de la Protection Civile. Ce guide vous accompagne dans l'utilisation quotidienne de l'application.

## 🚀 Premiers pas

### Connexion à l'application

1. **Accès à l'application** : Ouvrez votre navigateur et allez sur `http://localhost:5173`
2. **Connexion** :
   - **Utilisateur** : `admin` ou `user`
   - **Mot de passe** : `admin123` ou `user123`
3. **Première visite** : L'application vous guide automatiquement

### Interface principale

L'interface se compose de :
- **Barre de navigation** : Accès aux différentes sections
- **Tableau de bord** : Vue d'ensemble des stocks et statistiques
- **Zone de contenu** : Affichage des données et formulaires
- **Pied de page** : Liens légaux et informations système

## 📦 Gestion des stocks

### Consultation des stocks

#### Vue d'ensemble
- **Tableau principal** : Liste de tous les produits avec quantités
- **Filtres** : Recherche par nom, catégorie, ou statut
- **Statistiques** : Graphiques des niveaux de stock

#### Détails d'un produit
- **Informations générales** : Nom, description, catégorie
- **Stock actuel** : Quantité disponible, minimum, maximum
- **Historique** : Derniers mouvements et modifications

### Ajout de produits

1. **Accès** : Menu "Stocks" → "Ajouter un produit"
2. **Informations requises** :
   - **Nom** : Désignation du produit
   - **Catégorie** : Classification (Médicaments, Matériel, etc.)
   - **Quantité initiale** : Stock de départ
   - **Seuil d'alerte** : Quantité minimum avant alerte
3. **Options avancées** :
   - **Code-barres** : Génération automatique
   - **Date d'expiration** : Pour les produits périssables
   - **Fournisseur** : Informations sur l'origine

### Modification des stocks

#### Entrée de stock
- **Via formulaire** : Ajout manuel de quantités
- **Via code-barres** : Scanner pour ajout rapide
- **Import CSV** : Chargement en masse

#### Sortie de stock
- **Utilisation** : Consommation normale
- **Transfert** : Déplacement vers autre catégorie
- **Périmé** : Suppression pour cause d'expiration

### Gestion des catégories

#### Création de catégories
1. **Accès** : Menu "Administration" → "Catégories"
2. **Informations** :
   - **Nom** : Désignation claire
   - **Description** : Détails supplémentaires
   - **Couleur** : Pour identification visuelle
   - **Parent** : Catégorie parente (optionnel)

#### Organisation hiérarchique
- **Arborescence** : Structure en arbre des catégories
- **Déplacement** : Réorganisation par glisser-déposer
- **Sous-catégories** : Niveaux illimités

## 👤 Gestion des utilisateurs

### Pour les administrateurs

#### Création d'utilisateurs
1. **Accès** : Menu "Administration" → "Utilisateurs"
2. **Informations requises** :
   - **Nom d'utilisateur** : Identifiant unique
   - **Email** : Adresse électronique
   - **Rôle** : Administrateur ou Utilisateur
3. **Sécurité** :
   - **Mot de passe fort** : Au moins 8 caractères
   - **Expiration** : Changement périodique recommandé

#### Gestion des rôles
- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Utilisateur** : Accès limité aux stocks et rapports
- **Lecture seule** : Consultation uniquement

### Pour les utilisateurs standards

#### Modification du profil
- **Informations personnelles** : Nom, prénom, email
- **Préférences** : Langue, thème, notifications
- **Sécurité** : Changement de mot de passe

#### Réinitialisation de mot de passe
1. **Demande** : Bouton "Mot de passe oublié"
2. **Email** : Lien de réinitialisation envoyé
3. **Nouveau mot de passe** : Respect des règles de sécurité

## 📊 Rapports et statistiques

### Tableaux de bord

#### Vue d'ensemble
- **Stocks totaux** : Quantités par catégorie
- **Alertes** : Produits en rupture ou périmés
- **Tendances** : Évolution des stocks sur 30 jours

#### Graphiques interactifs
- **Évolution temporelle** : Courbes des mouvements
- **Répartition** : Camemberts par catégorie
- **Top produits** : Articles les plus utilisés

### Génération de rapports

#### Rapports standards
- **Inventaire complet** : État des lieux détaillé
- **Mouvements** : Historique des entrées/sorties
- **Alertes** : Liste des produits critiques

#### Export de données
- **Format PDF** : Rapports formatés
- **Format Excel** : Tableurs pour analyse
- **Format CSV** : Import dans autres systèmes

## 🔍 Recherche et filtres

### Recherche simple
- **Barre de recherche** : Recherche par nom ou référence
- **Résultats instantanés** : Mise à jour en temps réel
- **Historique** : Dernières recherches sauvegardées

### Filtres avancés
- **Par catégorie** : Filtrage hiérarchique
- **Par statut** : Disponible, rupture, périmé
- **Par date** : Période personnalisable
- **Par fournisseur** : Origine des produits

### Recherche par code-barres
- **Scanner intégré** : Lecture directe
- **Génération** : Création de codes personnalisés
- **Historique** : Traçabilité des scans

## ⚙️ Paramètres et configuration

### Paramètres utilisateur
- **Thème** : Clair, sombre, automatique
- **Langue** : Français (principale), autres à venir
- **Notifications** : Email, navigateur, application
- **Raccourcis** : Personnalisation du clavier

### Paramètres système (Admin uniquement)
- **Configuration générale** : Ports, chemins, timeouts
- **Sauvegarde** : Programmation automatique
- **Sécurité** : Politiques de mot de passe
- **Logs** : Niveau de verbosité

## 🔒 Sécurité et confidentialité

### Bonnes pratiques
- **Déconnexion** : Toujours se déconnecter après usage
- **Mots de passe** : Changer régulièrement
- **Sessions** : Limitées dans le temps
- **Accès** : Ne pas partager les comptes

### Conformité RGPD
- **Droits d'accès** : Consultation de ses données
- **Rectification** : Modification des informations
- **Suppression** : Droit à l'oubli
- **Portabilité** : Export des données

## 📱 Utilisation mobile

### Responsive design
- **Adaptation automatique** : Interface optimisée pour mobile
- **Touch gestures** : Gestes tactiles supportés
- **Scanner mobile** : Lecture de codes-barres
- **Notifications push** : Alertes en temps réel

### Applications mobiles
- **PWA** : Installation comme application native
- **Offline** : Fonctionnement déconnecté (limité)
- **Synchronisation** : Mise à jour automatique

## 🆘 Dépannage

### Problèmes courants

#### Connexion impossible
- **Vérifier l'URL** : `http://localhost:5173`
- **Redémarrer l'application** : `npm run prod`
- **Vider le cache** : Ctrl+F5

#### Données non sauvegardées
- **Vérifier la connexion** : Test de l'API
- **Recharger la page** : F5
- **Contacter l'admin** : Signalement du problème

#### Performances lentes
- **Vider le cache navigateur**
- **Redémarrer l'application**
- **Vérifier la base de données**

### Signaler un problème
1. **Description précise** : Que s'est-il passé ?
2. **Étapes de reproduction** : Comment reproduire ?
3. **Environnement** : Navigateur, OS, version
4. **Captures d'écran** : Si pertinent

## 📚 Ressources supplémentaires

### Documentation
- **[Guide développeur](DEVELOPER_GUIDE.md)** : Pour personnalisation
- **[API Reference](API_REFERENCE.md)** : Pour intégrations
- **[FAQ](FAQ.md)** : Questions fréquemment posées

### Support
- **Email** : userz_fr@outlook.fr
- **Documentation** : [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- **Issues GitHub** : [Signaler un bug](https://github.com/userzfr/StockProtec/issues)

---

*Guide utilisateur - StockProtec v5.2.0*
*Mis à jour pour la version 5.2 - Avril 2026*