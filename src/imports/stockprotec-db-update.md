Prompt — Mise à jour StockProtec (Connexion base de données locale)
Contexte

Le logiciel StockProtec fonctionne actuellement très bien et les fonctionnalités existantes sont satisfaisantes.

L’objectif de cette mise à jour n’est pas de modifier les fonctionnalités, mais de connecter toutes les données du système à une base de données locale, afin d’améliorer :

la fiabilité

la sauvegarde

la gestion des données

la performance

⚠️ Important :
Les fonctionnalités existantes doivent rester exactement les mêmes.
Cette mise à jour concerne uniquement la gestion et le stockage des données.

1 — Base de données locale

Toutes les données du logiciel doivent être stockées dans une base de données locale.

La solution recommandée est :

SQLite

Avantages :

fonctionne en local

pas besoin de serveur

simple à installer

parfait pour un logiciel local

Le fichier pourrait être par exemple :

stockprotec.db
2 — Objectif pour le développeur

Le système doit être préparé de manière à ce que :

toute la logique de connexion à la base de données soit déjà développée

toutes les tables nécessaires soient définies

toutes les requêtes SQL soient intégrées

Ainsi, l’utilisateur final devra seulement :

créer ou importer la base de données

placer le fichier dans le dossier du projet

lancer le logiciel

Et tout fonctionnera automatiquement.

3 — Préparation automatique de la base

Le logiciel doit pouvoir :

détecter si la base de données existe

si elle n’existe pas → la créer automatiquement

Lors de la création, le système doit automatiquement créer toutes les tables nécessaires.

4 — Tables à prévoir dans la base

La base doit contenir toutes les données du logiciel, notamment :

Utilisateurs

id

nom

email

mot de passe

rôle

date création

Sacs opérationnels

id

nom

qr_code

description

date_creation

Poches

id

sac_id

nom_poche

ordre_affichage

Items dans les sacs

id

poche_id

produit_id

quantite_attendue

type_controle (bouton / quantité)

Produits pharmacie

id

nom_produit

code_barre

categorie

perissable (oui/non)

quantite_stock

date_peremption

date_creation

Matériel opérationnel individuel

Exemples :

DSA

aspirateur de mucosité

matériel électronique

Champs :

id

nom

qr_code

type

statut

date_controle

Historique des contrôles

id

sac_id

utilisateur_id

type_controle

date_controle

resultat

Résultat des contrôles

id

controle_id

item_id

statut

quantite_relevee

5 — Génération automatique des codes

Le système doit continuer à générer automatiquement :

les QR codes des sacs

les codes-barres des produits

Les règles restent :

génération aléatoire

unicité obligatoire

vérification automatique dans la base

6 — API interne

Le système doit utiliser une API backend pour accéder à la base de données.

Exemples :

GET /api/sacs
POST /api/sacs
GET /api/produits
POST /api/controle

Toutes les actions du site doivent passer par cette API.

7 — Migration des données actuelles

Si des données existent déjà dans :

JSON

stockage local

fichiers

Le développeur doit prévoir un script simple de migration permettant de :

importer les anciennes données dans la base SQLite.

8 — Simplicité d’installation

L’objectif est que l’installation soit extrêmement simple.

L’utilisateur doit seulement :

télécharger le projet

lancer le serveur

créer ou importer stockprotec.db

Tout le reste doit fonctionner automatiquement.

9 — Compatibilité avec la version actuelle

La mise à jour doit :

conserver l’interface actuelle

conserver les fonctionnalités existantes

conserver le système de sacs et de pharmacie

conserver les QR codes et codes-barres

La seule évolution est le stockage dans une base de données locale.

10 — Objectif final

Obtenir un système :

fiable

rapide

sauvegardable

simple à installer

prêt pour de futures évolutions