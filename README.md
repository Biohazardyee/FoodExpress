# FoodExpress 🍔

**FoodExpress** est une API RESTful développée en **Node.js** et **Express.js** pour gérer les utilisateurs, restaurants et menus d'une plateforme de commande de repas en ligne.

Cette API est conçue pour être **modulaire**, **sécurisée** et facilement extensible.

## 🚀 Fonctionnalités principales

* **Gestion des utilisateurs** : CRUD complet, rôles `user`/`admin`, authentification via JWT
* **Gestion des restaurants** : CRUD réservé aux admins, lecture publique avec tri et pagination
* **Gestion des menus** : CRUD réservé aux admins, lecture publique avec tri et pagination
* **Validation des entrées** pour assurer la cohérence des données
* **Documentation Swagger** pour faciliter l'intégration (OpenAPI)
* **Tests unitaires essentiels** avec Mocha

--- 

## 🛠️ Technologies utilisées

### Langages & Frameworks
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-F7DF1E?logo=typescript&logoColor=black)


### Bases de données & Documentation
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

### Outils & Tests
![Git](https://img.shields.io/badge/Git-181717?logo=git)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?logo=visual-studio-code&logoColor=white)
![Mocha](https://img.shields.io/badge/Mocha-8D6748?logo=mocha&logoColor=white)

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
│  ├─ bin/             # binaire du projet
│  ├─ config/          # Configuration de la DB
│  ├─ controllers/     # Logique métier des routes
│  ├─ schema/          # Schémas Mongoose
│  ├─ routes/          # Définition des routes API
│  ├─ middlewares/     # Middlewares (auth, validation)
│  ├─ types/           # Ajoute propriété user au type request
│  ├─ services/        # Permet de transmettre à la DB
│  ├─ utils/           # Fonctions utilitaires
│  ├─ tests/           # Tests Unitaires
│  ├─ config/          # Configuration de l'application
|  ├─ package.json     # Dépendances et scripts du projet
|  ├─ package-lock.json 
│  └─ app.js           # Point d'entrée de l'application
├─ .gitignore          # Fichiers et dossiers à ignorer par Git
├─ README.md           # Documentation du projet
└─ .env                # Variables d'environnement
```

## 🔒 Sécurité

* **JWT** pour l'authentification et la gestion des rôles
* Validation des entrées pour éviter les injections et erreurs
* Structure modulable pour un futur renforcement de sécurité

