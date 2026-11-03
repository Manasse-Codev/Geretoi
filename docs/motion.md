# Motion design DayFlow

Les mouvements servent à rendre les interactions compréhensibles et tactiles. Ils restent sobres, sans animation décorative en boucle.

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
