# Asset manifest — refonte Tous Imparfaits

Tous les visuels, textes, prix et noms produits proviennent du site réel
https://tousimparfaits.com (Shopify, CDN `tousimparfaits.com/cdn/shop/files/...`),
récupérés via l'endpoint public `https://tousimparfaits.com/products.json` (122 produits)
et le HTML de la page d'accueil.

## Identité

| Asset | Source | Usage |
|---|---|---|
| `logo.png` (wordmark calligraphique) | `//tousimparfaits.com/cdn/shop/files/logopoursite_c483c6da-27cc-4e0f-abad-f2d5a915594f_1000x.png` | header, section communauté, footer, closer |
| Couleurs échantillonnées | CSS de `https://tousimparfaits.com/` : `#0a0a0a`, `#282828`, `#ededed`, `#9b9b9b`, `#d64747` (rouge), `#58468c` (violet), `#005749` (vert), `#d4fff8` | ink / paper / accent / codage couleur des univers |
| Polices réelles | `https://use.typekit.net/fla7ycu.css` → **Interstate**, **Interstate Condensed**, **Interstate Compressed** (Adobe Fonts, licence liée au domaine, fichiers non redistribuables) | — |
| Substitution documentée | **Archivo Variable** (axes `wght` 100–900 + `wdth` 62–125), `assets/fonts/archivo-var.woff2` depuis fonts.gstatic.com. Grotesque à terminaisons plates, axe de largeur réglé sur `wdth 62–70` pour reproduire le squelette Interstate Compressed des titres du site (ex. « ROAD TRIP »). Corps de texte en `wdth 100`. | display + UI |
| **Shippori Mincho Bold** sous-ensemble (51 glyphes JP) → `assets/fonts/mincho-jp-subset.woff2`, source `github.com/google/fonts/ofl/shipporimincho` | kickers japonais (侍, 妖怪, 浴衣…) |

## Textes réels réutilisés (page d'accueil / pages produits)

- « Livraison offerte en FRANCE MÉTROPOLITAINE dès 100€ »
- « Sortie à la Japan Expo 2026 »
- « Il n'en reste plus beaucoup !! »
- « Collaborations officielles »
- « Rejoignez la lettre imparfaite ! — Pour des nouvelles exclusives, les derrières de scène mais aussi les annonces et une suite à Ici Japon Corp ! »
- « Les commandes sont préparées et expédiées depuis la France… livraison rapide en 48-72h (hors weekend) »
- « Aucun risque de piratage avec notre système de paiement sécurisé. Aucun incident n'a été rencontré depuis la sortie du site en 2020 ! »
- « Ils sont en France et attendent l'occasion de vous aider… tousimparfaits@gmail.com »
- « Ils vous attendent par paliers et sont là pour récompenser votre confiance en nous ! » (cadeaux offerts)
- Retrait : INDIEVIDUALS — 26 Avenue Christian Doppler, Bat D5, 77700 Bailly-Romainvilliers (prêt en 24 h)

## Preuves sociales (sources externes, citées dans le pied de section)

- Tev – Ici Japon : 1,09 M d'abonnés YouTube — https://fr.wikipedia.org/wiki/Beno%C3%AEt_Theveny
- Ici Japon Corp. : 233 K abonnés — https://asknaveen.com/channel/@icijaponcorp
- Tev & Louis : 625 K abonnés — https://fr.wikipedia.org/wiki/Beno%C3%AEt_Theveny
- Collaboration G-SHOCK France × Tous Imparfaits — https://www.instagram.com/icijapon/

## Images produits (toutes issues du CDN Shopify de la marque)

Pattern de source : `https://tousimparfaits.com/cdn/shop/files/<fichier>_1600x.jpg`
(redimensionnées ≤1400 px et recompressées localement pour le poids).

| Fichier local | Produit / prix réel | Section |
|---|---|---|
| `veste-yokai-beige-2.jpg` | Veste Yokai – Beige, 60 € | Hero plein cadre |
| `t-shirt-fujiwara-bleu-2.jpg` | T-shirt Fujiwara – Bleu, 25 € | Tuile collection Samouraï |
| `veste-yokai-beige-1.jpg` | Veste Yokai – Beige, 60 € | Tuile collection Yokai |
| `veste-yukata-dinterieur-collection-zen-0.jpg` | Veste Yukata d'intérieur – Zen, 60 € | Tuile collection Zen |
| `hoodie-momiji-black-1.jpg` | Hoodie Momiji – Black, 70 € | Tuile collection Momiji |
| `hoodie-basics-vert-0.jpg` | Hoodie Basics – Vert, 65 € | Tuile collection Basics |
| `maillot-ijc-esport-2026-1.jpg` | Maillot IJC ESPORT 2026, 70 € | Tuile collection Esport |
| `le-meug-1.jpg` | Le Meug, 30 € | Tuile collection Goodies |
| `t-shirt-hokkaido-0.jpg` | T-shirt Hokkaido, 35 € | Tuile collection Road Trip |
| `tasse-mediterraneenne-ijc-0.jpg` | Tasse méditerranéenne IJC, 20 € | Grille nouveautés |
| `t-shirt-tokyo-0.jpg` | T-shirt Tokyo, 35 € | Grille nouveautés |
| `t-shirt-kyoto-0.jpg` | T-shirt Kyoto, 35 € | Grille nouveautés |
| `t-shirt-okinawa-0.jpg` | T-shirt Okinawa, 35 € | Grille nouveautés |
| `tote-bag-road-trip-0.jpg` | Tote Bag Road Trip, 15 € | Grille nouveautés |
| `pins-road-trip-0.jpg` | Pin's Road Trip, 5 € | Grille nouveautés |
| `hoodie-kamon-black-red-0.jpg` / `-1.jpg` | Hoodie Kamon – Black & Red, 70 € | Grille nouveautés (survol) |
| `t-shirt-mecha-black-0.jpg` / `-1.jpg` | T-shirt Mecha – Black, 25 € | Grille nouveautés (survol) |
| `veste-baseball-chainsaw-man-pochita-red-0.jpg` | Veste Baseball Chainsaw Man – Pochita Red, 45 € | Collaborations |
| `chaussettes-tous-imparfaits-x-maison-broussaud-le-coffret-0.jpg` | Chaussettes × Maison Broussaud – Coffret, 30 € | Collaborations |
| `cordons-bleus-amone-0.jpg` | Cordons Bleus – Amone (livre), 19,90 € | Collaborations |
| `p-te-tartiner-debenoit-classique-550g-0.jpg` | Pâte à tartiner DEBENOÎT Classique 550 g, 12 € | Collaborations |
| `hoodie-neo-samourai-noir-nouvelle-coupe-1.jpg` | Hoodie Neo Samouraï Noir, 75 € | Univers épinglé — Samouraï |
| `t-shirt-yokai-rouge-0.jpg` | T-shirt Yokai – Rouge, 27 € | Univers épinglé — Yokai |
| `veste-navy-ensemble-yukata-1.jpg` | Veste Navy – ensemble Yukata, 55 € | Univers épinglé — Zen |
| `hoodie-ijc-black-0.jpg` | Hoodie IJC – Black, 70 € | Univers épinglé — Basics |
| `veste-navy-ensemble-yukata-0.jpg` | Ensemble Yukata Navy | Shop-the-look (points interactifs) |
| `casquette-sakura-denim-0.jpg` | Casquette Sakura – Denim, 30 € | Bandeau stock faible |
| `gourde-momiji-0.jpg` | Gourde Momiji, 30 € | Bandeau stock faible |
| `pins-daruma-0.jpg` | Pin's Daruma, 5 € | Bandeau stock faible |
| `crewneck-xsite-0.jpg` | Crewneck Xsite, 95 € | Bandeau stock faible |
| `surchemise-chainsaw-man-0.jpg` | Surchemise Chainsaw Man, 45 € | Bandeau stock faible |
| `pack-mystere-fukubukuro-0.jpg` | Pack Mystère – Fukubukuro, 75 € | Bloc offre |
| `t-shirt-ijc-vert-0.jpg`, `hoodie-basics-rouge-0.jpg`, `echarpes-ijc-esport-0.jpg` | T-shirt IJC Vert 30 €, Hoodie Basics Rouge 65 €, Écharpe IJC Esport 30 € | Section communauté |

Visuels téléchargés en réserve (non utilisés dans le rendu, conservés pour itérations) :
autres angles des mêmes produits (`*-1.jpg`, `*-2.jpg`).

## Médias vidéo

Aucune vidéo ni animation Lottie n'est servie sur la page d'accueil actuelle
(recherche `.mp4`, `.webm`, `cdn/shop/videos` dans le HTML : aucun résultat).
Le hero utilise donc la meilleure photographie lifestyle réelle disponible.

## Optimisation (audit du 27/08/2026)

- **Conversion WebP** — les 63 visuels produits/lifestyle issus de tousimparfaits.com ont été reconvertis en WebP (qualité 82, largeur max 1400 px). Poids total du dossier `assets/` : **18,4 Mo → 4,9 Mo**.
- **`logo.webp`** — version WebP de `logo.png` (logo officiel Tous Imparfaits, 1000×537), utilisée dans le header, le closer et le footer.
- **`og-image.jpg`** — 1200×630, composée à partir de `veste-yokai-beige-2.webp` + logo, pour les aperçus Open Graph / Twitter Card.
- **Attributs** — `loading="lazy"`, `decoding="async"` et `width`/`height` intrinsèques ajoutés sur les 38 images sous la ligne de flottaison ; le logo du header passe en `fetchpriority="high"`.
- **Polices** — `archivo-var.woff2`, `archivo-var-italic.woff2` (Archivo Variable, OFL) et `mincho-jp-subset.woff2` (Shippori Mincho, OFL, sous-ensemble des seuls glyphes utilisés) auto-hébergées.
