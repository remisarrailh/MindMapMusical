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
- **Mémoire locale** : tes ajouts / éditions / déplacements sont sauvegardés dans le `localStorage` du navigateur (autosave immédiat).
- **Workflow d'ajout permanent** :
  1. Ajoute / édite / déplace tes groupes dans le site.
  2. Clique **⬇ Export** → télécharge un `bands.json` à jour.
  3. Remplace `public/data/bands.json` par ce fichier et commit/push sur GitHub.
  4. (Optionnel) **↺ Reset local** vide le localStorage une fois le JSON committé.

Le `*` à côté du bouton Export signale des modifications locales non encore exportées.

## Fonctions

- **+ Groupe** : nom, logo (upload → intégré au JSON en data-URI, ou URL), styles multiples (création à la volée), infos, vidéos YouTube (colle une URL, l'ID est extrait), liens, lien dédié aux dates de concerts.
- **▶** sur une carte : lance la 1re vidéo dans le panneau détail.
- **Recherche** par nom/infos + **filtre par style**.
- **Import** : recharge un `bands.json` existant.

## Déploiement GitHub Pages

1. Crée un repo GitHub nommé **`MindMapMusical`** (le nom doit matcher `base` dans `vite.config.ts`).
2. Push ce projet sur la branche `main`.
3. Dans **Settings → Pages**, choisis **Source : GitHub Actions**.
4. Le workflow `.github/workflows/deploy.yml` build et publie automatiquement à chaque push.
5. Site en ligne : `https://<ton-user>.github.io/MindMapMusical/`

> Si tu nommes le repo autrement, change `base: '/MindMapMusical/'` dans `vite.config.ts`.
