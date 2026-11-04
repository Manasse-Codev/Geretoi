# Déploiement statique

DayFlow se construit comme application Vite statique (`npm run build`, sortie `dist/`). Le même dépôt peut être relié simultanément à Vercel et Cloudflare Pages. Ce guide ne déploie rien.

## Configuration commune

- Version Node : 24.20.0 (`.nvmrc` et `engines` dans `package.json`). Sélectionner cette version dans les deux projets.
- Commande de build : `npm run build`. Répertoire de sortie : `dist`.
- Définir toutes les variables de build `VITE_FIREBASE_*` de `.env.example` : `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` et `VITE_FIREBASE_MEASUREMENT_ID`. `VITE_FIREBASE_AUTH_DOMAIN` reste configurable séparément sur chaque plateforme. Ces valeurs sont intégrées au bundle public : ne pas y mettre de secret.
- En production, les émulateurs ne sont jamais utilisés, même avec `VITE_USE_EMULATORS=true`. Si une variable requise manque, l'application affiche les seuls noms des variables à configurer.
- Vercel lit `vercel.json` et ignore `public/_redirects`/`public/_headers`. Cloudflare Pages lit les deux fichiers dans `public/` et ignore `vercel.json`. Les fichiers statiques existants gardent la priorité sur le repli SPA afin que `sw.js`, le manifeste et les icônes restent de vrais fichiers.
- Le Workbox `navigateFallback: '/index.html'` dans `vite.config.ts` couvre la navigation hors ligne. `index.html`, `sw.js`, les scripts Workbox et `manifest.webmanifest` ont une politique `max-age=0, must-revalidate` sur chaque hôte : le HTML et le worker sont revalidés et la bannière de nouvelle version peut détecter les mises à jour. Les ressources fingerprintées peuvent être mises en cache par URL.
- Le test hors-ligne doit se faire sur le build compilé (`npm run build`, puis `npm run preview`) afin de vérifier le précache des routes différées. En développement, les fichiers de route ne sont pas précachés ; utilisez `VITE_ENABLE_SW_DEV=true` uniquement pour tester explicitement l'enregistrement du service worker. Le précache ne contient que les fichiers statiques de l'application, jamais les données authentifiées ou personnelles.

## Vercel

1. Importer le dépôt Git dans Vercel, dossier racine du projet.
2. Sélectionner Vite/Other : build `npm run build`, sortie `dist`, Node 24.20.0.
3. Définir les variables `VITE_FIREBASE_*` communes dans Production, Preview et Development selon besoin ; reconstruire après une modification.
4. Ajouter le domaine Vercel et tout domaine personnalisé dans Firebase Authentication → Paramètres → Domaines autorisés.
5. Depuis un environnement Firebase CLI authentifié et vérifié, publier règles et index : `firebase deploy --only firestore:rules,firestore:indexes`. Cela ne déploie que la configuration Firestore, pas le front.
6. Suivre la checklist téléphone ci-dessous.

Si Google échoue lors de la redirection à cause du stockage tiers, une variante facultative consiste à placer cette réécriture avant le repli SPA dans `vercel.json` :

```json
{ "source": "/__/auth/:path*", "destination": "https://<projet>.firebaseapp.com/__/auth/:path*" }
```

Elle n'est pas activée par défaut. Ajouter alors `https://<domaine>/__/auth/handler` aux URI de redirection autorisés du client OAuth Google et `<domaine>` aux domaines autorisés Firebase Authentication.

## Cloudflare Pages

1. Ouvrir Workers & Pages → Create → Pages → Connect to Git et importer le même dépôt.
2. Utiliser le preset Vite ou les valeurs personnalisées : build `npm run build`, répertoire `dist`, Node 24.20.0.
3. Définir les variables `VITE_FIREBASE_*` communes dans Production et Preview selon besoin ; reconstruire après une modification.
4. Ajouter le domaine `*.pages.dev` concerné et tout domaine personnalisé dans Firebase Authentication → Paramètres → Domaines autorisés.
5. Depuis un environnement Firebase CLI authentifié et vérifié, publier règles et index : `firebase deploy --only firestore:rules,firestore:indexes`. Cela ne déploie que la configuration Firestore, pas le front.
6. Suivre la checklist téléphone ci-dessous.

Si Google échoue lors de la redirection à cause du stockage tiers, une Pages Function ou un Worker peut relayer `/__/auth/*` vers `https://<projet>.firebaseapp.com/__/auth/*`. `_redirects` ne prend pas en charge une destination absolue ; le proxy n'est pas fourni ni activé par défaut. Ajouter alors `https://<domaine>/__/auth/handler` aux URI de redirection autorisés du client OAuth Google et `<domaine>` aux domaines autorisés Firebase Authentication.

## Vérification sur téléphone

- Ouvrir chaque déploiement dans le navigateur, installer/ajouter DayFlow à l'écran d'accueil et vérifier l'icône et le mode autonome.
- Actualiser une route profonde telle que `/history` dans le navigateur et dans l'app installée.
- Activer le mode avion, vérifier le démarrage et les données locales, créer/modifier une tâche, rétablir le réseau et vérifier la synchronisation.
- Tester la connexion e-mail puis Google dans le navigateur et dans l'app installée.
- Après un nouveau build, vérifier l'apparition de la bannière « Nouvelle version » et le chargement de la version mise à jour.

## Deux plateformes, deux applications pour le navigateur

Les domaines Vercel et Cloudflare sont deux origines distinctes : stockage local, service worker, cache Firestore, préférences et installations ne sont pas partagés. Pour comparer les versions, installer une seule à la fois sur le téléphone (désinstaller l'autre) ou effacer les données de site avant de tester l'autre domaine.
