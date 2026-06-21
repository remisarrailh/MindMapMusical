# 🎸 MindMap Musical — Montpellier

Cartographie personnelle des groupes de musique de Montpellier et alentour.
Mindmap interactive : groupes regroupés par style, placement libre, réécoute YouTube en un clic.

## Utilisation locale

```bash
npm install
npm run dev      # http://localhost:5173/MindMapMusical/
```

## Comment ça marche

- **Mémoire fixe** : `public/data/bands.json` (committé dans le repo).
- **Priorité des données** :
  - **Contenu des groupes** (nom, logo, styles, infos, vidéos, liens) → **le serveur est prioritaire**, affiché par défaut. Le `bands.json` committé fait foi.
  - **Positions des cartes** → **le local est prioritaire**, stockées séparément dans le navigateur (`mindmap.positions`), toujours appliquées par-dessus le serveur.

### Workflow d'édition
1. Clique **✏️ Éditer** pour passer en mode édition (liseré vert).
2. Ajoute / édite / supprime des groupes, gère les styles. Tes changements vont dans un **brouillon local** (`mindmap.contentDraft`).
3. Une **bannière d'avertissement** apparaît tant que ton brouillon diffère du serveur, avec **⬇ Exporter** / **🗑 Jeter le brouillon**.
4. Clique **⬇ Export** → télécharge un `bands.json` à jour (contenu + positions).
5. Remplace `public/data/bands.json` par ce fichier et commit/push sur GitHub.
6. Au rechargement suivant, le brouillon redevient identique au serveur → il s'efface automatiquement.

> En mode lecture (par défaut), tu vois toujours la version serveur. Déplacer les cartes reste possible et sauvegardé localement (positions = priorité locale).

## Fonctions

- **✏️ Éditer** : bascule lecture / édition. Les outils d'édition (ajout, styles, export, import) n'apparaissent qu'en mode édition.
- **+ Groupe** : nom, logo (upload → data-URI, ou URL), styles multiples (création à la volée), infos, vidéos YouTube (colle une URL, l'ID est extrait), liens, lien dédié aux concerts.
- **▶** sur une carte : lance la 1re vidéo dans le panneau détail (marche aussi en lecture).
- **Recherche** par nom/infos + **filtre par style**.
- **⬆ Import** : charge un `bands.json` (devient ton brouillon, en mode édition).
- **⤺ Positions** : remet les cartes aux positions du serveur.

## Déploiement GitHub Pages

1. Crée un repo GitHub nommé **`MindMapMusical`** (le nom doit matcher `base` dans `vite.config.ts`).
2. Push ce projet sur la branche `main`.
3. Dans **Settings → Pages**, choisis **Source : GitHub Actions**.
4. Le workflow `.github/workflows/deploy.yml` build et publie automatiquement à chaque push.
5. Site en ligne : `https://<ton-user>.github.io/MindMapMusical/`

> Si tu nommes le repo autrement, change `base: '/MindMapMusical/'` dans `vite.config.ts`.
