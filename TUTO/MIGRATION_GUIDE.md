# 🔄 Guide de Migration - localStorage vers SQLite (déprécié)

> Dans les versions actuelles, StockProtec utilise directement SQLite pour tout le stockage.
> Il n'est plus nécessaire de migrer les données depuis le localStorage.

## 📋 Qu'est-ce qui change ?

StockProtec migre du **localStorage** (stockage navigateur) vers **SQLite** (base de données locale).

### Pourquoi ce changement ?

| Avant (localStorage) | Après (SQLite) |
|---------------------|----------------|
| Données dans le navigateur | Données dans un fichier unique |
| Risque de perte si cache vidé | Données permanentes |
| Pas de sauvegarde facile | Sauvegarde = 1 fichier |
| Performance limitée | Performance optimale |
| Pas d'intégrité garantie | Intégrité des données assurée |

## ✅ Ce qui ne change PAS

- ✅ L'interface reste **exactement la même**
- ✅ Toutes les fonctionnalités sont **préservées**
- ✅ Les QR codes et codes-barres fonctionnent **pareil**
- ✅ Les mots de passe et utilisateurs sont **conservés**
- ✅ L'utilisation est **identique**

## 🚀 Comment migrer ?

### Étape 1 : Installer la nouvelle version

```bash
npm install
```

### Étape 2 : Démarrer l'application

```bash
npm run dev:all
```

### Étape 3 : Migration automatique

Au premier démarrage, si des données sont détectées dans le localStorage :

1. Une fenêtre s'ouvre automatiquement
2. Elle vous propose de migrer vos données
3. Cliquez sur **"Migrer les données"**
4. Attendez quelques secondes
5. ✅ C'est terminé !

### Étape 4 : Vérification

- Connectez-vous avec vos identifiants habituels
- Vérifiez que toutes vos données sont présentes :
  - ✅ Sacs de secours
  - ✅ Matériel opérationnel
  - ✅ Produits pharmacie
  - ✅ Historique des contrôles
  - ✅ Utilisateurs

## 💾 Où sont stockées les données maintenant ?

Les données sont dans le fichier :
```
/stockprotec.db
```

Ce fichier se trouve à la racine du projet.

## 🔐 Sauvegarde de vos données

### Avant (localStorage)
Difficile à sauvegarder, données dispersées

### Maintenant (SQLite)
```bash
# Sauvegarde
cp stockprotec.db stockprotec-backup.db

# Restauration
cp stockprotec-backup.db stockprotec.db
```

**C'est tout !** Un seul fichier contient toutes vos données.

## 🆘 Que faire en cas de problème ?

### Problème 1 : Le serveur ne démarre pas

**Solution :**
```bash
# Vérifiez que le port 3001 n'est pas utilisé
# Puis relancez :
npm run server
```

### Problème 2 : Impossible de se connecter

**Solution :**
1. Vérifiez que le serveur API tourne (port 3001)
2. Vérifiez que le frontend tourne (port 5173)
3. Utilisez `npm run dev:all` pour tout démarrer ensemble

### Problème 3 : Données manquantes après migration

**Solution :**
1. Ne paniquez pas, vos anciennes données sont encore dans le localStorage
2. Relancez la migration depuis le panneau admin
3. Contactez le support si le problème persiste

### Problème 4 : La base de données ne se crée pas

**Solution :**
1. Vérifiez les permissions du dossier
2. Assurez-vous que le serveur a accès en écriture
3. Consultez les logs du serveur pour plus de détails

## 📊 Avantages concrets pour vous

### 1. Fiabilité
- ✅ Vos données ne disparaissent plus si vous videz le cache
- ✅ Pas de limite de taille comme avec localStorage
- ✅ Transactions garantissant la cohérence

### 2. Performance
- ✅ Chargement plus rapide des données
- ✅ Recherche optimisée
- ✅ Meilleure gestion des gros volumes

### 3. Sauvegarde
- ✅ Un seul fichier à sauvegarder
- ✅ Restauration en quelques secondes
- ✅ Possibilité de faire des sauvegardes automatiques

### 4. Sécurité
- ✅ Intégrité des données garantie
- ✅ Clés étrangères pour éviter les incohérences
- ✅ Transactions pour les opérations complexes

## 🎯 Checklist de migration

- [ ] J'ai installé les nouvelles dépendances (`npm install`)
- [ ] J'ai démarré l'application (`npm run dev:all`)
- [ ] J'ai migré mes données via la fenêtre de migration
- [ ] J'ai vérifié que toutes mes données sont présentes
- [ ] J'ai testé les fonctionnalités principales
- [ ] J'ai créé une sauvegarde de `stockprotec.db`

## 📞 Support

En cas de problème :
1. Consultez les logs du serveur
2. Vérifiez le fichier `INSTALLATION.md`
3. Consultez le guide technique `DEVELOPER_GUIDE.md`
4. Contactez l'administrateur système

## 🎉 Félicitations !

Vos données sont maintenant stockées de manière fiable et performante dans SQLite.

Vous pouvez continuer à utiliser StockProtec comme avant, avec tous les avantages d'une vraie base de données !

---

**Protection Civile de la Loire - Antenne de Saint-Étienne**
