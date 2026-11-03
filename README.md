# 🗓️ DayFlow — Todo list PWA pour organiser ses journées

DayFlow est une **Progressive Web App** (installable, utilisable hors-ligne) pour planifier, suivre et terminer ses tâches au quotidien. Pensée *mobile-first*, rapide et sans friction.

---

## ✨ Fonctionnalités

### 1. Gestion des tâches
- Créer, modifier, dupliquer et supprimer une tâche
- Ajout rapide (une seule ligne de saisie) + formulaire détaillé
- Marquer comme terminée / rouvrir (avec animation et possibilité d'annuler)
- Description longue avec support Markdown simple (gras, listes, liens)
- **Sous-tâches** (checklist) avec barre de progression
- Notes et pièces jointes légères (liens, images)
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
- Notifications push natives (même application fermée)
- Résumé du matin : « Voici vos tâches du jour »
- Rappel de fin de journée pour la revue du soir
- Mode « Ne pas déranger » et report de rappel (snooze)

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
- ✅ **Fonctionne 100 % hors-ligne** (Service Worker + cache)
- ✅ Synchronisation automatique au retour de la connexion
- ✅ Chargement instantané (App Shell)
- ✅ Mises à jour silencieuses avec bannière « Nouvelle version disponible »
- ✅ Raccourcis d'application (Ajouter une tâche, Aujourd'hui)
- ✅ Partage vers l'app (Web Share Target) : envoyer un texte ou un lien pour créer une tâche

### 10. Données et synchronisation
- Stockage local (IndexedDB) — vos données restent sur votre appareil par défaut
- Synchronisation multi-appareils optionnelle (compte + cloud)
- Export / import : JSON, CSV
- Sauvegarde et restauration manuelle
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

## 🧱 Stack technique suggérée

| Besoin | Option recommandée |
|---|---|
| Framework | React + Vite (ou Vue / Svelte) |
| Langage | TypeScript |
| Styles | Tailwind CSS |
| État | Zustand (ou Pinia / Svelte stores) |
| Stockage local | IndexedDB via Dexie.js |
| PWA | `vite-plugin-pwa` (Workbox) |
| Notifications | Web Push API + Notifications API |
| Dates | date-fns |
| Glisser-déposer | dnd-kit |
| Graphiques | Recharts / Chart.js |
| Tests | Vitest + Playwright |
| Sync (optionnel) | Supabase / Firebase / backend custom |

---

## 📁 Structure du projet

```
dayflow/
├── public/
│   ├── icons/              # Icônes PWA (192, 512, maskable)
│   └── manifest.webmanifest
├── src/
│   ├── components/         # Composants UI
│   ├── features/
│   │   ├── tasks/
│   │   ├── planner/
│   │   ├── lists/
│   │   ├── reminders/
│   │   ├── focus/
│   │   └── stats/
│   ├── db/                 # Schéma IndexedDB
│   ├── hooks/
│   ├── lib/                # Utilitaires (dates, récurrence…)
│   ├── sw.ts               # Service Worker
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

---

## 🚀 Installation

```bash
git clone https://github.com/votre-compte/dayflow.git
cd dayflow
npm install
npm run dev
```

### Build de production

```bash
npm run build
npm run preview
```

### Déploiement
L'app est statique : déployable sur Vercel, Netlify, Cloudflare Pages ou GitHub Pages. **HTTPS obligatoire** pour le Service Worker et les notifications.

---

## 📲 Installer l'app

- **Android / Chrome** : menu ⋮ → *Installer l'application*
- **iOS / Safari** : Partager → *Sur l'écran d'accueil*
- **Desktop (Chrome / Edge)** : icône d'installation dans la barre d'adresse

---

## 🗺️ Roadmap

**v1.0 — MVP**
- [ ] CRUD des tâches, sous-tâches, priorités
- [ ] Vue Aujourd'hui + listes + tags
- [ ] Mode hors-ligne + installation PWA
- [ ] Thème clair/sombre

**v1.1**
- [ ] Rappels et notifications push
- [ ] Récurrence
- [ ] Recherche et filtres enregistrés

**v1.2**
- [ ] Planning horaire (time blocking)
- [ ] Pomodoro et statistiques
- [ ] Export / import

**v2.0**
- [ ] Synchronisation multi-appareils
- [ ] Listes partagées
- [ ] Widgets et intégration calendrier

---

## 🔒 Confidentialité

Par défaut, toutes les données sont stockées **localement sur votre appareil**. Aucune donnée n'est envoyée sans activation explicite de la synchronisation.

---

## 🤝 Contribuer

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commitez : `git commit -m "Ajoute ma fonctionnalité"`
4. Poussez et ouvrez une Pull Request

---

## 📄 Licence

MIT — libre d'utilisation et de modification.
