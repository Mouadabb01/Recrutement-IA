# Plateforme de Recrutement Intelligente (RecruitAI)

Ce dépôt contient la plateforme complète de recrutement intelligent intégrant l'analyse de CV automatisée et le calcul d'adéquation via l'IA de Gemini.

## Structure du Monorepo

*   **`backend/`** : Serveur REST Spring Boot 3.x écrit en Java 25.
*   **`frontend/`** : Application web cliente Single Page Application construite avec React et Vite.

---

## Guide de Démarrage Rapide

### Prerequis
*   **Java 21** ou **Java 25** (installé localement)
*   **Node.js v18+** et **npm**
*   **PostgreSQL** avec une base de données nommée `recrut` créée (identifiants par défaut: `postgres`/`postgres`).

---

### 🚀 1. Lancement du Backend (Spring Boot)

1. Déplacez-vous dans le dossier backend :
   ```bash
   cd backend
   ```
2. Remplissez votre clé API Google Studio AI pour activer l'analyse IA (optionnel, un fallback local est actif en cas d'absence) :
   *   Sur Windows (cmd) : `set GEMINI_API_KEY=votre_cle_api`
   *   Sur Windows (Powershell) : `$env:GEMINI_API_KEY="votre_cle_api"`
   *   Sur Linux/macOS : `export GEMINI_API_KEY="votre_cle_api"`
3. Exécutez le serveur en mode développement :
   ```bash
   mvn spring-boot:run
   ```
   Le serveur démarre sur le port `8080`.

---

### 💻 2. Lancement du Frontend (React)

1. Déplacez-vous dans le dossier frontend :
   ```bash
   cd ../frontend
   ```
2. Installez les dépendances npm :
   ```bash
   npm install
   ```
3. Lancez l'application en mode dev :
   ```bash
   npm run dev
   ```
   L'application sera disponible sur `http://localhost:5173`.

---

## Fonctionnalités Principales
*   **Authentification sécurisée (JWT)** pour Candidats, Recruteurs et Administrateurs.
*   **Création d'offres d'emploi** par les recruteurs.
*   **Matching IA instantané :** Les candidats collent leur texte de CV et postulent en 1 clic. L'IA de Gemini évalue le profil par rapport aux exigences du poste et attribue un score précis de 0 à 100% avec des conseils constructifs.
*   **Tableau de bord de gestion** permettant aux recruteurs de revoir les candidatures triées par score IA et de changer leur statut.
*   **Statistiques globales** de la plateforme.
