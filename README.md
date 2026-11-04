# 🗓️ DayFlow — Todo list PWA pour organiser ses journées

DayFlow est une **Progressive Web App** (installable, utilisable hors-ligne, synchronisée entre tous vos appareils) pour planifier, suivre et terminer ses tâches au quotidien. Pensée *mobile-first*, rapide et **100 % hébergeable gratuitement**.

---

## ✨ Périmètre produit visé

La liste ci-dessous décrit le périmètre produit souhaité, pas l'état complet de la version livrée. Pour éviter de confondre les deux, voici l'état fonctionnel actuel :

| Domaine | État livré |
|---|---|
| Authentification e-mail/mot de passe et session anonyme, tâches avec sauvegarde, complétion et corbeille | Disponible sous réserve d'activer les fournisseurs Firebase |
| Aujourd'hui, listes, étiquettes, Planning hebdomadaire et Historique | Disponible, avec limites décrites dans la feuille de route |
| Statistiques | Synthèse des tâches terminées chargées ; pas de taux global ni de temps de focus |
| Préférences, thème, export XLSX/CSV et calendrier | Disponible |
| Installation PWA et utilisation hors ligne | Disponible ; partage entrant et notifications restent à faire |
| Récurrence automatique, rappels, recherche dans descriptions/sous-tâches, vues enregistrées | À faire |
| Import XLSX, minuteur Pomodoro, collaboration et page d'accueil configurable | À faire |

Le détail des fonctionnalités prévues ci-dessous sert de cible produit. Ne pas présenter les éléments marqués « À faire » comme disponibles.

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
- 4 niveaux de priorité : 1 urgente, 2 haute, 3 normale (par défaut), 4 basse. Chaque niveau est accompagné d'un libellé et d'une icône ; la couleur n'est jamais le seul indicateur.
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
- Partage entrant (Web Share Target) : prévu, pas encore disponible

### 10. Compte et synchronisation multi-appareils
- Connexion via **Firebase Authentication** (adresse e-mail/mot de passe ou session anonyme)
- **Synchronisation en temps réel** entre téléphone, tablette et ordinateur
- Utilisation hors-ligne : les modifications sont mises en file d'attente puis synchronisées automatiquement
- Données isolées par utilisateur (règles de sécurité Firestore)
- Export XLSX et CSV des tâches ; l'import XLSX est une évolution future
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
| Hébergement du front | **Vercel Hobby** (usage personnel non commercial) et **Cloudflare Pages**, déployés en parallèle | Gratuit selon les conditions de chaque plateforme |
| Push (phase 2) | Firebase Cloud Messaging + Cloudflare Worker planifié | Gratuit |
| Dates | date-fns | Gratuit |
| Glisser-déposer | dnd-kit | Gratuit |
| Graphiques | Recharts | Gratuit |
| Tests | Vitest + Playwright | Gratuit |

### Pourquoi ces choix ?
- **Firestore** gère nativement le cache local, le mode hors-ligne et la synchro temps réel : pas besoin de code de synchronisation maison ni de Dexie.
- **Plan Spark** : aucune carte bancaire requise, jamais de facture (le service s'arrête simplement si un quota est atteint).
- **Vercel Hobby et Cloudflare Pages** : le même dépôt est déployé comme site statique sur les deux plateformes, en HTTPS (nécessaire aux Service Workers et notifications). Vercel Hobby est réservé à l'usage personnel non commercial.

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
├── tags/{tagId}       # name, color, order, createdAt, updatedAt
└── tasks/{taskId}
    ├── title, description, status
    ├── priority, dueDate, startTime, estimatedMinutes
    ├── listId, tags[], links[]
    ├── subtasks[]     # { id, title, done }
    ├── recurrence     # { type, interval, days[] }
    ├── reminders[]    # { at, sent }
    └── createdAt, updatedAt, deletedAt
```

La priorité `priority` est un entier : `1` = urgente, `2` = haute, `3` = normale (valeur par défaut) et `4` = basse. L'interface associe à chaque niveau un libellé et une icône, sans s'appuyer sur la couleur seule.

### Règles de sécurité (extrait)

Les règles complètes et normatives sont dans `firestore.rules` : elles valident chaque schéma et réservent l'accès au propriétaire. Ne pas remplacer ces règles par une autorisation générique sur toutes les sous-collections.

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

Variables obligatoires : `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` et `VITE_FIREBASE_APP_ID`. `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` et `VITE_FIREBASE_MEASUREMENT_ID` sont optionnelles : le code actuel ne les utilise pas.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
# Optionnelles
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### 3. Lancer en développement

```bash
npm run dev
```

Le service worker est désactivé par défaut en développement et les fichiers des routes ne sont alors pas mis en cache. Pour tester réellement le hors-ligne, construisez puis servez la version compilée avec `npm run build && npm run preview`. En développement, définissez plutôt `VITE_ENABLE_SW_DEV=true` dans `.env.local`, puis redémarrez Vite pour tester le service worker ; les données personnelles ne sont jamais précachées. Gardez cette valeur à `false` ou retirez-la pour le développement courant.

### Build de production

```bash
npm run build
npm run preview
```

---

## ☁️ Déploiement statique (Vercel + Cloudflare Pages)

Le dépôt est prévu pour être déployé en parallèle sur Vercel Hobby (usage personnel non commercial) et Cloudflare Pages. Les deux utilisent Node 24.20.0, `npm run build` et `dist`, avec leurs règles de repli SPA et de revalidation. Suivre [docs/DEPLOY.md](docs/DEPLOY.md) pour importer le dépôt, configurer les variables Firebase, les domaines OAuth, les règles/index et tester l'installation mobile. Aucun déploiement n'est déclenché par le build local.

---

## 📲 Installer l'app

- **Android / Chrome** : menu ⋮ → *Installer l'application*
- **iOS / Safari** : Partager → *Sur l'écran d'accueil*
- **Desktop (Chrome / Edge)** : icône d'installation dans la barre d'adresse

---

## 🗺️ Roadmap

`[x]` livré · `[~]` partiel · `[ ]` à faire

**v1.0 — MVP**
- [x] Authentification et synchronisation multi-appareils
- [x] CRUD des tâches, sous-tâches et priorités
- [x] Vue Aujourd'hui, listes et étiquettes
- [x] Mode hors-ligne et installation PWA
- [x] Thème clair/sombre

**v1.1**
- [ ] Notifications locales
- [ ] Récurrence
- [~] Recherche par titre et filtres simples ; recherche avancée et filtres enregistrés à faire

**v1.2**
- [x] Planning horaire avec déplacement des tâches
- [~] Statistiques de base ; Pomodoro et suivi de temps à faire
- [x] Export XLSX/CSV et calendrier ; import XLSX à faire

**v1.3**
- [ ] Notifications push serveur (FCM + Cloudflare Worker)

**v2.0**
- [ ] Listes partagées
- [ ] Widgets et intégration calendrier

---

## 🔒 Confidentialité

Les données sont stockées dans votre projet Firebase (Authentication et Firestore), rattachées à votre compte et protégées par des règles de sécurité : chaque utilisateur n'accède qu'à ses propres données. Une copie locale est conservée dans le navigateur pour le fonctionnement hors-ligne (non chiffrée par l'application : évitez de vous connecter depuis un appareil partagé). DayFlow n'initialise pas Firebase Analytics et n'envoie pas d'événements de mesure d'audience. Firebase traite les données nécessaires à l'authentification et au stockage ; aucune télémétrie analytique propre à l'application n'est activée.

Les deux hébergeurs appliquent des en-têtes de sécurité depuis `vercel.json` et `public/_headers`. Après toute modification de `firestore.rules`, exécutez `npm run test:rules` uniquement sur l'émulateur local. Les exigences de divulgation et le périmètre figurent dans [SECURITY.md](SECURITY.md) ; le rapport détaillé est dans [docs/SECURITY.md](docs/SECURITY.md).

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

- Rester sur le plan Spark et ne lier aucun compte de facturation.
- Services autorisés : Firebase Authentication, Cloud Firestore et Firebase Cloud Messaging.
- Services interdits : Cloud Functions, Cloud Storage et Firebase Hosting. Le front est hébergé sur Cloudflare Pages ; les notifications push passeront par un Cloudflare Worker.
- Utiliser deux projets séparés : `dayflow-dev` pour le développement et les émulateurs, `dayflow-prod` pour les données réelles. Ne jamais développer contre la production.

### 2. Configuration et secrets

- Les valeurs viennent uniquement des variables `VITE_FIREBASE_*` d'un fichier `.env` non versionné ; `.env.example` en est le modèle. `VITE_USE_EMULATORS=true` active les émulateurs uniquement en mode développement.
- Ne coder en dur aucune clé ni aucun ID de projet.
- La clé API web Firebase n'est pas un secret : ce sont les règles de sécurité Firestore qui protègent les données.
- Ne jamais committer de fichier `.env`.

### 3. Modèle de données

- Chemins : `users/{uid}/tasks/{taskId}`, `users/{uid}/lists/{listId}`, `users/{uid}/tags/{tagId}` et `users/{uid}/profile/preferences`. Firestore impose un chemin de document avec un nombre pair de segments : le document de préférences est nommé `preferences` dans la sous-collection `profile`.
- Une tâche contient notamment `title`, `status`, `priority` (`1` à `4`), `dueDate`, `completedAt`, `deletedAt`, `listId`, `tags`, `links`, `subtasks`, `recurrence`, `reminders`, `createdAt` et `updatedAt`.
- Statuts de tâche : `status: "active" | "done"`. Renseigner `completedAt` à la complétion pour alimenter l'historique, et `deletedAt` à la suppression pour la corbeille de 30 jours, purgée côté client à l'ouverture de l'application.
- Ne jamais supprimer définitivement une tâche immédiatement.
- Stocker sous-tâches, liens et rappels dans des tableaux du document de la tâche. Les limites de règles sont respectivement 50 sous-tâches, 20 tags, 20 liens et 10 rappels par tâche.
- Les pièces jointes sont des liens uniquement ; aucun fichier n'est stocké.

### 4. Règles de requêtes (économie de quotas)

- Toujours utiliser des requêtes ciblées avec `limit()` ; ne jamais écouter une collection entière.
- N'utiliser le temps réel que pour Aujourd'hui, En retard et À venir. Charger l'historique et la corbeille à la demande, par pages de 20 éléments.
- Les lectures servies par le cache local ne consomment pas le quota de lectures serveur.
- Éviter les écritures fréquentes sur un même document (par exemple, le minuteur Pomodoro) : écrire à la fin de la session.
- Regrouper les écritures multiples avec `writeBatch`.
- Déclarer les index composites dans `firestore.indexes.json` et versionner ce fichier.
- Ordres de grandeur du plan Spark à revérifier sur la [documentation officielle des tarifs Firestore](https://firebase.google.com/docs/firestore/pricing) : environ 50 000 lectures et 20 000 écritures par jour et 1 Gio de stockage. Ces quotas évoluent ; au-delà, le service est suspendu jusqu'à la réinitialisation au lieu de facturer.

### 5. Hors-ligne et synchronisation

- La persistance locale est activée dans `src/lib/firebase.ts` avec `persistentLocalCache` et `persistentMultipleTabManager`.
- Les écritures hors ligne sont mises en attente et synchronisées automatiquement au retour du réseau.
- Le cache local n'est pas chiffré par l'application : déconseiller son usage sur un appareil partagé.

### 6. Authentification

- Utiliser Google et l'email/mot de passe via Firebase Auth.
- Utiliser `signInWithPopup` sur ordinateur et `signInWithRedirect` sur mobile ou dans la PWA installée.
- Écouter `onAuthStateChanged` sans bloquer l'interface : l'application s'ouvre en mode invité et demande l'authentification uniquement avant la création d'une tâche.
- Ajouter le domaine de production (`*.pages.dev` ou le domaine personnalisé) à la liste des domaines autorisés.
- **Attention à Google sur Cloudflare Pages :** `signInWithRedirect` peut échouer sur les navigateurs qui bloquent le stockage tiers lorsque l'application n'est pas hébergée sur Firebase Hosting. Tester ce parcours au premier déploiement Cloudflare Pages. Solutions possibles : utiliser la popup, configurer un proxy `/__/auth`, ou proposer la connexion par e-mail comme solution de secours.

### 7. Règles de sécurité Firestore

Les règles normatives sont dans [`firestore.rules`](firestore.rules). Elles limitent les chemins au propriétaire, valident les champs et horodatages, bornent les requêtes de liste à 500 documents et refusent l’accès sans règle correspondante. Les limites des champs imbriqués sont décrites dans [docs/SECURITY.md](docs/SECURITY.md).

Après toute modification, exécuter `npm run test:rules` sur l’émulateur local et valider le fichier avec le validateur MCP Firebase. Ne jamais viser un projet réel pendant les tests ni utiliser `allow read, write: if true`.

### 8. Développement local

- Démarrer les émulateurs Auth et Firestore avec `npm run emulators` ; exécuter les tests de règles seuls avec `npm run test:rules`.
- `npm run test:rules` et `npm run test:integration` réutilisent les émulateurs déjà actifs ; sinon, ils démarrent uniquement les émulateurs nécessaires.
- Les ports, définis dans `firebase.json` et utilisés par le client, sont Auth `9099`, Firestore `18080` et WebSocket Firestore `19150`. Les scripts npm s'appuient sur cette configuration.
- Ne jamais pointer l'environnement de développement vers les données réelles.
- Versionner `firestore.rules`, `firestore.indexes.json` et `firebase.json`.

### 9. Sauvegarde et sécurité des données

- Le plan Spark ne fournit pas de sauvegardes automatiques : l'export XLSX de l'application est la sauvegarde. Il n'est pas encore réimportable ; l'import XLSX est une évolution future. Recommander un export régulier.
- Activer App Check lorsque l'application sera stable.

### 10. Checklist avant chaque pull request

- [ ] Aucun service interdit utilisé (Functions, Storage, Hosting)
- [ ] Aucune clé ou aucun ID de projet codé en dur
- [ ] Requêtes avec `limit()` et index déclarés si nécessaire
- [ ] Règles de sécurité validées et testées dans l'émulateur
- [ ] Pas de suppression définitive immédiate (`deletedAt`)
- [ ] Testé hors ligne puis après le retour en ligne
- [ ] Aucun fichier `.env` ni secret dans le commit
