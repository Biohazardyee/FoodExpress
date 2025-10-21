# FoodExpress

FoodExpress est une API RESTful développée en Node.js/Express.js permettant la gestion d'utilisateurs, de restaurants et de menus pour une plateforme de commande de repas en ligne.

## Fonctionnalités principales

- Gestion des utilisateurs (CRUD, rôles user/admin, authentification JWT)
- Gestion des restaurants (CRUD réservé aux admins, lecture publique avec tri/pagination)
- Gestion des menus (CRUD réservé aux admins, lecture publique avec tri/pagination)
- Validation des entrées
- Documentation Swagger (OpenAPI)
- Tests essentiels (Mocha)

## Prérequis

- Node.js >= 16
- npm

## Installation

Clonez le dépôt et installez les dépendances :

```bash
git clone https://github.com/Biohazardyee/FoodExpress.git
cd FoodExpress
npm install
```

## Configuration de l'environnement
Créez un fichier `.env` à la racine du projet ./FoodExpress et ajoutez les variables d'environnement nécessaires :

```env
MONGO_DB={URL_DE_VOTRE_BASE_DE_DONNÉES_MONGODB}
JWT_SECRET={VOTRE_CLEF_SECRÈTE_JWT}
```

## Lancement du serveur
Démarrez le serveur en mode développement :

```bash
npm run dev
```

Le serveur sera accessible sur http://localhost:3000.

## Documentation API

La documentation Swagger est disponible à l'adresse http://localhost:3000/api-docs.

## Tests

Exécutez les tests avec :

```bash
npm test
npm test:coverage
```