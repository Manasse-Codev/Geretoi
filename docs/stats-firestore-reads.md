# Lectures Firestore de l’écran Statistiques

À chaque chargement de Stats, l’écran demande les deux agrégations de période (un `count()` et un `sum(estimatedMinutes)`), un `count()` pour chacun des jours affichés (7 ou 30), puis au plus cinq documents détaillés, triés par date de complétion. Les agrégations n’envoient pas les documents au client. Le changement de période ou « Réessayer » relance ces demandes.

## Estimation de facturation

Hypothèses : Firestore Standard, une base admissible au quota gratuit, règles sans lectures dépendantes (`get()`, `exists()`), aucune reprise réseau ni mise en cache des résultats serveur entre ouvertures. Les requêtes d’agrégation sont uniquement serveur et le cache hors ligne ne les alimente pas.

Firestore facture chaque agrégation selon les entrées d’index lues, par tranche de 1 000, avec un minimum d’une lecture si aucune entrée ne correspond. La requête de détail facture les documents renvoyés (maximum 5). Les requêtes quotidiennes partitionnent l’intervalle de période et leurs résultats couvrent donc la même population que les deux agrégations globales.

| Ouverture | Agrégations | Détails max. | Exemple jusqu’à 1 000 tâches dans la période |
|---|---:|---:|---:|
| 7 jours | 9 (2 période + 7 jours) | 5 | jusqu’à 14 lectures facturables |
| 30 jours | 32 (2 période + 30 jours) | 5 | jusqu’à 37 lectures facturables |

Pour une estimation plus générale, additionner `ceil(entrées d’index correspondantes / 1 000)` pour chaque agrégation (avec minimum 1 chacune), puis ajouter les documents détaillés effectivement renvoyés. Ainsi, une période de 2 500 tâches peut coûter environ 3 lectures pour chacun des deux agrégats de période et, selon leur distribution journalière, jusqu’à 3 lectures par agrégat quotidien, plus cinq détails. Le coût exact dépend de l’index effectivement choisi; Query Explain peut le confirmer et est lui-même facturé.

Les comptes supposent une seule ouverture sans nouvelle tentative. Ils ne comprennent pas les lectures supplémentaires si les règles de sécurité consultent d’autres documents. Les tarifs et quotas changent : vérifier la [documentation officielle Firestore sur la facturation](https://firebase.google.com/docs/firestore/pricing) avant d’utiliser ces estimations comme budget.
