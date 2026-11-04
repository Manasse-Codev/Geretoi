# Motion design DayFlow

Les mouvements servent à rendre les interactions compréhensibles et tactiles. Ils restent sobres. Seule exception décorative en boucle : la lévitation du bouton « + » de la navigation, décrite ci-dessous.

## Règles

- Animer uniquement `transform` et `opacity`, avec `stroke-dashoffset` pour les anneaux. Ne jamais animer `box-shadow` ni les propriétés de mise en page.
- Les transitions ordinaires durent de 120 à 400 ms. Un appui peut fondre du relief vers le creux en 120 ms et réduire l'élément à `scale(0.98)`.
- Le remplissage des anneaux (via `stroke-dashoffset`) et des barres (via `transform: scaleX`) peut durer jusqu'à 800 ms.
- Respecter `prefers-reduced-motion` : remplacer les transitions par un fondu de 120 ms et présenter anneaux et barres directement à leur valeur finale.
- Les déplacements et transitions de navigation, d'accordéon et de feuille restent courts et réversibles. Ne pas déplacer une cible tactile hors de sa position utile.

## Application aux composants

- Les surfaces en relief et en creux changent d'état par fondu d'opacité entre deux couches statiques ; leurs ombres ne sont jamais interpolées.
- Les chevrons peuvent pivoter avec `transform`. L'indicateur de navigation peut glisser avec `transform`.
- `ProgressRing` anime uniquement `stroke-dashoffset` ; `ProgressBar` anime uniquement `transform: scaleX`.
- Les états de chargement et de démonstration n'ajoutent pas de scintillement continu.

## Bouton flottant « + »

Le bouton est centré au-dessus de la barre de navigation. Sa cible reste fixe à 64 × 64 px ; le disque orange mesure 56 px et son anneau de surface 4 px. Seuls les éléments visuels internes bougent.

| Déclencheur | Mouvement | Durée et courbe | Propriétés | Mouvement réduit |
|---|---|---|---|---|
| Première apparition de la barre dans la session | Le disque rejoint sa position depuis 16 px plus bas, scale 0,6 → 1 | Délai 120 ms, ressort stiffness 300 / damping 24, une fois par session | `transform`, avec fondu si requis | Fondu seul, 120 ms |
| Repos | Le disque monte de 0 à −4 px puis revient ; l'ombre varie en sens inverse, scale 1 → 0,92 et opacité réduite | Boucle de 3,6 s, `ease-in-out` | `transform`, `opacity` | Aucune boucle ni translation |
| Onglet caché, survol/focus, pression, défilement ou route Nouvelle tâche | La boucle est suspendue | Immédiat | Arrêt de la boucle | Aucun mouvement |
| Survol ou focus clavier | Le disque monte de 2 px, le « + » pivote de 90°, l'ombre s'étale légèrement | 180 ms, `ease-in-out` | `transform`, `opacity` | Fondu seul, sans pivot |
| Pression puis relâchement | Le disque se réduit à 0,94 puis revient avec un ressort léger ; l'ombre se rétracte | Pression 120 ms ; retour ressort | `transform`, `opacity` | Fondu seul, 120 ms |
| Ouverture de Nouvelle tâche | Le « + » pivote de 45° avant le glissement de la route vers le haut avec fondu | Pivot 200 ms ; route 320 ms, `cubic-bezier(0.22, 1, 0.36, 1)` | `transform`, `opacity` | Fondu seul, 120 ms |
| Fermeture par retour navigateur ou annulation | La route glisse en sens inverse ; le focus clavier revient au bouton | 320 ms, même courbe | `transform`, `opacity` | Fondu seul, 120 ms |
| Création réussie d'une tâche | Une pulsation et un anneau d'opacité décroissante | Pulsation 300 ms ; anneau 450 ms, `ease-out` | `transform`, `opacity` | Pulsation et anneau omis |
| Défilement vers le bas puis vers le haut ou arrêt | Le disque passe à scale 0,88, puis revient à 1 ; il reste visible et cliquable | 150 ms, `ease-in-out` ; retour au repos après 180 ms sans défilement | `transform` | Pas de réduction de taille |

La lévitation est coupée lorsque `prefers-reduced-motion` est actif, lorsque `document.visibilityState` n'est pas `visible`, et pendant les interactions ou le défilement. Le centre horizontal ne se déplace jamais. L'ombre est une couche distincte ; aucune animation ne modifie `box-shadow`, `width` ou `height`, et `will-change` n'est pas appliqué en permanence.
