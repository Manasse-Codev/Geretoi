# DayFlow – règles pour l'agent

## Projet
PWA de todo list. Lire README.md avant toute tâche. Les maquettes sont dans Stitch et se récupèrent via le serveur MCP Stitch (voir « Maquettes »). Le cahier des charges motion est dans docs/motion.md.

## Stack
React + Vite + TypeScript, Tailwind CSS, Zustand, vite-plugin-pwa, Firebase (Auth + Firestore), déploiement Cloudflare Pages. Notifications push (phase ultérieure) via un Cloudflare Worker dans worker/.

## Maquettes (Stitch)
- Avant de coder un écran, lister les projets et écrans Stitch accessibles, récupérer l'écran concerné (capture et code), et le regarder.
- Le code généré par Stitch est une référence visuelle, pas un livrable : ne jamais le coller tel quel. Le réimplémenter en composants React avec Tailwind et les tokens de src/styles/tokens.css.
- Une maquette ne contient ni logique, ni routage, ni accessibilité, ni état, ni connexion Firestore : les ajouter.
- Si une maquette contredit les règles de design ci-dessous (contraste, cibles tactiles), appliquer les règles et le signaler.
- Si l'écran demandé est introuvable dans Stitch, demander son nom exact au lieu d'en inventer un.

## Règles Firebase
- Rester sur le plan Spark : ne jamais utiliser Cloud Functions, Cloud Storage ni Firebase Hosting. Ne jamais lier de compte de facturation.
- Ne jamais coder en dur l'ID du projet ou les clés : utiliser les variables VITE_FIREBASE_*.
- Toute lecture utilise des requêtes ciblées avec limit() ; ne jamais écouter une collection entière. Paginer l'historique (20 éléments par page).
- Valider les règles de sécurité avec l'outil de validation du serveur MCP Firebase après chaque modification de firestore.rules. Ne jamais écrire « allow read, write: if true ».
- Développer contre les émulateurs Firebase, jamais contre les données réelles.
- Pas de suppression définitive immédiate : utiliser le champ deletedAt (corbeille de 30 jours, purge côté client à l'ouverture de l'app).
- Historique : status "done" + completedAt. Pas de suppression à la complétion.
- Éviter les écritures fréquentes sur un même document (ex. compteur de Pomodoro) : écrire en fin de session.
- Regrouper les écritures multiples avec writeBatch.
- Les pièces jointes sont des liens (pas de fichiers).
- Conserver la fonction d'export JSON : c'est la seule sauvegarde.

## Design
Style néomorphisme (soft UI) : surfaces monochromes, ombres douces doubles, éléments en relief et en creux. Tokens de couleur dans src/styles/tokens.css (et docs/DESIGN.md quand il existe). Contraste texte ≥ 4.5:1, éléments graphiques ≥ 3:1, cibles tactiles ≥ 44 px. Ne jamais s'appuyer sur la couleur ou l'ombre seule (toujours icône + libellé). Respecter prefers-reduced-motion. Animer uniquement transform et opacity (et stroke-dashoffset pour les anneaux).
- Exception de durée : remplissage des anneaux (stroke-dashoffset) et barres de progression (transform: scaleX) peuvent durer jusqu'à 800 ms ; sous prefers-reduced-motion, afficher directement leur valeur finale.

## Code
- TypeScript strict, pas de any.
- Un dossier par fonctionnalité dans src/features/, avec ses composants, hooks et types.
- Alias d'import @/ pointant vers src/.
- Textes de l'interface en français, centralisés dans src/i18n pour permettre l'ajout de l'anglais plus tard.

## Qualité
Lancer lint, vérification de types, tests et build avant de conclure une tâche. Ne pas ajouter de dépendance sans la justifier dans le message final. Ne jamais commit de secrets ni de fichier .env.

## Méthode de travail
Avancer écran par écran, petites étapes validables. Résumer ce qui a été fait et ce qui reste à faire à la fin de chaque tâche.
