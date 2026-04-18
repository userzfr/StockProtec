# 🚀 Configuration du Déploiement Automatique

## Vue d'ensemble
Ce guide explique comment configurer le déploiement automatique de StockProtec sur votre serveur via GitHub Actions.

## 🔑 Étapes de configuration

### 1. Générer une clé SSH (si vous n'en avez pas)

Sur votre serveur:
```bash
ssh-keygen -t ed25519 -C "github-actions"
# Appuyez sur Entrée pour accepter le chemin par défaut
# Laissez la passphrase vide (ou définie-la si vous la gérez)
```

### 2. Autoriser la clé publique sur le serveur

```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Copier la clé privée vers GitHub

```bash
cat ~/.ssh/id_ed25519
# Copier tout le contenu (du début -----BEGIN à la fin -----)
```

### 4. Configurer les Secrets GitHub

1. Allez dans votre repository GitHub
2. Settings → Secrets and variables → Actions
3. Cliquez sur "New repository secret" et ajoutez:

| Nom | Valeur | Exemple |
|-----|--------|---------|
| `DEPLOY_HOST` | IP ou domaine du serveur | `192.168.1.100` ou `mon-serveur.com` |
| `DEPLOY_USER` | Utilisateur SSH | `ubuntu` ou `root` |
| `DEPLOY_KEY` | Contenu de la clé privée SSH | (Coller tout le contenu de `id_ed25519`) |
| `DEPLOY_PATH` | Chemin du projet sur le serveur | `/home/ubuntu/stockprotec` |

### 5. Préparer le serveur

Sur votre serveur, assurez-vous que:
- Node.js 20+ est installé
- Git est installé
- Le répertoire de destination existe et appartient à l'utilisateur SSH

```bash
mkdir -p /home/ubuntu/stockprotec
cd /home/ubuntu/stockprotec
git init
```

### 6. Configuration du service (optionnel)

Pour redémarrer automatiquement l'application, utilisez PM2 ou systemd.

#### Option A: Avec PM2 (recommandé)
```bash
npm install -g pm2
pm2 start "npm run prod" --name stockprotec
pm2 save
pm2 startup
```

#### Option B: Avec systemd
Créez `/etc/systemd/system/stockprotec.service`:
```ini
[Unit]
Description=StockProtec Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/stockprotec
ExecStart=/usr/bin/node /home/ubuntu/stockprotec/server/server.js
Environment=NODE_ENV=production
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Puis:
```bash
sudo systemctl daemon-reload
sudo systemctl enable stockprotec
sudo systemctl start stockprotec
```

## 📝 Comment ça marche

1. **Vous poussez du code sur la branche `main`**
   ```bash
   git push origin main
   ```

2. **GitHub Actions s'exécute automatiquement:**
   - Checkout du code
   - Installation des dépendances
   - Construction du projet (npm run build)
   - Connexion SSH au serveur
   - Mise à jour du code via Git
   - Installation des dépendances (version production)
   - Redémarrage de l'application

3. **Votre serveur est à jour!**

## 🧪 Test du déploiement

Vous pouvez déclencher manuellement le déploiement:
1. Allez dans votre repository
2. Actions → Deploy to Server → Run workflow → Run workflow

## 🐛 Dépannage

### Erreur: "Permission denied (publickey)"
- Vérifiez que la clé publique est dans `~/.ssh/authorized_keys` sur le serveur
- Testez: `ssh -i ~/.ssh/id_ed25519 utilisateur@serveur`

### Erreur: "npm: command not found"
- Node.js n'est pas installé sur le serveur
- Installer: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`

### Erreur: "git: command not found"
- Installer Git: `sudo apt-get install git`

### Le déploiement réussit mais l'app ne démarre pas
- Vérifiez les logs: `pm2 logs stockprotec` ou `sudo journalctl -u stockprotec -f`
- Vérifiez que les ports sont disponibles (3000, 5173, etc.)

## ✅ Variables d'environnement

Si vous avez besoin de variables d'environnement sur le serveur, créez un fichier `.env`:

```bash
# Sur le serveur
cat > /home/ubuntu/stockprotec/.env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
EOF
```

## 🔄 Rollback en cas de problème

Si une version cassse le serveur:
```bash
cd /home/ubuntu/stockprotec
git log --oneline
git reset --hard <commit-hash-precedent>
npm install
npm run build
pm2 restart stockprotec
```

## 📚 Ressources

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [PM2 Documentation](https://pm2.keymetrics.io/)
