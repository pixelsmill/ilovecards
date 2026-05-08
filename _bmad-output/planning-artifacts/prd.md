---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
releaseMode: phased
inputDocuments: ['00-cadrage-v1.md']
workflowType: 'prd'
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
---

# Document de Spécifications Produit — ilovecards

**Auteur :** Hubert
**Date :** 2026-05-07

---

## Résumé Exécutif

ilovecards est une PWA mobile-first de répétition espacée qui traite la révision comme un moment sensoriel — cartes visuellement variées et dopaminiques, navigation par gestes, interface qui donne envie d'ouvrir l'app plutôt que de l'éviter. Là où Anki et Mochi traitent la mémorisation comme un workflow utilitaire, ilovecards pose que l'esthétique d'une carte fait partie de sa pédagogie : une belle carte crée de l'envie, l'envie crée la régularité, la régularité crée la mémoire.

**Cible :** Quiconque doit intérioriser des connaissances denses — étudiants en cursus exigeants, professionnels dont le domaine évolue vite, personnes souhaitant entretenir leur mémoire sur la durée.

**Problème central :** Les outils SRS existants sont abandonnés parce qu'ils sont laids et froids. ilovecards résout l'abandon, pas l'oubli.

### Ce qui le rend unique

**Esthétique comme levier pédagogique.** 6 à 8 templates de face vraiment distincts (Poster, Quote, Magazine, Color Block, Photo Overlay, Minimaliste, Equation/Code, Saturé) — chaque carte est un objet visuel différent qui active la mémoire visuelle autant que la mémoire sémantique.

**Grammaire gestuelle du flip optionnel.** La révision se fait sans boutons. Le flip est un acte de lecture volontaire, pas une étape forcée :
- ← Gauche (recto) : passer, garder en rotation — interval neutre
- → Droite (recto) : retourner la carte, lire le verso
- ↑ Haut (recto ou verso) : écarter — acquise, interval long
- ↓ Bas (verso) : pas retenu, revoir tout de suite

On peut juger sans ouvrir (haut au recto) ou ouvrir puis juger. Aucun SRS existant ne propose cette distinction.

**Extraction IA avec curation humaine obligatoire.** Le LLM propose des cartes depuis un document ; l'utilisateur valide carte par carte. La curation n'est pas optionnelle — pas de "tout accepter". Ce choix ralentit volontairement la création pour maintenir l'engagement cognitif.

**Densité sur volume.** Le produit valorise la rétention, pas le nombre de cartes.

---

## Critères de Succès

### Succès utilisateur

- L'utilisateur reconnaît une notion d'un simple coup d'œil — la carte déclenche la remémoration sans relire le cours
- La session de révision est un moment agréable — l'utilisateur ouvre l'app sans y être poussé
- Les connaissances arides (formules, définitions, dates) deviennent des objets visuels désirables grâce aux templates
- Les gestes s'apprennent en moins de 30 secondes et deviennent naturels

### Succès produit

- Les personnes qui découvrent l'app trouvent l'UX nouvelle et intéressante — grammaire gestuelle et design des cartes provoquent une réaction distincte d'Anki ou Mochi
- Le différenciateur est immédiatement lisible : "c'est de la répétition espacée mais c'est beau et ça se tient dans la main"

### Succès technique

- PWA installable sur iOS et Android, sessions disponibles offline
- Animations à 60fps sans saccades perceptibles sur iOS Safari et Android Chrome
- Algorithme SM-2 fonctionnel — intervalles adaptés correctement aux réponses

### Résultats mesurables

- Un utilisateur peut créer un deck, y ajouter des cartes et faire une session complète en moins de 5 minutes après l'onboarding
- Chaque template de face est visuellement distinct et identifiable à l'œil

---

## Périmètre Produit

### MVP — Phase 1 (~50h, 4 semaines, 1 développeur)

**Approche :** Experience MVP — le MVP doit être suffisamment beau et fluide pour valider que l'UX provoque la réaction attendue.

**Capacités :**
- PWA mobile-first installable (iOS + Android), offline pour sessions chargées
- Authentification magic link (Resend)
- CRUD decks + cartes avec sélecteur de 6-8 templates
- Import document (paste texte/MD) + extraction IA (Claude Haiku 4.5) avec interface de validation carte par carte
- Session de révision gestuelle complète (← passer / → flip / ↑ écarter / ↓ revoir)
- Flip 3D et swipes en CSS/JS vanilla — pas de dépendance d'animation tierce
- Algorithme SM-2
- Dashboard : cartes dues, streak, rétention par deck
- Backend Next.js 15 (App Router, MPA) + Postgres Neon + Prisma
- Déploiement Vercel continu dès J1

**Risques techniques :**
- PWA offline iOS : Safari a des limitations sur les service workers — tester sur vrai appareil dès la semaine 1
- Prompt d'extraction IA : qualité des cartes dépend du prompt — prototyper et itérer dès le départ
- 8 templates CSS : investissement design réel, ~½ semaine — ne pas sous-estimer

### Post-MVP — Phase 2

- Graduation de cartes (complétion, bibliothèque "maîtrisées", animation)
- Skill Claude Code (extraction Markdown → cartes depuis l'interface IA)
- Long press → menu radial sur les cartes
- Partage de decks entre utilisateurs

### Vision — Phase 3+

- Marketplace de decks publics
- Mode cloze
- Intégration Obsidian
- Distribution publique du Skill

---

## Parcours Utilisateurs

### Parcours 1 — Léa, étudiante en prépa scientifique (parcours principal)

**Scène d'ouverture.** Léa a cours de chimie organique dans 3 jours. Elle a un document de 8 pages sur les mécanismes réactionnels — dense, peu lisible, des formules partout. Elle sait qu'elle va tout oublier si elle ne fait rien.

**Action montante.** Elle ouvre ilovecards sur son téléphone, crée un deck "Chimie orga S1". Elle colle ses 8 pages dans l'interface d'import. 30 secondes plus tard, l'IA lui propose 11 cartes — une par notion-clé identifiée. Elle en rejette 2 trop vagues, en reformule 3, choisit un template pour chacune (Equation/Code pour les formules, Poster pour les grands principes, Quote pour les règles à retenir). Elle valide. Le deck est prêt.

**Climax.** Deux jours plus tard, dans le métro, ilovecards lui propose 8 cartes dues. Elle swipe — gauche pour passer, droite pour lire le dos quand elle hésite, haut pour écarter ce qu'elle sait vraiment. En 6 minutes, c'est fait. La formule qu'elle aurait oubliée, elle l'a revue au moment exact où son cerveau allait la lâcher.

**Résolution.** Le soir du contrôle, 9 de ses 12 notions lui reviennent sans effort.

*FR couverts : FR1, FR5, FR9–FR18, FR20–FR27, FR31, FR32*

---

### Parcours 2 — Thomas, dev senior en reconversion partielle (parcours secondaire)

**Scène d'ouverture.** Thomas lit des articles sur les LLMs deux fois par semaine. Il a l'impression de comprendre sur le moment et d'oublier en 48h. Son Notion est rempli de notes qu'il ne relit jamais.

**Action montante.** Il crée un deck "IA & archi" dans ilovecards. Après chaque article qui l'a marqué, il crée 2-3 cartes à la main — pas plus. Il choisit des templates Minimaliste ou Magazine. Le geste est court, délibéré. Il ne veut pas 200 cartes, il veut 40 cartes qu'il connaît vraiment.

**Climax.** Trois semaines plus tard, son deck compte 38 cartes. Il fait ses révisions le matin pendant 5 minutes. Quand un sujet revient dans une conversation, les notions sont là — pas lues il y a 3 semaines, *sues*.

**Résolution.** Le filtre "est-ce que ça mérite une carte ?" lui fait lire différemment.

*FR couverts : FR1, FR5, FR9–FR13, FR20–FR27, FR28–FR30*

---

### Parcours 3 — Hubert, opérateur (parcours admin)

Un utilisateur signale que ses cartes ne se chargent plus offline. Hubert consulte les logs Vercel, identifie un problème de service worker, déploie un fix. Pas d'interface admin en v1 — la gestion passe par les outils de la plateforme.

*FR couverts : FR33, FR34*

---

## Exigences Domaine

### Conformité RGPD

- Les cartes et l'email utilisateur sont des données personnelles soumises au RGPD
- Suppression de compte complète et irréversible requise (voir FR3)
- Export des données utilisateur requis (voir FR4)
- Pas de transfert de données hors UE sans consentement explicite
- Pas de COPPA, FERPA, HIPAA — produit adulte, usage personnel uniquement

### Maîtrise des coûts LLM

- La clé API Anthropic est exclusivement côté serveur — jamais exposée côté client
- Pas de rate limiting automatique en v1 — surveillance manuelle du tableau de bord Anthropic
- Limite de taille de document à l'import (50 000 caractères max) pour prévenir les dérives de coût

---

## Innovation

### Flip optionnel — interaction inédite en SRS

Les outils SRS actuels imposent le retournement de carte comme étape obligatoire. ilovecards dissocie le flip (acte de lecture volontaire) de la notation (gestes haut/bas/gauche). On peut juger sans lire le verso. Cette séparation n'existe dans aucun outil SRS courant.

### Esthétique comme variable pédagogique

L'hypothèse fondatrice : un template visuellement distinct par type de notion active la mémoire visuelle en complément de la mémoire sémantique. Cohérent avec les travaux sur le *testing effect* et la mémoire épisodique.

### Approche de validation

- **Gesture UX** : tests utilisateurs dès le premier prototype mobile — les gestes s'apprennent-ils en <30s ?
- **Esthétique** : taux de rétention cartes templates variés vs. uniforme (post-MVP, A/B test)
- **Extraction IA** : taux d'acceptation des cartes proposées — si <50%, le prompt est à retravailler

---

## Exigences Web App / PWA

- Application MPA (Next.js App Router, rendu serveur par route)
- La session de révision est la seule vue entièrement client-side
- **Navigateurs cibles :** iOS Safari, Android Chrome. Desktop : fonctionnel au plus simple
- **Responsive :** mobile-first, ratio carte ~9/14 occupant ~85% de l'écran mobile, desktop layout centré à largeur max contrainte
- **SEO :** aucun en v1 — app authentifiée, contenu privé
- **Accessibilité :** focus visible, ARIA sur les interactions gestuelles, contraste suffisant sur tous les templates
- **Animations :** flip 3D et transitions en CSS pur (`transform: rotateY()`, `backface-visibility`). Détection des gestes en JS vanilla (touchstart/touchmove/touchend). Pas de dépendance d'animation tierce.

---

## Exigences Fonctionnelles

### Authentification & Compte

- **FR1 :** L'utilisateur peut créer un compte via magic link (lien email, sans mot de passe)
- **FR2 :** L'utilisateur peut se connecter via magic link depuis n'importe quel appareil
- **FR3 :** L'utilisateur peut supprimer son compte et toutes ses données associées
- **FR4 :** L'utilisateur peut exporter l'ensemble de ses cartes et decks

### Gestion des Decks

- **FR5 :** L'utilisateur peut créer un deck avec un nom, une description optionnelle et une couleur d'accent
- **FR6 :** L'utilisateur peut modifier un deck existant
- **FR7 :** L'utilisateur peut supprimer un deck et toutes ses cartes
- **FR8 :** L'utilisateur peut voir la liste de ses decks avec le nombre de cartes dues

### Gestion des Cartes

- **FR9 :** L'utilisateur peut créer une carte manuellement (notion, développement optionnel, source optionnelle)
- **FR10 :** L'utilisateur peut choisir un template parmi les templates disponibles lors de la création
- **FR11 :** L'utilisateur peut voir un aperçu visuel de chaque template avant de le sélectionner
- **FR12 :** L'utilisateur peut modifier une carte existante (contenu + template)
- **FR13 :** L'utilisateur peut supprimer une carte

### Import & Extraction IA

- **FR14 :** L'utilisateur peut coller un texte ou document dans l'interface d'import
- **FR15 :** Le système extrait automatiquement les notions-clés du document et génère des cartes candidates
- **FR16 :** Le système suggère un template approprié pour chaque carte candidate selon son contenu
- **FR17 :** L'utilisateur peut accepter, refuser ou modifier chaque carte candidate individuellement
- **FR18 :** L'utilisateur peut valider le lot de cartes retenues pour les enregistrer dans un deck
- **FR19 :** Le système refuse les documents dépassant la limite de taille définie

### Session de Révision

- **FR20 :** L'utilisateur peut démarrer une session avec les cartes dues du jour pour un deck ou tous ses decks
- **FR21 :** L'utilisateur peut passer une carte (geste gauche sur le recto) — la carte reste en rotation
- **FR22 :** L'utilisateur peut retourner une carte pour voir le verso (geste droite sur le recto)
- **FR23 :** L'utilisateur peut écarter une carte depuis le recto sans voir le verso (geste haut) — interval long
- **FR24 :** L'utilisateur peut écarter une carte depuis le verso (geste haut) — interval long
- **FR25 :** L'utilisateur peut signaler qu'il n'a pas retenu une carte depuis le verso (geste bas) — la carte revient rapidement
- **FR26 :** Le système calcule le prochain interval de révision via l'algorithme SM-2 selon le geste effectué
- **FR27 :** Le recto de la carte est rendu visuellement selon son template au sein de la session

### Dashboard & Progression

- **FR28 :** L'utilisateur peut voir le nombre de cartes dues aujourd'hui (global et par deck)
- **FR29 :** L'utilisateur peut voir son streak de révision (jours consécutifs)
- **FR30 :** L'utilisateur peut voir la courbe de rétention de ses decks dans le temps

### PWA & Mode Hors-ligne

- **FR31 :** L'utilisateur peut installer l'app sur l'écran d'accueil de son téléphone (iOS et Android)
- **FR32 :** L'utilisateur peut réviser en mode hors-ligne pour les sessions déjà chargées

### Administration

- **FR33 :** L'opérateur peut déployer une nouvelle version sans interruption de service
- **FR34 :** L'opérateur peut consulter les erreurs applicatives via les logs de la plateforme d'hébergement

---

## Exigences Non-Fonctionnelles

### Performance

- Les animations de la session de révision (flip, swipe) s'exécutent à 60fps sans saccades sur iOS Safari et Android Chrome
- La session de révision charge ses cartes en moins de 2 secondes sur une connexion mobile standard
- L'extraction IA répond en moins de 15 secondes pour un document jusqu'à la limite de taille — indicateur de progression visible pendant le traitement
- Le mode offline est disponible sans délai perceptible après la première connexion

### Sécurité

- Toutes les communications client-serveur sont chiffrées via HTTPS
- La clé API Anthropic est stockée exclusivement en variable d'environnement serveur — jamais exposée côté client
- Les tokens magic link sont à usage unique et expirent après utilisation
- La suppression de compte efface toutes les données utilisateur de façon irréversible (FR3)

### Intégrations

- **Anthropic Claude Haiku 4.5** : extraction IA, appel exclusivement serveur-side
- **Resend** : emails magic link, délai de livraison < 30 secondes
- **Neon (Postgres)** : base de données principale, accès via Prisma
- **next-pwa** : service worker et manifest PWA pour installation et mode offline
