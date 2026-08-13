# TODO — queerstories

## Pages / Structure
- [ ] Revoir le layout de `index.html` — page pas propre visuellement (grille, espacement, typographie)

- [ ] Utiliser le contenu de `archives/about.html` pour rédiger le texte à destination des participants (questions, règles, thèmes) — à intégrer dans `participate.html` ou en document séparé envoyé aux participants
- [ ] Ajouter une mention "Currently open : [ville, mois année]" en haut de `participate.html` + champ "ville/session" dans le formulaire Airtable
- [ ] Ajouter une section "With the support of" en bas de `project.html` pour les partenaires et subsidiaires
- [ ] Travailler le contenu de `exhibition.html` + mettre à jour le `<title>` (encore "Art Residency")
- [ ] Travailler le contenu de `contact.html` + mettre à jour le `<title>` (encore "Contact me")

## Contenu
- [ ] Ajouter une clé `"contributors"` dans chaque JSON de ville (ex: `sao_paulo_2020.json`) pour créditer les personnes impliquées par ville — affiché dans le footer immersif de `city.html` (remplacer le Lorem Ipsum du div texte dédié)


- [ ] Ajouter un champ `cover` dans chaque JSON de ville (photo de couverture pour les partages SEO/réseaux sociaux)
- [ ] Ajouter des témoignages audio (pour les personnes qui ne veulent pas se montrer à l'image)
- [ ] Compresser toutes les vidéos avec ffmpeg (quand tout le contenu est prêt)
- [ ] Compresser toutes les images (script Node ou squoosh.app)
- [ ] Remplir les vrais textes dans texts.md (remplacer le Lorem Ipsum)

## Contenu São Paulo
- [ ] Retravailler le style des blocs graffiti (`.drama`, `.murder-story`) — texte à revoir + explorer couleur de fond (--color-link-external testé, effet décalé intéressant mais texte pas encore au point)

## Code / CSS
- [ ] Renommer `_main.scss` → `_city.scss` (c'est la page city, pas du style global)
- [ ] Créer un mixin `responsive-media` pour éviter la répétition de `.paralax, video, img` dans les deux breakpoints
- [ ] Renommer `$m-width` / `$l-width` / `$m-main-width` / `$l-main-width` en noms lisibles (ex: `$cell-width-md`, `$grid-width-md`)
- [ ] Gestion d'erreur si un JSON ne charge pas (page blanche silencieuse actuellement)
- [ ] Remplacer `markdownToHtml` par un vrai parser (fragile si le format n'est pas respecté)

## Fonctionnalités
- [ ] Élément audio : afficher une image en `position: fixed` + `clip-path` (même principe que parallax-video) derrière le player audio — effet de couche lointaine / profondeur. Ajouter dans le JSON : `{ "type": "audio", "src": "...", "cover": "photo/..." }`
- [ ] Mode PWA / fullscreen sur mobile (meta tags apple-mobile-web-app-capable + manifest.json)
- [ ] Formulaire Airtable dans participate.html
- [ ] SEO (meta description, og:tags, sitemap, structured data)
- [ ] Cartographie (future grande feature)

## SEO — à compléter quand domaine + visuels prêts
- [ ] Remplacer `https://VOTRE-DOMAINE.com` dans `index.html` et `js/city.js`
- [ ] Créer `media/og-cover.jpg` — image générale du projet (1200×630px) pour les partages
- [ ] Ajouter `"cover": "photo/NOM.jpg"` dans chaque JSON de ville (photo représentative)
- [ ] Créer `sitemap.xml` (liste des URLs du site pour Google)
- [ ] Créer `robots.txt`

## Déploiement
- [ ] Trouver une solution de déploiement propre (GitHub Pages public ou alternative)
- [ ] Pipeline : compress vidéos + images → push → deploy automatique
