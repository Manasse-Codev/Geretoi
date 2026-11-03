# Architecture

DayFlow utilise React, Vite et TypeScript strict, avec Tailwind CSS, un routage React Router et un découpage par fonctionnalité. Firebase Auth et Firestore sont initialisés depuis `VITE_FIREBASE_*`. Firestore utilise une persistance locale multi-onglets pour le fonctionnement hors ligne. Les préférences sont enregistrées dans `users/{uid}/profile/preferences`. Le déploiement cible Cloudflare Pages et les notifications ultérieures un Cloudflare Worker.

Le projet Firebase de développement est sélectionné par défaut via l'alias `default` dans `.firebaserc`. Les émulateurs Auth et Firestore sont lancés par `npm run emulators`; Firestore écoute sur le port `18080` (Auth sur `9099`, WebSocket Firestore sur `19150`), selon `firebase.json`.

Firestore est la source de données, avec persistance locale gérée par le SDK Firebase ; Dexie n'est pas utilisé. Les types partagés décrivent les champs de tâche et les préférences documentés dans le README.
