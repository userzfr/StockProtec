# ❓ FAQ - StockProtec v5.2

## 🤔 Questions générales

### Qu'est-ce que StockProtec ?

**StockProtec** est une application web moderne conçue pour la gestion complète du matériel médical, des équipements et des stocks de la Protection Civile. Elle offre une interface intuitive pour :

- ✅ Gestion des inventaires en temps réel
- ✅ Suivi des mouvements de stock
- ✅ Génération de rapports détaillés
- ✅ Gestion des utilisateurs et rôles
- ✅ Système de sauvegarde automatique
- ✅ Interface responsive (ordinateur/tablette/mobile)

### Quelle est la différence avec les versions précédentes ?

StockProtec v5.2 apporte des améliorations majeures en termes de sécurité et de fonctionnalités :

| Fonctionnalité | v4.x | v5.0 | v5.1 | **v5.2** ✨ |
|---------------|------|------|------|-------------|
| Sécurité mots de passe | ❌ Non hashés | ⚠️ Basique | ✅ PBKDF2 | ✅ **PBKDF2 avancé** |
| Sauvegarde auto | ❌ Manuelle | ❌ Non | ⚠️ Partielle | ✅ **Complète + schedulée** |
| Interface admin | ⚠️ Limitée | ✅ Basique | ✅ Étendue | ✅ **Complète + backup** |
| Conformité RGPD | ❌ Non | ⚠️ Partielle | ✅ Bonne | ✅ **Excellente** |
| Performance | ⚠️ Lente | ✅ Améliorée | ✅ Bonne | ✅ **Optimisée** |

### Qui peut utiliser StockProtec ?

StockProtec est conçu pour :
- 🏥 **Protection Civile** : Gestion du matériel d'urgence
- 🏥 **Hôpitaux** : Suivi des stocks médicaux
- 🏥 **Pharmacies** : Gestion des médicaments
- 🏭 **Entrepôts** : Contrôle des inventaires
- 🏢 **Organisations** : Toute structure nécessitant une gestion de stock rigoureuse

## 🚀 Installation & Configuration

### Comment installer StockProtec ?

**Installation rapide (5 minutes) :**
```bash
git clone https://github.com/userzfr/StockProtec.git
cd StockProtec
npm run setup
npm run prod
```
Accès : `http://localhost:5173`

**Installation détaillée :** Consultez le [guide d'installation](INSTALLATION.md)

### Quels sont les prérequis système ?

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| **Node.js** | 18.0.0 | 20.x LTS |
| **RAM** | 2 GB | 4 GB |
| **Disque** | 500 MB | 2 GB |
| **OS** | Linux/macOS/Windows | Linux Ubuntu 20.04+ |

### Comment mettre à jour StockProtec ?

```bash
# Mise à jour automatique
npm run update

# Ou manuellement
git pull origin main
npm install
npm run migrate
npm run build
```

### Puis-je utiliser StockProtec avec Docker ?

Oui ! StockProtec supporte Docker :

```bash
# Avec Docker Compose
docker-compose up -d

# Ou construction manuelle
docker build -t stockprotec:v5.2 .
docker run -d -p 5173:5173 -p 3001:3001 stockprotec:v5.2
```

## 👤 Utilisation quotidienne

### Comment se connecter à l'application ?

1. Ouvrir `http://localhost:5173`
2. **Comptes de test :**
   - Admin : `admin` / `admin123`
   - User : `user` / `user123`
3. **Sécurité :** Les mots de passe sont hashés avec PBKDF2

### Comment ajouter un nouveau produit ?

1. Menu "Stocks" → "Ajouter un produit"
2. Remplir :
   - **Nom** : Désignation claire
   - **Catégorie** : Classification appropriée
   - **Quantité** : Stock initial
   - **Seuil d'alerte** : Quantité minimum
3. **Options :** Code-barres, date d'expiration, fournisseur

### Comment gérer les utilisateurs ?

**Pour les administrateurs :**
- Menu "Administration" → "Utilisateurs"
- Créer/modifier/supprimer des comptes
- Assigner des rôles (Admin/User)

**Pour les utilisateurs :**
- Modifier leur profil
- Changer leur mot de passe
- Gérer leurs préférences

### Comment utiliser les codes-barres ?

StockProtec supporte :
- **Génération** : Création automatique de codes-barres
- **Lecture** : Scanner avec la caméra du device
- **Impression** : Étiquettes pour les produits
- **Historique** : Traçabilité des scans

### Comment exporter des données ?

Plusieurs formats disponibles :
- **PDF** : Rapports formatés
- **Excel** : Tableurs pour analyse
- **CSV** : Import dans autres systèmes
- **JSON** : Pour intégrations API

## 🔒 Sécurité & Confidentialité

### Les mots de passe sont-ils sécurisés ?

**Oui, absolument !** StockProtec v5.2 utilise :
- **Hashage PBKDF2** : 100,000 itérations, sel aléatoire
- **Jamais stockés en clair** : Ni en base, ni en localStorage
- **Politique de sécurité stricte** : Changement périodique recommandé

### Comment fonctionne la sauvegarde ?

**Sauvegarde automatique :**
- **Fréquence** : Toutes les semaines (dimanche 02:00)
- **Rétention** : 10 dernières sauvegardes
- **Chiffrement** : AES-256 pour les données sensibles
- **Restauration** : Interface admin pour récupération

### StockProtec est-il conforme au RGPD ?

**Oui !** Mesures implémentées :
- ✅ **Droit d'accès** : Consultation de ses données
- ✅ **Rectification** : Modification des informations
- ✅ **Suppression** : Droit à l'oubli
- ✅ **Portabilité** : Export des données
- ✅ **Traçabilité** : Logs d'audit complets

### Puis-je utiliser StockProtec hors ligne ?

**Partiellement :**
- Interface consultable (lecture seule)
- Synchronisation automatique à la reconnexion
- Fonctionnalités limitées sans serveur

## 🐛 Problèmes & Dépannage

### L'application ne démarre pas

**Vérifications :**
```bash
# Ports libres ?
netstat -tlnp | grep -E "(5173|3001)"

# Dépendances installées ?
npm list --depth=0

# Logs d'erreur ?
tail -f logs/stockprotec.log
```

**Solutions communes :**
- Redémarrer : `npm run prod`
- Ports occupés : Changer de port
- Permissions : `chmod +x launcher.sh`

### Erreur de connexion à la base de données

**Diagnostic :**
```bash
# Base existe ?
ls -la server/stockprotec.db

# Permissions correctes ?
chmod 644 server/stockprotec.db

# Intégrité ?
sqlite3 server/stockprotec.db "PRAGMA integrity_check;"
```

**Solutions :**
- Recréer la base : `npm run migrate`
- Restaurer sauvegarde : Interface admin
- Réparer : `sqlite3 server/stockprotec.db ".recover"`

### Interface lente ou freezing

**Optimisations :**
```bash
# Vider cache navigateur
# Ctrl+F5 ou Cmd+Shift+R

# Redémarrer application
npm run prod

# Optimiser base de données
sqlite3 server/stockprotec.db "VACUUM; ANALYZE;"
```

### Problème avec les codes-barres

**Vérifications :**
- Permissions caméra accordées ?
- Navigateur compatible (Chrome recommandé) ?
- HTTPS requis pour la caméra ?

**Test :**
```javascript
// Dans la console du navigateur
navigator.mediaDevices.getUserMedia({video: true})
  .then(() => console.log('Caméra OK'))
  .catch(err => console.error('Erreur caméra:', err));
```

## 🔧 Personnalisation & Développement

### Puis-je personnaliser l'interface ?

**Oui !** StockProtec est entièrement personnalisable :
- **Thèmes** : Clair, sombre, automatique
- **Langues** : Français (principale), extensible
- **CSS personnalisé** : Variables CSS modifiables
- **Composants** : React pour extensions

### L'API est-elle documentée ?

**Complètement !** Consultez :
- **[API Reference](API_REFERENCE.md)** : Toutes les routes
- **[Guide développeur](DEVELOPER_GUIDE.md)** : Architecture
- **Swagger UI** : Interface interactive sur `/api/docs`

### Puis-je intégrer StockProtec à d'autres systèmes ?

**Oui !** L'API REST permet :
- Intégration ERP
- Synchronisation avec d'autres bases
- Automatisation des workflows
- Exports personnalisés

### Comment contribuer au projet ?

**Contributions bienvenues !**
1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commiter (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request

## 📊 Performance & Évolutivité

### Combien d'utilisateurs simultanés ?

**Capacités :**
- **Petite structure** : 50+ utilisateurs
- **Moyenne** : 200+ utilisateurs
- **Grande** : 1000+ avec optimisation

**Facteurs :**
- Configuration serveur
- Optimisations base de données
- Cache et CDN

### Quelle est la taille maximale de la base ?

**SQLite limites :**
- **Taille max** : 281 TB théorique
- **Recommandé** : < 100 GB pour performance
- **Partitionnement** : Possible pour très gros volumes

### StockProtec supporte-t-il le multi-tenant ?

**Actuellement non,** mais l'architecture le permet. Possibilité d'extension pour :
- Séparation par organisation
- Bases de données isolées
- Configuration personnalisée

## 📈 Évolutions futures

### Quelles sont les prochaines fonctionnalités ?

**Roadmap v5.3 (prévue 2026) :**
- 🔐 **Authentification 2FA** : Sécurité renforcée
- 📱 **Application mobile native** : iOS/Android
- 🤖 **IA prédictive** : Prévision des besoins
- 🔗 **API GraphQL** : Requêtes plus flexibles
- 📊 **Business Intelligence** : Tableaux de bord avancés

### StockProtec sera-t-il open source ?

**Oui !** StockProtec est et restera open source sous licence MIT, avec :
- Code source public sur GitHub
- Contributions communautaires
- Transparence totale
- Support gratuit

## 📞 Support & Contact

### Comment obtenir de l'aide ?

**Niveaux de support :**
1. **Documentation** : [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. **FAQ** : Cette page (vous y êtes !)
3. **Issues GitHub** : [Signaler un problème](https://github.com/userzfr/StockProtec/issues)
4. **Support direct** : userz_fr@outlook.fr ou Discord `userz_fr`

### Puis-je avoir un support commercial ?

**Oui,** pour les organisations nécessitant :
- Support prioritaire
- Formation personnalisée
- Développement spécifique
- Hébergement managé

*Contact : userz_fr@outlook.fr*

---

*FAQ - StockProtec v5.2.0*
*Dernière mise à jour : Avril 2026*

**Vous n'avez pas trouvé votre réponse ?** Consultez la [documentation complète](DOCUMENTATION_INDEX.md) ou [ouvrez une issue](https://github.com/userzfr/StockProtec/issues) !