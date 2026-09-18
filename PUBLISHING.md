# Comment publier ce dépôt (À LIRE avant tout déploiement)

## ⚠️ navigator + bibliotheque se publient ENSEMBLE
`bibliotheque` est la bibliothèque partagée ; `navigator` (le dashboard) en épingle une **version précise** (pour la vitesse). Donc on ne les publie pas séparément à la légère : publier la bibliothèque sans re-épingler le dashboard = incohérence.
Aujourd'hui la publication couplée se fait via `~/projects/release-structory.sh` (bibliothèque → version → communicator + navigator re-épinglés). Le robot GitHub combiné pour ces deux-là est en cours de mise en place.

## Règle générale (comme les autres dépôts)
- ❌ Ne déploie PLUS à la main (`clasp deploy`/`push`) toi-même une fois le robot en place.
- Publier = branche → commit → push → **Pull Request** → **Stéphane clique « Merge »** → le robot déploie.
- Rien ne va en ligne sans le clic « Merge » de Stéphane. Jamais de push direct sur `main`.

## Si tu n'as PAS accès à GitHub (poste Windows : pas de clé/gh)
Commite en local mais **ne déploie pas** ; passe le relais à la session VPS + GitHub (compte `Larose75-precogn`) qui poussera et ouvrira la PR.
