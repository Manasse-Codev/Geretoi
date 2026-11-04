# Référence visuelle DayFlow

Cette synthèse s'appuie sur le projet Stitch `9947037683620601025`, le `designMd` du design system « DayFlow », les captures et le HTML des maquettes mobiles clair/sombre, ainsi que l'écran « Spécification Motion Design DayFlow ». Les écrans Stitch sont une référence visuelle : leurs exemples de données, leurs comportements et leur HTML ne sont pas à reprendre tels quels.

## Écrans examinés

| Écran | Variante claire | Variante sombre |
|---|---|---|
| Aujourd'hui | `f8e4036512a947fa8afe9abc902b2190` | `4d7e3832549c452287bfd71ffdf39596` |
| Nouvelle tâche | `70a3f7e42dcc458fb2940efd83536046` | `233b329a78584d5b89776a3e4d318036` |
| Réglages | `b7f550d8f4b240cfbff2708b99ec704b` | `4f7ed889f46d48fb97ea3795f243b14b` |
| Historique | `a7d2fa6ac0fd466cb2b0f982ed24d06c` | `52f93d4b2bf941acb1c811f3526f6efa` |

Un document de design est disponible dans Stitch sous `designMd` ; il n'y a pas de fichier `DESIGN.md` distinct à télécharger dans le projet. La spécification motion est fournie comme écran Stitch et son code a été consulté.

## Palette

| Rôle | Clair | Sombre |
|---|---|---|
| Fond / surface | `#E9EAF0` | `#25262E` |
| Carte | `#F4F5F9` | `#2B2C35` |
| Texte principal | `#2B2B3A` | `#F2F2F7` |
| Texte secondaire | `#5F6070` | `#A6A7B8` |
| Accent violet | `#5A5AB8` | `#A5A5F5` |
| Accent orange | `#C2410C` | `#FF8A5B` |

Les accents servent à distinguer les actions, priorités et états, avec icône et libellé lorsque l'information est fonctionnelle. Les surfaces restent monochromes ; l'élévation vient de doubles ombres et de légers contours.

### Écarts avec `src/styles/tokens.css`

- Avant cette mise à jour, le token `--color-card` n'était pas redéfini en thème sombre. Cet écart est résolu : il vaut désormais `#2B2C35`.
- La prose du `designMd` Stitch et les captures suivent la palette ci-dessus, mais sa palette sémantique générée au début du document indique aussi `#f8f9ff` pour la surface, `#191c20` pour le texte, `#42419e` pour le violet et `#ac3400` pour l'orange. Cette variante n'est pas alignée sur les captures ni les tokens du dépôt ; conserver ces derniers comme référence de ce projet et ne pas mélanger les deux jeux de valeurs.
- Le token orange clair `#C2410C` sur le fond `#E9EAF0` a un contraste d'environ **4,31:1** : il passe le seuil graphique de 3:1, mais pas le seuil texte de 4,5:1. Le réserver aux icônes/repères graphiques ou aux fonds de boutons avec texte blanc (environ 5,18:1) ; pour du texte orange posé sur le fond, choisir une teinte plus sombre ou le texte principal.
- Le texte blanc sur l'orange sombre `#FF8A5B` donne environ **2,32:1**, insuffisant même pour un élément graphique. Dans les CTA sombres, utiliser plutôt le texte et les pictogrammes `#25262E` sur cet orange (environ 6,48:1), ou assombrir le fond du CTA.
- Les couleurs de carte et de fond sont volontairement proches et leurs ombres sont subtiles. Une ombre ou une différence de surface ne suffit pas à signaler un contrôle : conserver un libellé et une icône, et ajouter un contour/focus visible lorsque nécessaire.

### Décisions appliquées aux tokens

- **Retenu** : `#2B2C35` de Stitch comme surface de carte sombre ; sa faible différence de luminance avec le fond ne sert pas de bordure ou d'indicateur à elle seule.
- **Rejeté** : la palette sémantique générée (`#f8f9ff`, `#191c20`, `#42419e`, `#ac3400`), qui ne correspond pas à la palette narrative ni aux tokens déposés.
- **Retenu** : `#B83B0B` comme `--color-orange-text` clair ; contraste calculé **4,77:1** sur `#E9EAF0`. `#C2410C` reste réservé aux formes, icônes et fonds de CTA avec texte blanc.
- **Retenu** : premier plan `#1A1A24` sur les accents orange et violet sombres ; contrastes calculés **7,43:1** sur `#FF8A5B` et **7,64:1** sur `#A5A5F5`.
- **Retenu** : contours `#838491` en clair et `#767785` en sombre ; ils dépassent 3:1 sur les surfaces de fond et de carte, afin que chaque relief ait une bordure perceptible.
- **Retenu** : les doubles ombres Stitch et les rayons 24 px/pilule. L'inset Stitch à 3 px / 6 px est rejeté au profit du token du dépôt à 6 px / 12 px.
- **Retenu** : les tokens de mouvement du dépôt (120/240/400 ms, courbe souple) et un token pression dédié. Les 800 ms du ProgressRing de Stitch sont étendus aux anneaux et barres seulement, via `stroke-dashoffset` et `transform: scaleX`.
- **Rejeté** : toute interpolation de `box-shadow` de Stitch. Les couches relief/creux se fondent par opacité en 120 ms ; l'état appuyé ajoute `scale(0.98)`.
- **Rejeté** : les cibles visuelles Stitch sous 44 px. Les dessins restent compacts et leur boîte interactive fait au moins 44 × 44 px, sans empiéter sur une cible voisine.

### Ratios des tokens définitifs

| Paire vérifiée | Clair | Sombre | Seuil |
|---|---:|---:|---:|
| Texte principal / fond | 11,59:1 | 13,49:1 | 4,5:1 |
| Texte secondaire / fond | 5,15:1 | 6,34:1 | 4,5:1 |
| Texte sur violet (blanc en clair, `#1A1A24` en sombre) | 5,85:1 | 7,64:1 | 4,5:1 |
| Texte sur orange (blanc en clair, `#1A1A24` en sombre) | 5,18:1 | 7,43:1 | 4,5:1 |
| Violet / fond (élément graphique) | 4,87:1 | 6,67:1 | 3:1 |
| Orange / fond (élément graphique) | 4,31:1 | 6,48:1 | 3:1 |
| Texte orange dédié / fond | 4,77:1 (`#B83B0B`) | 6,48:1 (`#FF8A5B`) | 4,5:1 |
| Contour / fond | 3,08:1 (`#838491`) | 3,25:1 (`#767785`) | 3:1 |
| Contour / carte | 3,40:1 (`#838491`) | 3,14:1 (`#767785`) | 3:1 |

## Typographie

Inter est la police de tous les niveaux, avec repli sur les polices système. Échelle Stitch :

- Titre principal : 28 px, graisse 700, interligne 34 px.
- Titre de section : 20 px, graisse 600, interligne 26 px.
- Sous-titre : 17 px, graisse 600, interligne 22 px.
- Texte courant : 17/24 px ; variante compacte 15/20 px.
- Métadonnées : 13/18 px ; petits libellés 11/14 px, à éviter pour les informations essentielles.

### Échelle responsive finale

La valeur par défaut est **Confortable**. Entre 360 et 430 px, les valeurs mobiles utilisent `clamp()` et des unités `rem`; à partir de 768 px, les valeurs de la référence desktop restent inchangées. Le mode **Compact** resserre les espacements d'environ 8 % sans réduire les textes sous les seuils WCAG ni les cibles tactiles de 44 px.

| Élément | Mobile confortable (360–430 px) | Mobile compacte | Tablette / desktop (≥768 px) |
|---|---:|---:|---:|
| Titre d'écran | `clamp(1.75rem, 7.2vw, 1.875rem)` | identique | `2.25rem` |
| Titre « Aujourd'hui » | `clamp(1.75rem, 7.2vw, 1.875rem)` | identique | `3rem` |
| Titre de section | `clamp(1.125rem, 4.7vw, 1.25rem)` | identique | `1.25rem` |
| Titre de tâche | `clamp(1rem, 4.1vw, 1.0625rem)` | identique | `1.08rem` |
| Texte courant | `clamp(.9375rem, 3.9vw, 1rem)` | identique | `1rem` |
| Métadonnées | `clamp(.8125rem, 3.2vw, .875rem)` | identique | `.8125rem` |
| Marge latérale | `1rem` | identique | `1.25rem` |
| Espacement entre cartes | `.625rem` | `.5625rem` | `.875rem` |
| Padding de carte | `.8125–.875rem` | `.75–.8125rem` | `1rem` |
| Bannière Top 3 / anneau | padding `.8125–.875rem` / `4.125–4.375rem` | idem | `4.875rem` |
| Barre basse | `4rem` | `4rem` | `4rem` |
| Bouton « + » / zone tactile | `3.5rem` / `3.5rem` | idem | `4rem` |
| Icônes de navigation | `1.25–1.375rem` | idem | `1.25rem` |
| Rayon des cartes | `1.25rem` | idem | `1.5rem` |
| Puces et champs | `2.75rem` / `3rem` | idem | `2.75rem` / `3rem` |

Le padding inférieur du shell reste réservé à la navigation fixe et à la zone sûre (`env(safe-area-inset-bottom)`), afin qu'aucun contenu ne passe dessous. Le viewport conserve le zoom utilisateur et ne définit ni `maximum-scale`, ni `user-scalable=no`.

## Formes, ombres et espacements

- Cartes principales et modales : rayon 24 px ; certaines lignes d'historique sont plus compactes (20 px). Boutons, filtres et puces : pilule. Les contrôles secondaires utilisent ponctuellement 12 ou 16 px.
- Ombre claire en relief : `-6px -6px 12px #FFFFFF, 6px 6px 12px #C9CAD6`.
- Ombre sombre en relief : `-6px -6px 12px #30313B, 6px 6px 12px #1A1B21`.
- Stitch décrit l'ombre en creux avec `inset -3px -3px 6px` et `inset 3px 3px 6px` (teintes identiques aux ombres de relief). Cet écart est conservé en faveur de la source de vérité du dépôt : `6px / 12px`.
- Le rythme est basé sur 8 px, avec demi-pas de 4 px ; marges d'écran 20 px, gouttières 16 px, écarts courants 8/16/24/32 px et réserve basse de 96 px pour la navigation flottante.
- `--space-unit: 8px` correspond au rythme Stitch, mais les marges et paliers détaillés ne sont pas encore déclarés comme tokens. Le shell actuel utilise aussi 24 px de marge et 112 px en bas, au lieu des 20/96 px de la référence.
- La navigation flottante est un dock d'environ 64 px de haut, à 16 px du bas ; le bouton principal d'ajout est circulaire et fait 56 px.

## Mouvement

La spécification Stitch privilégie des mouvements courts et tactiles :

- Courbe principale : `cubic-bezier(0.22, 1, 0.36, 1)` ; courbe de pression : `cubic-bezier(0.4, 0, 0.2, 1)`.
- Pression : 120 ms ; action : environ 240 ms ; apparition : 320 ms ; feuilles et modales : 320–400 ms.
- La spécification propose 800 ms pour le remplissage des anneaux. La décision du projet autorise cette exception pour les anneaux (`stroke-dashoffset`) et les barres (`transform: scaleX`) ; le reste de l'interface reste entre 120 et 400 ms.
- Effets repérés : légère compression au toucher, entrée échelonnée des tâches, dessin du checkmark et des anneaux, rotation du chevron, glissement de la feuille, transition du thème et déplacement subtil des onglets.
- La maquette anime également `box-shadow` et propose un flottement décoratif en boucle. Les règles du dépôt prévalent : animer uniquement `transform`, `opacity` et `stroke-dashoffset` pour les anneaux ; supprimer le flottement décoratif en mode réduit.
- Pour `prefers-reduced-motion`, réduire à un fondu de 120 ms, afficher directement les valeurs finales des anneaux et éviter les translations, échelonnements et mouvements continus. La règle globale actuelle raccourcit les animations, mais ne garantit pas à elle seule un fondu uniquement : à revoir lors de l'implémentation des écrans.

Les tokens couvrent 120, 240, 400 et 800 ms pour la seule exception de progression, ainsi que les courbes principale et de pression. Les transitions générales restent plafonnées à 400 ms.

## Composants repérés

- **Aujourd'hui** : en-tête profil/marque et réglages, sélecteur de thème, date et titre, recherche avec filtres, carte Top 3 avec anneau de progression, filtres en puces, tâches avec priorité/liste/heure/sous-tâches/récurrence, actions rapides, carte de routine/habitude, dock de navigation et bouton flottant d'ajout.
- **Nouvelle tâche** : feuille basse avec poignée, annulation et validation, champ de titre, choix rapide de date, priorité, liste, rappel et Top 3, détails dépliables, calendrier/heure, durées estimées, priorités, checklist de sous-tâches et zone d'action fixe.
- **Réglages** : profil et synchronisation, apparence (thème, accent, densité, page d'accueil), notifications et heures, planification, compte/hors-ligne, import/export et corbeille, informations de version, aide, déconnexion et suppression de compte.
- **Historique** : recherche et filtre, onglets terminées/supprimées/toutes, synthèse de performance, anneau de réussite, compteurs, heatmap d'activité et série, filtres listes/étiquettes, tâches groupées par jour, action de réouverture et notification annulable, dock de navigation.
- **Composants transverses** : cartes en relief, champs en creux, boutons primaires/secondaires, puces, segments, interrupteurs, cases rondes, chevrons, toasts, anneaux et icônes avec texte.

## Accessibilité à appliquer lors de la réimplémentation

- Texte : contraste minimum 4,5:1 ; éléments graphiques et états visuels essentiels : 3:1. Les contrastes du texte orange clair et du texte blanc sur orange sombre signalés plus haut doivent être corrigés pour les usages textuels/CTA concernés.
- Cible tactile : minimum 44 × 44 px, même si l'icône visible est plus petite. Le HTML Stitch contient notamment des contrôles de 20 × 20, 26 × 26, 32 × 32, 36 × 36 et 40 × 40 px, ainsi que des interrupteurs de 48 × 24 px. Élargir leur zone interactive à 44 px au minimum sans nécessairement agrandir le dessin visible.
- Ne pas communiquer un état par la couleur ou l'ombre seules : associer icône et libellé, et fournir un focus clavier nettement visible.
- Le HTML Stitch est une référence de composition uniquement ; réimplémenter les composants avec React, Tailwind et les tokens du dépôt, en appliquant ces contraintes.
