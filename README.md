# FoodExpress 🍔

**FoodExpress** est une API RESTful développée en **Node.js** et **Express.js** pour gérer les utilisateurs, restaurants et menus d'une plateforme de commande de repas en ligne.

Cette API est conçue pour être **modulaire**, **sécurisée** et facilement extensible.

---

## 🚀 Fonctionnalités principales

* **Gestion des utilisateurs** : CRUD complet, rôles `user`/`admin`, authentification via JWT
* **Gestion des restaurants** : CRUD réservé aux admins, lecture publique avec tri et pagination
* **Gestion des menus** : CRUD réservé aux admins, lecture publique avec tri et pagination
* **Validation des entrées** pour assurer la cohérence des données
* **Documentation Swagger** pour faciliter l'intégration (OpenAPI)
* **Tests unitaires essentiels** avec Mocha

---

## 🛠️ Prérequis

* Node.js >= 16
* npm
* Git

---

## ⚡ Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/Biohazardyee/FoodExpress.git
cd FoodExpress
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet et ajoutez :

```env
MONGO_DB={URL_DE_VOTRE_BASE_DE_DONNÉES_MONGODB}
JWT_SECRET={VOTRE_CLEF_SECRÈTE_JWT}
```

---

## 🏃‍♂️ Lancement du serveur

Démarrez le serveur en mode développement :

```bash
npm run dev
```

Le serveur sera accessible sur : [http://localhost:3000](http://localhost:3000)

---

## 📄 Documentation API

La documentation Swagger est disponible à :
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Cette documentation permet de **tester toutes les routes** et de comprendre les **paramètres attendus**.

---

## ✅ Tests

Exécutez les tests unitaires :

```bash
npm test
```

Générez le rapport de couverture des tests :

```bash
npm run test:coverage
```

## 🏗️ Structure du projet

```
FoodExpress/
├─ src/                # Code source de l'application
│  ├─ controllers/     # Logique métier des routes
│  ├─ models/          # Schémas Mongoose
│  ├─ routes/          # Définition des routes API
│  ├─ middlewares/     # Middlewares (auth, validation)
│  ├─ utils/           # Fonctions utilitaires
│  ├─ config/          # Configuration de l'application
│  └─ app.js           # Point d'entrée de l'application
├─ tests/              # Tests unitaires
├─ .gitignore          # Fichiers et dossiers à ignorer par Git
├─ README.md           # Documentation du projet
├─ package.json        # Dépendances et scripts du projet
└─ .env                # Variables d'environnement
```

## 🔒 Sécurité

* **JWT** pour l'authentification et la gestion des rôles
* Validation des entrées pour éviter les injections et erreurs
* Structure modulable pour un futur renforcement de sécurité

