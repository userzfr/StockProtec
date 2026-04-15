# 🧪 Guide de Test - Persistance des Données

**Date**: 15 avril 2026  
Ce guide vous permet de tester que les données sont correctement persistées en base de données.

---

## 🎯 Test 1: Création et Persistance d'un Sac

### Étapes
1. Démarrer le serveur et le frontend :
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. Ouvrir http://localhost:5173 dans le navigateur

3. Se connecter avec :
   - Username: `admin`
   - Password: `admin123`

4. Créer un nouveau sac :
   - Cliquer sur "Créer un sac"
   - Remplir les champs (nom, QR code, etc.)
   - Cliquer "Enregistrer"
   - ✅ Vérifier le toast "✅ Sac créé"

5. **Ouvrir la console du navigateur** :
   - Appuyer sur `F12`
   - Aller dans l'onglet "Console"
   - Vérifier les logs :
     ```
     📤 [API] POST /api/bags
     ✅ [API] /api/bags OK
     ```

6. **Vérifier les logs du serveur** :
   - Dans Terminal 1, vérifier qu'il n'y a pas d'erreur

7. **Rafraîchir la page** :
   - Appuyer sur `F5`
   - ✅ **IMPORTANT**: Vérifier que le sac créé est toujours visible
   - Si le sac ne s'affiche plus → **PROBLÈME DE PERSISTANCE** 🔴

### Qu'on veut voir dans la console
```javascript
// Frontend logs
📤 [API] GET /api/bags
✅ [API] /api/bags OK

📤 [API] POST /api/bags
✅ [API] /api/bags OK
```

### Qu'on NE veut JAMAIS voir
```javascript
// ❌ Mauvais - localStorage utilisé pour les données métier
localStorage.setItem('bags', JSON.stringify(...))
bags = JSON.parse(localStorage.getItem('bags'))

// ❌ Mauvais - Pas de logs API
// (Console vide signifie que l'API n'a pas été appelée)
```

---

## 🎯 Test 2: Modification et Persistance

### Étapes
1. Depuis le dashboard, éditer le sac créé précédemment
2. Modifier un champ (ex: nom)
3. Cliquer "Enregistrer"
4. ✅ Vérifier le toast "✅ Sac modifié"

5. **Rafraîchir la page** (`F5`)
   - ✅ **IMPORTANT**: Vérifier que la modification persiste
   - Si le changement a été perdu → **PROBLÈME** 🔴

6. **Vérifier les logs** :
   ```
   📤 [API] PUT /api/bags/:id
   ✅ [API] /api/bags/:id OK
   ```

---

## 🎯 Test 3: Suppression et Persistance

### Étapes
1. Créer un sac temporaire (testez si vous voulez)
2. Cliquer sur l'action "Supprimer"
3. Confirmer la suppression
4. ✅ Vérifier le toast "✅ Sac supprimé"

5. **Rafraîchir la page** (`F5`)
   - ✅ **IMPORTANT**: Vérifier que le sac n'apparaît plus
   - Si le sac réapparaît → **PROBLÈME** 🔴

6. **Vérifier les logs** :
   ```
   📤 [API] DELETE /api/bags/:id
   ✅ [API] /api/bags/:id OK
   ```

---

## 🎯 Test 4: localStorage ISOLÉ à l'authentification

### Étapes
1. Ouvrir la console du navigateur (`F12`)
2. Aller dans "Application" → "Local Storage" → `http://localhost:5173`
3. ✅ Vérifier qu'il y a **UNIQUEMENT** `authState` :
   ```javascript
   authState = {
     "isAuthenticated": true,
     "user": {
       "id": "1",
       "nom": "admin",
       "role": "admin"
     }
   }
   ```

4. ✅ Vérifier qu'il n'y a **PAS** de :
   - `bags`
   - `pharmacyProducts`
   - `categories`
   - `users` (except authState)
   - Autres données métier

### Si vous voyez des données métier en localStorage 🔴
- **PROBLÈME** - Les données ne doivent pas être en localStorage
- Chercher dans le code : `localStorage.setItem('bags'`, etc.

---

## 🎯 Test 5: Vérifier la Base de Données SQLite

### Étapes (depuis terminal)

1. **Installer sqlite3 si pas présent** :
   ```bash
   npm install -g sqlite3
   ```

2. **Ouvrir la base de données** :
   ```bash
   cd c:\Users\mathi\Documents\GitHub\StockProtec
   sqlite3 stockprotec.db
   ```

3. **Vérifier les tables** :
   ```sql
   SELECT name FROM sqlite_master WHERE type='table';
   ```
   
   ✅ Vous devez voir :
   ```
   users
   bags
   pharmacy_products
   operational_equipment
   control_history
   control_results
   logs
   bug_reports
   inspection_reports
   categories
   ```

4. **Vérifier qu'il y a des données** :
   ```sql
   SELECT COUNT(*) as count FROM bags;
   SELECT * FROM bags LIMIT 1;
   ```

   ✅ Vous devez voir les sacs que vous avez créés

5. **Quitter sqlite3** :
   ```
   .quit
   ```

---

## 🎯 Test 6: Migration localStorage → SQLite

### Prérequis
- Avoir des anciennes données en localStorage (ou les simuler)

### Étapes
1. **Ajouter des données en localStorage** (debug console) :
   ```javascript
   localStorage.setItem('bags', JSON.stringify([
     { 
       id: 'old-bag-1',
       name: 'Ancien sac',
       qrCode: 'OLD-001',
       deploymentStatus: 'present',
       createdAt: new Date().toISOString()
     }
   ]));
   ```

2. **Rafraîchir la page** (`F5`)
   - ✅ Vérifier que MigrationDialog s'ouvre
   - ✅ Bouton "Migrer" visible

3. **Cliquer "Migrer"** :
   ```
   Logs frontend:
   📤 [API] POST /api/migrate
   ✅ [API] /api/migrate OK
   Toast: "Migration réussie"
   ```

4. **Vérifier dans le serveur logs** :
   ```
   📤 Migration reçue du frontend
     - 1 sacs
   ✅ Migration terminée: 1 enregistrements migrés
   ```

5. **Vérifier dans SQLite** :
   ```bash
   sqlite3 stockprotec.db
   SELECT * FROM bags WHERE id = 'old-bag-1';
   .quit
   ```

   ✅ Les données migrées doivent être dans la DB

---

## 🎯 Test 7: Déconnexion et localStorage

### Étapes
1. **Avant déconnexion** :
   - Ouvrir console
   - Vérifier `localStorage.authState` existe

2. **Se déconnecter** :
   - Cliquer le bouton "Déconnexion"
   - ✅ Vérifier le toast "✅ Déconnexion réussie"
   - ✅ Être redirigé vers la page de login

3. **Après déconnexion** :
   - Ouvrir console
   - Vérifier que `localStorage.authState` **N'EXISTE PLUS**
   - Vérifier que localStorage est complètement vide

```javascript
// ✅ Correct
console.log(localStorage.length); // 0
console.log(localStorage.authState); // undefined

// ❌ Mauvais - localStorage n'est pas vidé
console.log(localStorage.length); // > 0
```

---

## 📊 Checklist de Validation

### Frontend
- [ ] Aucune erreur dans la console `F12 → Console`
- [ ] Logs API visibles pour chaque action
- [ ] Créer sac → persiste après refresh
- [ ] Modifier sac → persiste après refresh
- [ ] Supprimer sac → reste supprimé après refresh
- [ ] localStorage contient UNIQUEMENT `authState`
- [ ] Pas d'autres données métier en localStorage
- [ ] Migration fonctionne si données en localStorage
- [ ] Déconnexion vide localStorage

### Backend
- [ ] Serveur démarre sans erreur
- [ ] Routes `/api/bags`, `/api/migrate`, etc. existent
- [ ] Logs serveur informatifs (pas d'erreurs silencieuses)
- [ ] INSERT/UPDATE/DELETE dans SQLite fonctionnent

### Database
- [ ] Fichier `stockprotec.db` existe
- [ ] Tables crées correctement
- [ ] Données insérées via API sont visibles en SQLite

### Build
- [ ] `npm run build` termine sans erreur
- [ ] Aucune erreur d'import Vite
- [ ] Frontend démarre en dev : `npm run dev` OK
- [ ] Backend démarre : `npm run server` OK

---

## 🆘 En cas de problème

### Symptôme: Données disparaissent après refresh
**Diagnostic** :
1. Vérifier console frontend : y a-t-il des erreurs API ?
   - Si oui → `🔌 [API] Erreur de connexion`
   - Vérifié que le serveur backend est lancé (`npm run server`)

2. Vérifier que les logs affichent `POST /api/...` :
   - Si non → l'API n'a pas été appelée
   - Chercher la sauvegarde en localStorage
   - ✅ Elle doit être en API/DB

3. Vérifier la base de données :
   ```bash
   sqlite3 stockprotec.db "SELECT COUNT(*) FROM bags;"
   ```
   - Si 0 → les données n'ont pas été insérées
   - Vérifier les logs serveur pour les erreurs SQL

### Symptôme: localStorage contient les données
**Diagnostic** :
1. Ouvrir console : `F12 → Application → Local Storage`
2. Si vous voyez `bags`, `pharmacyProducts`, etc. :
   - Chercher où elles sont écrites en localStorage
   - ✅ Elles doivent être en API/DB uniquement

### Symptôme: Migration ne marche pas
**Diagnostic** :
1. Vérifier que l'endpoint `/api/migrate` existe
   - Rechercher dans `server.js` la route `POST /api/migrate`

2. Vérifier les logs serveur :
   - `📤 Migration reçue du frontend`
   - `✅ Migration terminée: X enregistrements migrés`

3. Vérifier la base de données :
   ```bash
   sqlite3 stockprotec.db "SELECT COUNT(*) FROM bags;"
   ```

---

**Statut**: ✅ **TOUS LES TESTS DOIVENT PASSER**

Si un test échoue → Document problème dans les logs pour déboguer.
