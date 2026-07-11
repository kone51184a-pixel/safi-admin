# SAFi Admin — Interface web

Interface d'administration React pour SAFi (vendeurs, produits, commandes).

## Installation

### 1. Prérequis
- Ton backend `safi-backend` doit déjà tourner sur `http://localhost:5000` (`npm run dev` dans ce dossier)

### 2. Installer les dépendances
```bash
cd safi-admin
npm install
```

### 3. Lancer l'interface
```bash
npm run dev
```

Vite va te donner une adresse, généralement `http://localhost:5173`. Ouvre-la dans ton navigateur.

## Connexion

Utilise le compte admin que tu as créé la dernière fois (celui que tu as transformé en admin avec la requête SQL `UPDATE users SET user_type = 'admin'...`).

## Ce qui est inclus (MVP)

- **Connexion** avec vérification du rôle admin
- **Tableau de bord** : statistiques de base (commandes, demandes à matcher, CA du jour)
- **Vendeurs** : liste + formulaire d'ajout
- **Produits** : liste + formulaire d'ajout, liés à un vendeur
- **Commandes** : liste avec changement de statut directement dans le tableau (menu déroulant)

## Ce qui n'est pas encore fait (phase 2)
- Modification/suppression de vendeurs et produits (pour l'instant : lecture + création seulement)
- Page Stock dédiée
- Page Utilisateurs/rôles
- Page Comptabilité
- Page Paramètres
- Matching visuel des demandes libres (assigner un vendeur depuis l'interface)
- Assignation de livreur depuis l'interface

Ces écrans suivent tous le même principe que Vendeurs/Produits — on les ajoute au fur et à mesure une fois le MVP de base validé par ton client.

## Structure du projet
```
src/
  api/client.js          -> tous les appels au backend
  context/AuthContext.jsx -> gestion de la connexion (token)
  components/Layout.jsx   -> sidebar + navigation
  components/UI.jsx       -> composants réutilisables (boutons, cartes, badges)
  pages/                   -> une page par écran
```

## Problème fréquent : "Failed to fetch"

Si tu vois cette erreur en te connectant, vérifie que :
1. Le backend (`safi-backend`) tourne bien (`npm run dev` dans son propre terminal, dans un dossier différent)
2. Il tourne bien sur le port `5000` (vérifie l'URL dans `src/api/client.js` si tu l'as changé)
