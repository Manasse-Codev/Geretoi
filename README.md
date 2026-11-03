# 🗓️ DayFlow — Todo list PWA pour organiser ses journées

DayFlow est une **Progressive Web App** (installable, utilisable hors-ligne, synchronisée entre tous vos appareils) pour planifier, suivre et terminer ses tâches au quotidien. Pensée *mobile-first*, rapide et **100 % hébergeable gratuitement**.

---

## ✨ Fonctionnalités

### 1. Gestion des tâches
- Créer, modifier, dupliquer et supprimer une tâche
- Ajout rapide (une seule ligne de saisie) + formulaire détaillé
- Marquer comme terminée / rouvrir (avec animation et possibilité d'annuler)
- Description longue avec support Markdown simple (gras, listes, liens)
- **Sous-tâches** (checklist) avec barre de progression
- Notes et liens associés à une tâche
- Corbeille avec restauration (30 jours)

### 2. Organisation de la journée
- **Vue « Aujourd'hui »** : tâches du jour, en retard, et à venir
- **Vue « Planning »** : timeline horaire de la journée (time blocking)
- Glisser-déposer des tâches sur la timeline pour les planifier
- Durée estimée par tâche et total du temps planifié
- Vue **semaine** et vue **mois** (calendrier)
- Reprogrammation en un geste (demain, ce week-end, semaine prochaine)
- Report automatique proposé des tâches non terminées en fin de journée
- Revue du soir : bilan de la journée et préparation du lendemain

### 3. Priorités et classement
- 4 niveaux de priorité (urgent, haute, normale, basse) avec code couleur
- Matrice d'Eisenhower (urgent / important) en option
- Tri : date, priorité, durée, ordre manuel, alphabétique
- Réorganisation manuelle par glisser-déposer
- Épingler les 3 tâches clés du jour (« Top 3 »)

### 4. Catégories, listes et étiquettes
- Listes personnalisées (Perso, Travail, Courses, Projets…)
- Couleurs et icônes par liste
- Étiquettes (tags) multiples par tâche
- Filtres combinables : liste, tag, priorité, statut, date
- Filtres enregistrés (vues personnalisées)

### 5. Récurrence
- Tâches répétitives : quotidienne, hebdomadaire, mensuelle, annuelle
- Jours précis (ex. lundi + jeudi), intervalles personnalisés
- Habitudes : suivi des séries (streaks) pour les tâches récurrentes
- Création automatique de l'occurrence suivante à la complétion

### 6. Rappels et notifications
- Rappels à heure précise ou relatifs (10 min / 1 h / 1 jour avant)
- **Phase 1 (sans serveur)** : notifications locales quand l'app est ouverte ou récemment active
- **Phase 2 (push serveur)** : notifications push même application fermée, via Firebase Cloud Messaging + tâche planifiée (voir section « Notifications push »)
- Résumé du matin : « Voici vos tâches du jour »
- Rappel de fin de journée pour la revue du soir
- Mode « Ne pas déranger » et report de rappel (snooze)

> ℹ️ Sur iPhone, les notifications push ne fonctionnent que si la PWA est **installée sur l'écran d'accueil**.

### 7. Recherche
- Recherche instantanée dans titres, descriptions, tags et sous-tâches
- Suggestions et recherches récentes
- Raccourci clavier pour ouvrir la recherche

### 8. Focus et productivité
- **Minuteur Pomodoro** lié à une tâche
- Mode Focus : une seule tâche affichée à la fois
- Suivi du temps réellement passé vs. estimé
- Statistiques : tâches terminées par jour/semaine, taux de complétion, séries, temps de focus
- Graphiques d'évolution et historique

### 9. PWA & hors-ligne
- ✅ **Installable** sur mobile et desktop (écran d'accueil, icône, mode plein écran)
- ✅ **Fonctionne 100 % hors-ligne** (Service Worker + persistance locale Firestore)
- ✅ Synchronisation automatique au retour de la connexion
- ✅ Chargement instantané (App Shell)
- ✅ Mises à jour silencieuses avec bannière « Nouvelle version disponible »
- ✅ Raccourcis d'application (Ajouter une tâche, Aujourd'hui)
- ✅ Partage vers l'app (Web Share Target) : envoyer un texte ou un lien pour créer une tâche

### 10. Compte et synchronisation multi-appareils
- Connexion via **Firebase Authentication** (Google ou email / mot de passe)
- **Synchronisation en temps réel** entre téléphone, tablette et ordinateur
- Utilisation hors-ligne : les modifications sont mises en file d'attente puis synchronisées automatiquement
- Données isolées par utilisateur (règles de sécurité Firestore)
- Export / import : JSON, CSV
- Export du calendrier (.ics) pour Google Calendar / Apple Calendar / Outlook

### 11. Personnalisation
- Thème clair / sombre / automatique (suit le système)
- Couleur d'accent personnalisable
- Choix de la langue (FR / EN)
- Premier jour de la semaine, format 12 h / 24 h
- Densité d'affichage (compact / confortable)
- Page d'accueil configurable (Aujourd'hui, Planning, Listes)

### 12. Ergonomie et accessibilité
- Interface mobile-first et responsive
- Gestes : balayer pour terminer / reporter / supprimer
- Raccourcis clavier (`N` nouvelle tâche, `/` recherche, `T` aujourd'hui…)
- Annuler / rétablir les dernières actions
- Navigation au clavier et compatible lecteurs d'écran (ARIA)
- Contrastes conformes WCAG AA, respect de `prefers-reduced-motion`
- Retours haptiques sur mobile (si supporté)

### 13. Collaboration *(optionnel / évolution)*
- Partage d'une liste avec d'autres personnes
- Assignation de tâches et commentaires
- Activité récente et notifications de changements

---

## 🧱 Stack technique (hébergement gratuit)

| Besoin | Choix | Coût |
|---|---|---|
| Framework | React + Vite | Gratuit |
| Langage | TypeScript | Gratuit |
| Styles | Tailwind CSS | Gratuit |
| État UI | Zustand | Gratuit |
| PWA / hors-ligne | `vite-plugin-pwa` (Workbox) | Gratuit |
| Base de données + synchro | **Firestore** (persistance hors-ligne activée) | Gratuit (plan Spark) |
| Authentification | **Firebase Auth** | Gratuit (plan Spark) |
| Hébergement du front | **Cloudflare Pages** | Gratuit |
| Push (phase 2) | Firebase Cloud Messaging + Cloudflare Worker planifié | Gratuit |
| Dates | date-fns | Gratuit |
| Glisser-déposer | dnd-kit | Gratuit |
| Graphiques | Recharts | Gratuit |
| Tests | Vitest + Playwright | Gratuit |

### Pourquoi ces choix ?
- **Firestore** gère nativement le cache local, le mode hors-ligne et la synchro temps réel : pas besoin de code de synchronisation maison ni de Dexie.
- **Plan Spark** : aucune carte bancaire requise, jamais de facture (le service s'arrête simplement si un quota est atteint).
- **Cloudflare Pages** : hébergement statique gratuit, HTTPS inclus (obligatoire pour les Service Workers et les notifications).

### Quotas gratuits à garder en tête (à vérifier sur les pages officielles)
- Firestore (Spark) : ~50 000 lectures et 20 000 écritures par jour, 1 Gio de stockage
- Firebase Auth : 50 000 utilisateurs actifs par mois
- Cloud Messaging (push) : gratuit
- Cloudflare Pages : requêtes statiques illimitées, 500 builds par mois, 20 000 fichiers par site

Largement suffisant pour un usage personnel. Les limites gratuites évoluant régulièrement, vérifiez-les avant de déployer.

### ⚠️ À éviter pour rester gratuit
- **Cloud Storage for Firebase** : exige désormais le plan Blaze (carte bancaire). Les pièces jointes sont donc limitées à des liens.
- **Cloud Functions** : exigent le plan Blaze. On utilise un Cloudflare Worker à la place pour les push.

---

## 🔔 Notifications push (phase 2)

Pour envoyer des rappels quand l'app est fermée, un petit serveur est nécessaire. Trois options :

1. **Phase 1** : notifications locales uniquement (app ouverte ou récemment active) — gratuit, simple.
2. **Sans carte bancaire** : un Cloudflare Worker avec déclencheur planifié (cron) qui lit les rappels à venir et envoie les push via Firebase Cloud Messaging. Vérifier les limites des tâches planifiées du plan gratuit Cloudflare.
3. **Avec carte bancaire** : passer le projet Firebase en Blaze pour utiliser Cloud Functions (les quotas gratuits restent appliqués, mais la facturation devient possible au-delà).

---

## 🗃️ Modèle de données Firestore

```
users/{uid}
├── profile            # préférences (thème, langue, etc.)
├── lists/{listId}     # name, color, icon, order
├── tags/{tagId}       # name, color
└── tasks/{taskId}
    ├── title, description, status
    ├── priority, dueDate, startTime, estimatedMinutes
    ├── listId, tags[], links[]
    ├── subtasks[]     # { id, title, done }
    ├── recurrence     # { type, interval, days[] }
    ├── reminders[]    # { at, sent }
    └── createdAt, updatedAt, deletedAt
```

### Règles de sécurité (extrait)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

> Les requêtes combinées (ex. date + priorité) nécessitent des index composites : Firebase propose un lien de création automatique dans la console quand une requête en a besoin.

---

## 📁 Structure du projet

```
dayflow/
├── public/
│   ├── icons/                  # Icônes PWA (192, 512, maskable)
│   └── manifest.webmanifest
├── src/
│   ├── components/             # Composants UI
│   ├── features/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── planner/
│   │   ├── lists/
│   │   ├── reminders/
│   │   ├── focus/
│   │   └── stats/
│   ├── lib/
│   │   ├── firebase.ts         # Init Firebase + persistance hors-ligne
│   │   ├── recurrence.ts       # Logique de récurrence
│   │   └── dates.ts
│   ├── hooks/
│   ├── sw.ts                   # Service Worker
│   ├── App.tsx
│   └── main.tsx
├── worker/                     # Cloudflare Worker (push, phase 2)
├── firestore.rules
├── firestore.indexes.json
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Installation

### 1. Cloner et installer

```bash
git clone https://github.com/votre-compte/dayflow.git
cd dayflow
npm install
```

### 2. Configurer Firebase

1. Créer un projet sur la [console Firebase](https://console.firebase.google.com) (rester sur le plan **Spark**)
2. Activer **Authentication** (Google et/ou email)
3. Créer une base **Firestore** et publier les règles de `firestore.rules`
4. Ajouter une application Web et copier la configuration
5. Copier `.env.example` vers `.env` et renseigner les valeurs :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Lancer en développement

```bash
npm run dev
```

### Build de production

```bash
npm run build
npm run preview
```

---

## ☁️ Déploiement gratuit (Cloudflare Pages)

1. Pousser le projet sur GitHub
2. Dans Cloudflare Pages : *Create a project* → connecter le dépôt
3. Paramètres de build : commande `npm run build`, dossier de sortie `dist`
4. Ajouter les variables d'environnement `VITE_FIREBASE_*`
5. Dans Firebase Auth, ajouter le domaine `*.pages.dev` (ou votre domaine) aux **domaines autorisés**

HTTPS est fourni automatiquement.

Alternatives gratuites : Netlify, Vercel (Hobby), GitHub Pages.

---

## 📲 Installer l'app

- **Android / Chrome** : menu ⋮ → *Installer l'application*
- **iOS / Safari** : Partager → *Sur l'écran d'accueil*
- **Desktop (Chrome / Edge)** : icône d'installation dans la barre d'adresse

---

## 🗺️ Roadmap

**v1.0 — MVP**
- [ ] Authentification et synchronisation multi-appareils (Firestore)
- [ ] CRUD des tâches, sous-tâches, priorités
- [ ] Vue Aujourd'hui + listes + tags
- [ ] Mode hors-ligne + installation PWA
- [ ] Thème clair/sombre

**v1.1**
- [ ] Notifications locales
- [ ] Récurrence
- [ ] Recherche et filtres enregistrés

**v1.2**
- [ ] Planning horaire (time blocking)
- [ ] Pomodoro et statistiques
- [ ] Export / import

**v1.3**
- [ ] Notifications push serveur (FCM + Cloudflare Worker)

**v2.0**
- [ ] Listes partagées
- [ ] Widgets et intégration calendrier

---

## 🔒 Confidentialité

Les données sont stockées dans votre projet Firestore personnel, rattachées à votre compte, et protégées par des règles de sécurité : chaque utilisateur n'accède qu'à ses propres données. Une copie locale est conservée dans le navigateur pour le fonctionnement hors-ligne (non chiffrée par l'application : évitez de vous connecter depuis un appareil partagé). Aucune donnée n'est partagée avec des tiers.

---

## 🤝 Contribuer

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commitez : `git commit -m "Ajoute ma fonctionnalité"`
4. Poussez et ouvrez une Pull Request

---

## 📄 Licence

MIT — libre d'utilisation et de modification.

## 🔥 Règles Firebase

### 1. Principes

- Utiliser uniquement le plan Spark ; aucun compte de facturation ne doit être lié au projet.
- Services autorisés : Firebase Authentication, Cloud Firestore et Firebase Cloud Messaging.
- Services interdits : Cloud Functions, Cloud Storage et Firebase Hosting. Le front est hébergé sur Cloudflare Pages et les notifications push passeront par un Cloudflare Worker.
- Maintenir deux projets Firebase séparés : `dayflow-dev` pour le développement, les émulateurs et les agents de code ; `dayflow-prod` pour les données réelles. Ne jamais développer contre la production.

### 2. Configuration et secrets

- Les valeurs de configuration viennent uniquement des variables `VITE_FIREBASE_*`, définies dans un fichier `.env` non versionné. Le modèle est dans `.env.example`.
- Ne coder en dur aucune clé ni aucun ID de projet.
- La clé API web Firebase n'est pas un secret : ce sont les règles de sécurité Firestore qui protègent les données.
- Ne jamais committer de fichier `.env`.

### 3. Modèle de données

- Chemins prévus : `users/{uid}/tasks`, `users/{uid}/lists`, `users/{uid}/tags` et `users/{uid}/profile`.
- Statuts de tâche : `status: "active" | "done"`. Renseigner `completedAt` à la complétion pour alimenter l'historique, et `deletedAt` à la suppression pour la corbeille de 30 jours, purgée côté client à l'ouverture de l'application.
- Ne jamais supprimer définitivement une tâche immédiatement.
- Stocker les sous-tâches, liens et rappels dans des tableaux du document de la tâche.
- Les pièces jointes sont des liens uniquement ; aucun fichier n'est stocké.

### 4. Règles de requêtes (économie de quotas)

- Toujours utiliser des requêtes ciblées avec `limit()` ; ne jamais écouter une collection entière.
- N'utiliser le temps réel que pour Aujourd'hui, En retard et À venir. Charger l'historique et la corbeille à la demande, par pages de 20 éléments.
- Les lectures servies par le cache local ne consomment pas le quota de lectures serveur.
- Éviter les écritures fréquentes sur un même document (par exemple, le minuteur Pomodoro) : écrire à la fin de la session.
- Regrouper les écritures multiples avec `writeBatch`.
- Déclarer les index composites dans `firestore.indexes.json` et versionner ce fichier.
- Ordres de grandeur actuels du quota gratuit Cloud Firestore : 50 000 lectures, 20 000 écritures et 20 000 suppressions par jour, et 1 Gio de données stockées. Les quotas peuvent évoluer ; consulter la [documentation officielle des tarifs Firestore](https://firebase.google.com/docs/firestore/pricing). Les quotas gratuits sont réinitialisés chaque jour ; les requêtes dépassant un quota sont refusées jusqu'à sa réinitialisation, au lieu d'entraîner une facturation automatique.

### 5. Hors-ligne et synchronisation

- La persistance locale est activée dans `src/lib/firebase.ts` avec `persistentLocalCache` et `persistentMultipleTabManager`.
- Les écritures hors ligne sont mises en attente et synchronisées automatiquement au retour du réseau.
- Le cache local n'est pas chiffré par l'application : déconseiller son usage sur un appareil partagé.

### 6. Authentification

- Utiliser Google et l'email/mot de passe via Firebase Auth.
- Utiliser `signInWithPopup` sur ordinateur et `signInWithRedirect` sur mobile ou dans la PWA installée.
- Attendre `onAuthStateChanged` avant d'afficher l'application et présenter un écran de chargement pendant cette attente.
- Ajouter le domaine de production (`*.pages.dev` ou le domaine personnalisé) à la liste des domaines autorisés.

### 7. Règles de sécurité Firestore

Règles actuellement présentes dans `firestore.rules` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Exemple de validation à adapter au modèle réel :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    function validTask(t) {
      return t.title is string
        && t.title.size() > 0 && t.title.size() <= 200
        && t.status in ['active', 'done']
        && t.priority in [1, 2, 3, 4];
    }

    match /users/{uid}/tasks/{taskId} {
      allow read: if isOwner(uid);
      allow create, update: if isOwner(uid) && validTask(request.resource.data);
      allow delete: if isOwner(uid);
    }

    match /users/{uid}/{document=**} {
      allow read, write: if isOwner(uid);
    }
  }
}
```

Cet exemple de validation est à adapter au modèle réel. Valider les règles avec l'outil de validation du serveur MCP Firebase s'il est disponible, puis les tester avec l'émulateur avant tout déploiement. Ne jamais utiliser `allow read, write: if true`, même temporairement. La règle générale sur `users/{uid}/{document=**}` donne aussi accès aux autres sous-collections ; pour imposer la validation à toutes les écritures de tâches, supprimer cette règle générique ou la restreindre aux autres collections afin qu'elle ne contourne pas la validation spécifique.

### 8. Développement local

- Démarrer les émulateurs Auth et Firestore avec `npm run emulators`.
- Ne jamais pointer l'environnement de développement vers les données réelles.
- Versionner `firestore.rules`, `firestore.indexes.json` et `firebase.json`.

### 9. Sauvegarde et sécurité des données

- Le plan Spark ne fournit pas de sauvegardes automatiques : l'export JSON de l'application est la sauvegarde. Recommander un export régulier.
- Activer App Check lorsque l'application sera stable.

### 10. Checklist avant chaque pull request

- [ ] Aucun service interdit utilisé (Functions, Storage, Hosting)
- [ ] Aucune clé ou aucun ID de projet codé en dur
- [ ] Requêtes avec `limit()` et index déclarés si nécessaire
- [ ] Règles de sécurité validées et testées dans l'émulateur
- [ ] Pas de suppression définitive immédiate (`deletedAt`)
- [ ] Testé hors ligne puis après le retour en ligne
- [ ] Aucun fichier `.env` ni secret dans le commit
