# ⚡ QuickStart - Commandes Pratiques

## 🚀 Démarrer l'application complète

### Option 1: Deux terminals séparés (RECOMMANDÉ)

**Terminal 1 - Backend**:
```bash
cd c:\Users\mathi\Documents\GitHub\StockProtec
npm run server
```
Résultat attendu:
```
✅ Base de données initialisée avec succès
🚀 Serveur API démarré sur http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd c:\Users\mathi\Documents\GitHub\StockProtec
npm run dev
```
Résultat attendu:
```
VITE v6.4.2 ready in 966 ms
➜ Local: http://localhost:5173/
```

Puis ouvrir **http://localhost:5173** dans le navigateur.

### Option 2: Les deux en parallèle (npm concurrently)
```bash
npm run dev:all
```

---

## 🧪 Tests Rapides

### Test 1: Créer un sac et vérifier la persistance
```bash
# 1. Console du navigateur (F12)
# 2. Créer un sac
# 3. Vérifier console: 
#    📤 [API] POST /api/bags
#    ✅ [API] /api/bags OK
# 4. Rafraîchir (F5)
# 5. ✅ Sac doit être toujours présent
```

### Test 2: Vérifier localStorage
```bash
# Console du navigateur (F12 → Application → Local Storage)
# ✅ Doit voir UNIQUEMENT: authState
# ❌ NE doit pas voir: bags, pharmacyProducts, categories, etc.
```

### Test 3: Vérifier la base de données SQLite
```bash
sqlite3 c:\Users\mathi\Documents\GitHub\StockProtec\stockprotec.db
SELECT COUNT(*) FROM bags;  -- ✅ Doit voir > 0
.quit
```

### Test 4: Migration depuis localStorage (si anciennes données)
```javascript
// Console navigateur:
localStorage.setItem('bags', JSON.stringify([
  {id: 'old-1', name: 'Ancien sac', qrCode: 'OLD-001', deploymentStatus: 'present', createdAt: new Date().toISOString()}
]));
// Refresh (F5)
// ✅ MigrationDialog doit s'ouvrir
// Cliquer "Migrer"
// ✅ Toast: "Migration réussie !"
```

---

## 🔍 Debugging

### Voir les logs API en temps réel
```javascript
// Console navigateur (F12 → Console)
// Chaque opération affiche:
// 📤 [API] POST /api/bags
// ✅ [API] /api/bags OK
// ❌ [API] Erreur 500: Database error
// 🔌 [API] Erreur de connexion
```

### Voir les logs du serveur en temps réel
```bash
# Terminal 1 (backend)
# Chaque opération affiche des logs détaillés
```

### Tester un endpoint manuellement
```bash
# Test GET /api/bags
curl http://localhost:3001/api/bags

# Test POST /api/bags
curl -X POST http://localhost:3001/api/bags \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"test-1\",\"name\":\"Test\",\"qrCode\":\"TEST-001\"}"

# Test migration
curl -X POST http://localhost:3001/api/migrate \
  -H "Content-Type: application/json" \
  -d "{\"users\":[],\"bags\":[{\"id\":\"1\",\"name\":\"Test\"}]}"
```

---

## 🛠️ Commandes Utiles

### Build le frontend (production)
```bash
npm run build
# Résultat: dist/index.html, dist/assets/...
```

### Nettoyer et réinstaller
```bash
npm install
npm rebuild
```

### Redémarrer les serveurs (nouvelle session)
```bash
npm run server    # Terminal 1
npm run dev       # Terminal 2
```

---

## 📋 Checklist de Démarrage

- [ ] Vérifier que Node.js est installé: `node --version` → v22+ ✅
- [ ] Démarrer backend: `npm run server` → Running on 3001 ✅
- [ ] Démarrer frontend: `npm run dev` → Running on 5173 ✅
- [ ] Ouvrir navigateur: http://localhost:5173
- [ ] Se connecter: admin / admin123
- [ ] Ouvrir F12 (Console) pour voir les logs
- [ ] Créer un sac et vérifier persistance après F5

---

## 🚨 Erreurs Courantes

### Erreur: "Port 3001 already in use"
```bash
# Chercher le process qui occupe le port:
# Windows:
netstat -ano | findstr :3001

# Tuer le process (ex: PID 1234):
taskkill /PID 1234 /F

# Ou simplement redémarrer le terminal
```

### Erreur: "Cannot find module 'express'"
```bash
# Réinstaller les dépendances:
npm install
npm rebuild
```

### Erreur: "Cannot resolve @/app/components/ui/button"
```bash
# Cela ne devrait plus arriver (corrections appliquées)
# Si cela arrive: 
# 1. Vérifier vite.config.ts a l'alias @
# 2. npm run build → doit être OK
# 3. Redémarrer: npm run dev
```

### Erreur: "🔌 [API] Erreur de connexion"
```bash
# Le frontend ne peut pas atteindre le backend
# Vérifier:
# 1. Backend est lancé? → npm run server ✅
# 2. Port 3001? → http://localhost:3001/api/health
# 3. Proxy Vite? → vite.config.ts section proxy ✅
```

### Données disparaissent après refresh
```bash
# 1. Vérifier console: y a-t-il des erreurs API?
#    📤 [API] POST/PUT/DELETE doit être visible
# 2. Vérifier backend logs: y a-t-il une erreur SQL?
# 3. Vérifier SQLite: SELECT COUNT(*) FROM bags
# 4. Vérifier localStorage: ne doit pas contenir les données
```

---

## 📚 Documentation de Référence

- **CORRECTIONS_APPLIQUEES.md** - Détail complet des corrections
- **GUIDE_TESTS_PERSISTANCE.md** - Tous les tests détaillés
- **CHANGELOG_FIXES.md** - Historique des changements
- **DEVELOPER_GUIDE.md** - Documentation du projet
- **vite.config.ts** - Configuration Vite

---

## 💡 Conseils

1. **Gardez F12 Console ouverte** - Vous verrez les logs API en temps réel
2. **Testez rapidement** - Créer/modifier/supprimer un sac en 30 secondes
3. **Vérifiez SQLite** - `sqlite3 stockprotec.db` pour confirmer persistance
4. **Monitorez les logs** - Backend logs sont très informatifs
5. **Relancez si doute** - Ctrl+C les serveurs et relancez via npm

---

**Bon développement !** 🚀
