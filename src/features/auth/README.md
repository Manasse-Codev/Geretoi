Contient l'écran de connexion, les services et le contexte d'authentification Firebase.
Google utilise une redirection si `display-mode: standalone`, le mode autonome iOS (`navigator.standalone`) ou un user-agent mobile est détecté ; les autres navigateurs utilisent une popup.

**Attention au déploiement Cloudflare Pages :** `signInWithRedirect` peut ne pas fonctionner dans les navigateurs qui bloquent le stockage tiers lorsque l'application n'est pas hébergée sur Firebase Hosting. Ce parcours doit être testé au premier déploiement Cloudflare Pages. Solutions possibles : utiliser la popup, configurer un proxy `/__/auth`, ou proposer la connexion par e-mail comme solution de secours.
