# Migration vers PostgreSQL

Ce guide explique comment migrer les données de SQLite vers PostgreSQL.

## Prérequis

1. Installer PostgreSQL sur votre système.
2. Créer une base de données nommée `stockprotec`.
3. Configurer les variables d'environnement (optionnel) :
   - `DB_HOST`: hôte de la base de données (défaut: localhost)
   - `DB_PORT`: port (défaut: 5432)
   - `DB_NAME`: nom de la base (défaut: stockprotec)
   - `DB_USER`: utilisateur (défaut: postgres)
   - `DB_PASSWORD`: mot de passe (défaut: password)

## Étapes de migration

1. **Sauvegarder les données SQLite** (optionnel mais recommandé) :
   - Copier le fichier `stockprotec.db` dans un endroit sûr.

2. **Exécuter la migration** :

   ```bash
   npm run migrate:to-pg
   ```

   Cette commande copie toutes les données de SQLite vers PostgreSQL.

3. **Démarrer le serveur avec PostgreSQL** :

   ```bash
   npm run server:pg
   ```

4. **Tester l'application** :

   ```bash
   npm run dev:all:pg
   ```

## Fichiers modifiés/ajoutés

- `server/database_pg.js`: Configuration PostgreSQL
- `server/server_pg.js`: Serveur adapté pour PostgreSQL
- `server/migrate_to_pg.js`: Script de migration
- `package.json`: Scripts ajoutés pour PostgreSQL

## Revenir à SQLite

Si vous voulez revenir à SQLite, utilisez les scripts originaux :

- `npm run server` pour le serveur SQLite
- `npm run dev:all` pour développement avec SQLite
