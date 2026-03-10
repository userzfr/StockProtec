# StockProtec - Application de gestion de stockage

**StockProtec** est une application complète destinée à la gestion du matériel pour la Protection Civile de la Loire pour l'antenne de Saint-Étienne. Elle vise à faciliter l'inventaire, le contrôle et le suivi des sacs de secours, du matériel opérationnel et du stock pharmacie grâce à une interface moderne, un backend léger et une base de données SQLite locale.

---

## 🆕 Nouveautés principales

- Passage à une **base de données SQLite locale** pour favoriser :
  - 🔒 Intégrité et sécurité des données
  - ⚡ Performances élevées et démarrage rapide
  - 💾 Facilité de sauvegarde (un unique fichier)
  - 🔁 Possibilités de migration aisées

- Architecture API + Frontend découplée (Node.js + React/Tailwind)

> Pour les procédures d'installation et de migration, consultez **[INSTALLATION.md](INSTALLATION.md)**.
> Pour les détails techniques de l'implémentation, voir **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)**.

---

## 🚀 Mise en route

1. **Installer les dépendances**
    ```bash
    npm install
    ```

2. **Lancer l'application complète** (API & frontend) :
    ```bash
    npm run dev:all
    ```

3. **Alternatives de démarrage** :
   - Windows : `start.bat`
   - Linux/Mac : `./start.sh`

L'interface frontend sera accessible à l'adresse **http://localhost:5173** et l'API Node.js sur **http://localhost:3000**.

---

## 🎯 Objectifs et fonctionnalités

L'application se divise en deux grands pôles accessibles par un menu à onglets :

### 1. Matériel opérationnel

- **Gestion des sacs de secours**
  - Création, modification et suppression de sacs.
  - Hiérarchie sacs → poches → articles.
  - Chaque article possède un type de contrôle (bouton ou quantité) et une quantité attendue.

- **Équipements embarqués** (DSA, aspirateurs, bouteilles d'oxygène, etc.)
  - Liste d'éléments non associés à un sac.

- **Contrôles du matériel**
  - Trois types de contrôle : rapide, sortie en poste et retour de poste.
  - Modes de vérification configurables : bouton (présent/manquant/endommagé) ou quantité.
  - Enregistrement automatique de l'historique avec date, utilisateur, notes et résultats.

- **QR codes**
  - Génération et téléchargement de QR codes uniques pour chaque sac.
  - Accès mobile instantané au contenu d'un sac via le scan.

- **Historique et rapports**
  - Visualisation détaillée des contrôles passés.
  - Exportations et filtres par type et période.

- **Scanner de code-barres**
  - Interface pour scanner et identifier rapidement des articles ou produits.

- **Gestion des bugs et des demandes**
  - Formulaire intégré de signalement avec envoi de notifications aux administrateurs.

### 2. Stock pharmacie

- **Catalogue de produits médicaux**
  - Ajout, modification et suppression de produits.
  - Champs : nom, code-barres unique, quantité en stock, seuil minimum, date de péremption.

- **Alertes automatiques**
  - Produits périmés ou expirant bientôt (< 3 mois).
  - Stocks sous le seuil minimal.
  - Notifications visibles sur le tableau de bord et via badges rouges/jaunes.

- **Liaison avec les sacs**
  - Possibilité d’associer un produit pharmacie à un article de sac.
  - Permet de garder la cohérence des codes-barres et quantités.

- **Génération de codes-barres**
  - Chaque produit se voit attribuer un code-barres unique lors de sa création.

---

## 🔧 Configuration et administration

### Création d’un sac de secours
1. Aller dans **Matériel opérationnel → Sacs de secours**.
2. Cliquer sur **Créer un sac**.
3. Renseigner le nom du sac et, facultativement, son emplacement.
4. Ajouter des poches puis, pour chaque poche, des articles avec :
   - Nom
   - Quantité prévue
   - Type de contrôle (bouton ou quantité)

### Gestion du stock pharmacie
1. Aller dans **Stock pharmacie** puis **Ajouter un produit**.
2. Compléter le formulaire (code-barres généré automatiquement). 
3. Définir seuil et date de péremption.

### Effectuer un contrôle
1. Scanner le QR code du sac via l'interface mobile ou web, ou le sélectionner dans la liste.
2. Choisir le **type de contrôle** (rapide, sortie ou retour).
3. Parcourir les éléments listés et renseigner l’état ou la quantité.
4. Ajouter des commentaires si nécessaire, puis cliquer sur **Enregistrer**.

### Générer un QR code
- Depuis la page de détail du sac, cliquer sur le bouton **QR Code**.
- Télécharger l'image ou l’imprimer pour fixer sur le sac.

---

## 🔐 Utilisateurs et permissions

| Rôle          | Accès principal                                            |
|---------------|------------------------------------------------------------|
| **Administrateur** | Tous les écrans et paramètres, gestion des utilisateurs, consultation des logs et rapports, traitement des demandes de réinitialisation. |
| **Utilisateur**     | Consultation et contrôle du matériel, signalement de bugs, visualisation des stocks et historiques.           |

Les comptes sont gérés via l’API; un administrateur peut promouvoir un utilisateur ou réinitialiser un mot de passe.

---

## 📱 Optimisation mobile

- Interface responsive conçue pour être utilisable depuis un smartphone.
- Accès rapide via QR codes : le scan ouvre immédiatement la fiche du sac ou du produit sur le navigateur du téléphone.
- Gestes tactiles et boutons surdimensionnés pour les conditions de terrain.

---

## 🛠️ Technologies & architecture

- **Frontend** : React 18, TypeScript, Tailwind CSS, Radix UI pour composants accessibles.
- **Backend** : Node.js + Express, base de données SQLite avec fichier local.
- **Services auxiliaires** : génération de QR codes (`qrcode.react`), codes-barres (`react-barcode`), gestion des dates (`date-fns`).
- **Organisation** :
  - `src/app/components` contient les composants réutilisables.
  - `src/app/routes.ts` gère la navigation.
  - `server` contient l’API et les scripts de migration/seed.

---

## 🧪 Tests et qualité

- Le projet comprend des tests unitaires et d’intégration (voir dossier `server/tests` et `src/app/__tests__`).
- Linter et formateur configurer avec ESLint et Prettier.

---

## 📁 Structure du dépôt

```
/                    # racine du projet
├── src/             # code frontend React
│   ├── app/         # composants et pages
│   ├── contexts/    # contextes React (auth, etc.)
│   ├── hooks/       # hooks personnalisés
│   └── services/    # appels d’API
├── server/          # API Node.js et scripts DB
├── msi_nodejs/      # raccourci Windows pour installer Node.js
├── TUTO/            # documentation utilisateur et dev
├── README.md        # ce fichier
├── package.json     # dépendances et scripts
└── vite.config.ts   # config du bundler frontend
```

---

## 📘 Documentation & guides

- **TUTO/** : Documentation complète de l’utilisateur et du développeur.
- **DEVELOPER_GUIDE.md** : Guide d’implémentation et conventions de code.
- **INSTALLATION.md** : Procédure d’installation détaillée.
- **MIGRATION_GUIDE.md** : Instructions pour mettre à jour la base SQLite.

---

## 🧠 Développement futur

- Ajout d’un mode hors ligne pour le frontend (PWA).
- Intégration de notifications push pour alertes critiques.
- Interface de rapports statistiques avancés.

---

**Fait avec ❤️ par Mathieu.M**
