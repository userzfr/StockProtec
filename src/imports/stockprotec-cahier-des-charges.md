# Cahier des charges — Évolution de StockProtec

## Contexte

StockProtec est un logiciel de gestion de stock utilisé par une antenne de la Protection Civile pour gérer le matériel opérationnel utilisé sur les dispositifs de secours.

Actuellement, le système fonctionne avec des **lots de secours (Lot A, B, C, etc.) identifiés par code-barres**, contenant différents matériels médicaux.

Nous souhaitons **faire évoluer le système pour le rendre plus logique, plus rapide à contrôler sur le terrain et plus adapté à une utilisation sur smartphone**.

Le nouveau système devra **séparer le stock en deux parties principales**, tout en restant lié dans une seule base de données.

⚠️ Important :
Le développement doit **conserver les fonctionnalités déjà existantes et utiles dans le système actuel**.
Les nouvelles fonctionnalités doivent être **ajoutées et intégrées**, sans supprimer les outils déjà fonctionnels comme :

* gestion des stocks
* détection des péremptions
* alertes
* recherche
* interface actuelle si certaines parties sont toujours pertinentes.

---

# 1 — Structure générale du site

Le site doit être divisé en **2 onglets principaux**.

## Onglet 1 — Matériel opérationnel (Sacs et matériel embarqué)

Cet onglet contient :

* les **sacs de secours (lots)**
* le **matériel opérationnel individuel** qui ne se trouve pas dans un sac

Exemples :

* DSA
* Aspirateur de mucosité
* Bouteilles d’oxygène
* Matériel électronique
* Autres équipements utilisés sur poste de secours

Ces matériels doivent apparaître **au même niveau que les sacs**, car ils sortent eux aussi sur les dispositifs.

---

# 2 — Structure des sacs

Chaque sac doit être organisé de manière hiérarchique.

Exemple :

Sac n°1

Poche rouge

* Sérum phy x20
* Compresse stérile x30

Poche bleue

* Pansement x30

Chaque sac doit contenir :

* plusieurs **poches configurables**
* chaque poche contient **des items configurables**

L’administrateur doit pouvoir :

* créer un sac
* ajouter des poches
* ajouter des items dans chaque poche
* modifier les quantités attendues

Tout doit être **entièrement configurable dans l’interface admin**.

---

# 3 — Identification des sacs (QR Code)

Les sacs doivent fonctionner avec **QR codes**.

Chaque sac possède :

* un **QR code unique**
* une **page web dédiée dans le système**

Quand un utilisateur **scanne le QR code avec un smartphone**, il est redirigé vers une **page du site affichant le contenu complet du sac**.

La page doit afficher :

* nom du sac
* liste des poches
* items présents dans chaque poche
* quantité attendue

---

# 4 — Génération des QR codes et codes-barres

Le système doit **générer automatiquement les QR codes et codes-barres**.

Règles obligatoires :

* chaque code doit être **aléatoire**
* aucun code ne doit être **identique à un autre**
* le système doit **vérifier automatiquement qu’un code n’existe pas déjà dans la base**
* les codes doivent être **uniques dans toute la base de données**

Cela concerne :

* les **QR codes des sacs**
* les **codes-barres des produits de la pharmacie**

Les codes doivent être générés automatiquement lors de la création d’un élément.

---

# 5 — Système de contrôle du matériel

Depuis la page du sac, l’utilisateur doit pouvoir lancer plusieurs types de contrôle.

Boutons disponibles :

**Contrôle rapide**
Permet une vérification rapide.

**Sortie en poste de secours**
Lance un contrôle complet avant départ.

**Retour de poste**
Lance un contrôle complet après le dispositif.

---

# 6 — Configuration du contrôle par l’administrateur

L’administrateur doit pouvoir définir **le type de vérification pour chaque item**.

Deux types possibles.

## Mode bouton

Options :

* Présent
* Manquant
* Endommagé

## Mode quantité

Champ numérique.

Exemple :

Compresse stérile
Quantité attendue : 30

L’utilisateur peut entrer :

28
30
etc.

---

# 7 — Historique des contrôles

Chaque contrôle doit enregistrer :

* date
* utilisateur
* type de contrôle (rapide / sortie / retour)
* résultats

Cela permet de savoir :

* quand un sac a été contrôlé
* par qui
* s’il manquait du matériel

---

# 8 — Deuxième onglet : Stock pharmacie

Le deuxième onglet correspond au **stock principal de la pharmacie**.

Ce stock contient **uniquement du consommable médical**.

Exemples :

* compresses
* pansements
* sérum physiologique
* désinfectants
* consommables médicaux
* médicaments autorisés

⚠️ Important :

Cet onglet **ne doit pas contenir de matériel opérationnel non consommable**.

Exemples d’objets **interdits dans la pharmacie** :

* tentes
* brancards
* sacs de secours
* matériel électronique
* DSA
* aspirateurs de mucosité
* mobilier ou matériel logistique

Ces éléments doivent être **gérés uniquement dans l’onglet matériel opérationnel**.

Les produits de la pharmacie servent **uniquement à réapprovisionner les sacs**.

Fonctionnalités :

* scan code-barres
* entrée en stock
* sortie de stock
* gestion des quantités
* gestion des dates de péremption
* alertes produits périmés
* alertes produits proches de la péremption

---

# 9 — Lien entre sacs et pharmacie

Les items présents dans les sacs doivent être **liés aux produits du stock pharmacie**.

Exemple :

Si un contrôle indique :

* 5 compresses manquantes

Le système doit indiquer que ces compresses sont disponibles dans la pharmacie.

Cela facilite le **réapprovisionnement des sacs**.

---

# 10 — Compatibilité mobile

Le système doit être **optimisé pour smartphone**, car les contrôles seront faits sur le terrain.

Interface :

* boutons larges
* affichage simple
* navigation rapide
* compatible scan QR code

---

# 11 — Objectifs

Objectifs principaux :

* faciliter le contrôle du matériel
* éviter les oublis
* accélérer les vérifications
* permettre l’utilisation directe sur smartphone
* séparer clairement **matériel opérationnel** et **stock pharmacie**