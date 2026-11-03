# Architecture

DayFlow utilise React, Vite et TypeScript strict, avec Tailwind CSS, un routage React Router et un découpage par fonctionnalité. Les pages actuelles sont des placeholders. Firebase Auth et Firestore sont initialisés depuis `VITE_FIREBASE_*`; le cache Firestore persistant multi-onglets est prévu pour le hors-ligne. Le déploiement cible Cloudflare Pages et les notifications ultérieures un Cloudflare Worker.

Le fichier `.firebaserc` contient le marqueur `__SET_ME__` : remplacez-le par l'alias ou l'ID de projet uniquement lors de la configuration Firebase. Aucun projet n'est présumé ici.

Le README décrit un stockage local IndexedDB par défaut (Dexie) et une synchronisation cloud facultative, tandis que la section « Règles Firebase » décrit le cache Firestore et des écritures synchronisées hors ligne. Le choix futur entre IndexedDB local-first et Firestore persistant reste à trancher. Le README définit désormais les chemins et quelques champs de tâche, sans schéma complet ; les types incluent les champs explicitement demandés pour cette base d'architecture.
