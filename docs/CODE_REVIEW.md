# Revue de code DayFlow

Revue statique du dépôt sur `audit-securite`. Les lignes désignent les zones relevées avant les corrections de cet audit. Effort : faible (≤ 1 h), moyen (quelques heures), élevé (refonte/migration).

| ID | Gravité | Effort | Fichier / zone | Constat et recommandation |
|---|---|---:|---|---|
| REV-01 | Élevée | Élevé | `src/lib/firestore.ts`, `src/features/auth/authService.ts` | Cache IndexedDB Firestore persistant, risque de fuite entre sessions sur appareil partagé. Corrigé : déconnexion attend les écritures, bloque si elles restent en attente, termine Firestore, purge IndexedDB et recharge ; tests E2E passés avant la dernière fermeture des émulateurs. |
| REV-02 | Moyenne | Moyen | `src/features/tasks/taskRepository.ts`, `src/features/stats` | Les statistiques utilisent des lectures paginées bornées et le total client est exact ; certains chargements n’annulent pas les requêtes précédentes. Un changement rapide de période pourrait encore afficher un état ancien. Ajouter une génération de requête et mesurer l’usage quota. |
| REV-03 | Moyenne | Moyen | `src/features/tasks/taskConverter.ts` | Plusieurs assertions `as` et conversions permissives masquent des données invalides ; le converter nettoie certains tableaux mais ne valide pas toutes les valeurs. Remplacer les assertions par parseurs typés réutilisables et tests de corruption. |
| REV-04 | Moyenne | Faible | `src/features/settings/exportData.ts` | Corrigé : CRLF, CR et LF sont échappés dans les propriétés ICS. Les dates sont sérialisées en UTC tandis que le planning est local ; couverture DST/événements toute la journée à compléter. |
| REV-05 | Moyenne | Faible | `src/features/auth/AuthProvider.tsx` | Corrigé : les erreurs de purge sont maintenant journalisées uniquement en développement, sans détails SDK côté production. |
| REV-06 | Moyenne | Élevé | `src/features/settings/SettingsPage.tsx:102-104`, `src/app/router.tsx:50` | La route directe `/settings/delete-account` redirige vers les réglages ; aucune suppression Auth + Firestore n’existe. Le lien n’est pas affiché dans l’interface. Décision produit et parcours résilient à définir avant ajout : réauthentifier, purger les documents par lots, supprimer Auth en dernier et traiter les échecs partiels. |
| REV-07 | Faible | Faible | `src/features/settings/SettingsPage.tsx:61-67` | Valeurs de segmented control castées via `as` ; les valeurs d’options sont locales et contrôlées, mais une modification future peut introduire une valeur hors union. Modéliser les options avec `satisfies`. |
| REV-08 | Faible | Moyen | `src/features/tasks/taskConverter.ts`, composants | Recherche de `any` explicite, appels dangereux HTML et eval : aucun `any` apparemment central, aucun sink HTML trouvé. Quelques assertions `as` persistent ; rendre ESLint plus strict sur assertions inutiles. |
| REV-09 | Faible | Moyen | `src/features/*/use*.ts`, composants | Les abonnements partagés ont un mécanisme de désabonnement (`sharedSubscription`) et les effets principaux nettoient leurs écouteurs. À vérifier par tests de démontage et changement rapide d’UID sur toutes les pages ; risque de données obsolètes si callback déjà en vol. |
| REV-10 | Faible | Moyen | `src/styles/app.css`, `src/styles/globals.css` | Feuilles CSS volumineuses, valeurs de taille et ombres parfois littérales ; la documentation DESIGN note déjà des écarts d’espacement du shell. Extraire les valeurs répétées vers tokens, mais sans refonte globale hors scope sécurité. |
| REV-11 | Faible | Faible | `package.json`, config ESLint | `eslint-plugin-react-hooks` présent ; règles sécurité dédiées, formateur imposé et CI absents. Ajouter une politique ESLint ciblée après vérification de compatibilité, Dependabot/CI. |
| REV-12 | Information | Moyen | `src/features/settings/exportData.ts` | Export paginé par lot de 100 et CSV/XLSX neutralisés ; l’export charge les tâches, listes et tags en parallèle, ce qui peut consommer le quota pour un compte volumineux. Conserver pagination/annulation et afficher une progression claire. |
| REV-13 | Information | Faible | `src/app/router.tsx` | Routes de pages chargées avec `lazy`; galerie `/design` incluse conditionnellement en développement seulement. Vérifier le bundle de production à chaque release. |
| REV-14 | Information | Moyen | Tests Vitest/Playwright | Couverture utile conversions, exports, règles et flux essentiels ; la connexion Google réelle et l’E2E complet sous CSP restent non vérifiés. Les émulateurs de cette dernière vérification sont bloqués par Java 17 ; aucun test n’a été supprimé ou assoupli. Ajouter des cas Auth réel contrôlés seulement sur environnement de test. |
| REV-15 | Information | Faible | `src/i18n/fr.ts` et composants | Plusieurs libellés sont centralisés, mais l’inspection complète des chaînes de toutes les pages n’a pas été exhaustive. Recherche ciblée des chaînes JSX avant toute modification d’interface. |

## Architecture et qualité observées

- React/Vite avec routeur, pages lazy, contexte Auth, fonctionnalités sous `src/features`, accès Firestore par repositories et converters.
- Couplage repository tâche → sync metadata importé par listes/tags, ce qui crée une dépendance transversale ; déplacer le type partagé vers `src/lib`/types dédiés.
- Aucune preuve statique d’un code mort généralisé ; modules README par fonctionnalité décrivent le périmètre, mais une analyse de bundle est requise pour conclure.
- TypeScript strict est activé dans la configuration ; les assertions de converters méritent durcissement.
- Gestion d’erreurs Auth et données traduite en messages français ; console de purge en production est l’écart confirmé.
- Les requêtes de tâches, listes et tags sont bornées côté application ; historique et corbeille paginent ; certaines requêtes de stats et exports sont plus coûteuses.
- L’accessibilité a des tests de contraste et composants de base accessibles ; revue complète clavier, focus, labels, taille des cibles et ordre de tabulation nécessite un audit navigateur de tous les écrans.
- Le calendrier calcule des heures locales et sérialise UTC ; changements d’heure et fuseaux sont un risque à traiter par tests dédiés.

## Priorité de correction

1. SEC-02 : renforcer validation des éléments imbriqués et enums dans les règles.
2. REV-02/03 : annuler les requêtes obsolètes et réduire les assertions de converters.
3. REV-06 : définir un parcours de suppression du compte avant de l’implémenter.
4. SEC-12 : remplacer ou isoler le moteur XLSX vulnérable/non compatible `eval` CSP.
5. CI, audit dépendances/signatures et revue accessibilité complète.
