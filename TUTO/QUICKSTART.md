# ⚡ Guide de Démarrage Rapide - StockProtec SQLite

## 🚀 En 3 étapes

### 1️⃣ Installation (1 minute)

```bash
npm install
```

### 2️⃣ Démarrage (5 secondes)

**Option automatique** (recommandée) :

```bash
npm run dev:all
```

**Option manuelle** (2 terminaux) :

Terminal 1 :
```bash
npm run server
```

Terminal 2 :
```bash
npm run dev
```

**Option scripts** :

- Linux/Mac : `./start.sh`
- Windows : `start.bat`

### 3️⃣ Accès (immédiat)

Ouvrez votre navigateur :
```
http://localhost:5173
```

**Connexion par défaut** :
- Email : `admin@protectioncivile42.fr`
- Mot de passe : `admin123`

---

## 🆕 Première utilisation ?

### Si vous avez déjà des données

1. L'application détectera vos données existantes
2. Une fenêtre de migration s'ouvrira
3. Cliquez sur **"Migrer les données"**
4. ✅ Terminé !

### Si c'est une installation vierge

Ajoutez des données d'exemple :

```bash
npm run seed
```

Cela crée :
- 2 utilisateurs (admin + user)
- 2 sacs de secours avec poches et items
- 4 produits pharmacie
- 3 équipements opérationnels

---

## 🔍 Vérification Rapide

### Le serveur API fonctionne ?

Ouvrez :
```
http://localhost:3001/api/health
```

Vous devriez voir :
```json
{
  "status": "ok",
  "message": "API StockProtec fonctionne correctement"
}
```

### La base de données existe ?

Vérifiez qu'un fichier `stockprotec.db` existe à la racine du projet.

---

## ❓ Problèmes Courants

### "Port 3001 already in use"

Un autre programme utilise le port. Arrêtez-le ou changez le port :

```bash
PORT=3002 npm run server
```

### "Cannot connect to API"

1. Vérifiez que le serveur tourne (Terminal 1)
2. Vérifiez l'URL : `http://localhost:3001/api/health`
3. Redémarrez avec `npm run dev:all`

### "Migration failed"

1. Vérifiez que le serveur API est démarré
2. Consultez la console pour les erreurs
3. Réessayez la migration

---

## 📚 Documentation Complète

- **Installation** : [INSTALLATION.md](INSTALLATION.md)
- **Migration** : [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Technique** : [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Changements** : [CHANGELOG.md](CHANGELOG.md)

---

## 💾 Sauvegarde Rapide

Pour sauvegarder toutes vos données :

```bash
# Linux/Mac
cp stockprotec.db stockprotec-backup.db

# Windows
copy stockprotec.db stockprotec-backup.db
```

---

## 🎯 Prêt à l'emploi !

Votre StockProtec est maintenant opérationnel avec :
- ✅ Base de données SQLite fiable
- ✅ API backend performante
- ✅ Interface React responsive
- ✅ Données sauvegardées de manière sécurisée

**Bonne utilisation !**

---

**Protection Civile de la Loire - Antenne de Saint-Étienne**
