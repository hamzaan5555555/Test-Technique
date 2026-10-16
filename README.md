# EventHub

Application de gestion d’événements construite avec PostgreSQL, Express, React et Node.js. Elle permet de gérer les événements, les participants, les inscriptions et les statistiques, avec authentification JWT et rôles `admin` / `staff`.

## Prérequis

- Node.js 20 ou version ultérieure et npm
- PostgreSQL 16 (installation locale) ; Docker est facultatif

## Installation locale

### 1. Préparer PostgreSQL

Créez une base de données nommée `eventhub`, puis exécutez les scripts depuis la racine du projet :

```powershell
psql -U postgres -c "CREATE DATABASE eventhub;"
psql -U postgres -d eventhub -f backend/db/schema.sql
psql -U postgres -d eventhub -f backend/db/seed.sql
```

Adaptez l’utilisateur PostgreSQL `postgres` à votre installation. **Attention :** `schema.sql` supprime puis recrée les tables EventHub. Ne le relancez pas sur une base contenant des données à conserver.

### 2. Configurer et démarrer l’API

Créez `backend/.env` avec les variables suivantes, en adaptant l’utilisateur et le mot de passe PostgreSQL :

```dotenv
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:mot_de_passe@localhost:5432/eventhub
JWT_SECRET=remplacer_par_une_cle_locale_de_32_caracteres
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

Puis, dans un terminal :

```powershell
cd backend
npm install
npm run dev
```

L’API est disponible à `http://localhost:4000`. Le point de contrôle de santé est `GET http://localhost:4000/health`. La documentation interactive Swagger est disponible sur `http://localhost:4000/api-docs/`.

### 3. Démarrer le frontend

Dans un autre terminal :

```powershell
cd frontend
npm install
npm run dev
```

Ouvrez l’adresse Vite affichée dans le terminal (par défaut `http://localhost:5173`). L’API utilise par défaut `http://localhost:4000/api`. Si elle est hébergée ailleurs, définissez `VITE_API_URL` dans `frontend/.env`, par exemple `VITE_API_URL=http://localhost:4000/api`.

## Comptes de démonstration

Les identifiants sont créés par `backend/db/seed.sql` :

- Administrateur : `admin@eventhub.com` / `Admin123!`
- Staff : `staff@eventhub.com` / `Staff123!`

Ces comptes sont réservés au développement. Changez les mots de passe avant tout déploiement.

## Docker Compose (facultatif)

Docker n’est pas nécessaire pour le démarrage local décrit ci-dessus. Si Docker est installé, depuis la racine du projet :

```powershell
docker compose up --build
```

Cette commande démarre PostgreSQL, l’API et le frontend. L’initialisation automatique du schéma et des données de démonstration ne se produit que lorsque le volume PostgreSQL est créé pour la première fois. `docker compose down -v` supprime également ce volume et toutes les données qu’il contient.

## Commandes utiles

- `npm run dev` dans `backend` : démarre l’API en mode développement avec surveillance des fichiers.
- `npm run start` dans `backend` : démarre l’API.
- `npm run dev` dans `frontend` : démarre Vite.
- `npm run build` dans `frontend` : construit le frontend pour la production.

Voir [docs/erd.md](docs/erd.md) pour le modèle de données et [openapi.yaml](openapi.yaml) pour la documentation de l’API. Le schéma et les données initiales se trouvent dans `backend/db/`.
