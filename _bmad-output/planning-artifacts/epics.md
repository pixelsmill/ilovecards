---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-05-07'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# ilovecards - Epic Breakdown

## Overview

Ce document décompose les exigences du PRD et de l'Architecture en epics et stories implémentables pour ilovecards — une PWA mobile-first de répétition espacée avec templates visuels et navigation gestuelle.

## Requirements Inventory

### Functional Requirements

FR1: L'utilisateur peut créer un compte via magic link (lien email, sans mot de passe)
FR2: L'utilisateur peut se connecter via magic link depuis n'importe quel appareil
FR3: L'utilisateur peut supprimer son compte et toutes ses données associées (RGPD)
FR4: L'utilisateur peut exporter l'ensemble de ses cartes et decks
FR5: L'utilisateur peut créer un deck avec un nom, une description optionnelle et une couleur d'accent
FR6: L'utilisateur peut modifier un deck existant
FR7: L'utilisateur peut supprimer un deck et toutes ses cartes
FR8: L'utilisateur peut voir la liste de ses decks avec le nombre de cartes dues
FR9: L'utilisateur peut créer une carte manuellement (notion, développement optionnel, source optionnelle)
FR10: L'utilisateur peut choisir un template parmi les templates disponibles lors de la création
FR11: L'utilisateur peut voir un aperçu visuel de chaque template avant de le sélectionner
FR12: L'utilisateur peut modifier une carte existante (contenu + template)
FR13: L'utilisateur peut supprimer une carte
FR14: L'utilisateur peut coller un texte ou document dans l'interface d'import
FR15: Le système extrait automatiquement les notions-clés du document et génère des cartes candidates
FR16: Le système suggère un template approprié pour chaque carte candidate selon son contenu
FR17: L'utilisateur peut accepter, refuser ou modifier chaque carte candidate individuellement
FR18: L'utilisateur peut valider le lot de cartes retenues pour les enregistrer dans un deck
FR19: Le système refuse les documents dépassant 50 000 caractères
FR20: L'utilisateur peut démarrer une session avec les cartes dues du jour pour un deck ou tous ses decks
FR21: L'utilisateur peut passer une carte (geste gauche recto) — la carte reste en rotation
FR22: L'utilisateur peut retourner une carte pour voir le verso (geste droite recto)
FR23: L'utilisateur peut écarter une carte depuis le recto sans voir le verso (geste haut) — interval long
FR24: L'utilisateur peut écarter une carte depuis le verso (geste haut) — interval long
FR25: L'utilisateur peut signaler qu'il n'a pas retenu une carte depuis le verso (geste bas) — la carte revient rapidement
FR26: Le système calcule le prochain interval de révision via SM-2 selon le geste effectué
FR27: Le recto de la carte est rendu visuellement selon son template au sein de la session
FR28: L'utilisateur peut voir le nombre de cartes dues aujourd'hui (global et par deck)
FR29: L'utilisateur peut voir son streak de révision (jours consécutifs)
FR30: L'utilisateur peut voir la courbe de rétention de ses decks dans le temps
FR31: L'utilisateur peut installer l'app sur l'écran d'accueil de son téléphone (iOS et Android)
FR32: L'utilisateur peut réviser en mode hors-ligne pour les sessions déjà chargées
FR33: L'opérateur peut déployer une nouvelle version sans interruption de service
FR34: L'opérateur peut consulter les erreurs applicatives via les logs de la plateforme d'hébergement

### NonFunctional Requirements

NFR1: Les animations de la session de révision (flip, swipe) s'exécutent à 60fps sans saccades sur iOS Safari et Android Chrome
NFR2: La session de révision charge ses cartes en moins de 2 secondes sur une connexion mobile standard
NFR3: L'extraction IA répond en moins de 15 secondes pour un document jusqu'à la limite de taille — indicateur de progression visible
NFR4: Le mode offline est disponible sans délai perceptible après la première connexion
NFR5: Toutes les communications client-serveur sont chiffrées via HTTPS
NFR6: La clé API Anthropic est stockée exclusivement en variable d'environnement serveur — jamais exposée côté client
NFR7: Les tokens magic link sont à usage unique et expirent après utilisation
NFR8: La suppression de compte efface toutes les données utilisateur de façon irréversible

### Additional Requirements

- AR1: Initialisation projet via `npx create-next-app@latest ilovecards --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- AR2: Setup Prisma schema (User, Deck, Card, Review) + migrations Neon Postgres
- AR3: Auth.js v5 avec sessions BDD via `@auth/prisma-adapter` (pas JWT — révocation RGPD)
- AR4: Middleware Next.js pour protection des routes `(app)/*` et `/api/*`
- AR5: Composant `<CardRenderer>` partagé — prop `size: 'thumb' | 'preview' | 'full'` — bloquant pour 3 features
- AR6: 8 templates de cartes CSS : `poster`, `quote`, `magazine`, `color-block`, `photo-overlay`, `minimaliste`, `equation`, `sature`
- AR7: Moteur SM-2 comme fonction pure testée dans `src/lib/sm2.ts`
- AR8: Pipeline extraction IA avec streaming ReadableStream (Claude Haiku 4.5 via Anthropic SDK)
- AR9: shadcn/ui installé via CLI pour les primitives UI
- AR10: `@ducanh2912/next-pwa` pour service worker + manifest PWA
- AR11: Variables d'environnement configurées : `DATABASE_URL`, `NEXTAUTH_SECRET`, `AUTH_RESEND_KEY`, `ANTHROPIC_API_KEY`
- AR12: Déploiement Vercel continu (main → production)
- AR13: Zod pour validation dans tous les Route Handlers
- AR14: Helper `apiError(code, message, status)` dans `src/lib/api-error.ts`
- AR15: Format d'erreur API standardisé : `{ error: string; code?: string }` + HTTP status codes

### UX Design Requirements

_Aucun document UX Design disponible. Les exigences d'interaction sont couvertes par le PRD (grammaire gestuelle, templates visuels) et l'Architecture (CSS pur, animations, CardRenderer)._

### FR Coverage Map

FR1 → Epic 1 — Création compte magic link
FR2 → Epic 1 — Connexion magic link depuis tout appareil
FR3 → Epic 1 — Suppression compte + données (RGPD)
FR4 → Epic 1 — Export cartes et decks
FR33 → Epic 1 — Déploiement sans interruption (Vercel)
FR34 → Epic 1 — Logs erreurs plateforme (Vercel)
FR5 → Epic 2 — Création deck (nom, description, couleur)
FR6 → Epic 2 — Modification deck
FR7 → Epic 2 — Suppression deck + cartes
FR8 → Epic 2 — Liste decks avec cartes dues
FR9 → Epic 2 — Création carte manuelle
FR10 → Epic 2 — Choix template à la création
FR11 → Epic 2 — Aperçu visuel des templates
FR12 → Epic 2 — Modification carte (contenu + template)
FR13 → Epic 2 — Suppression carte
FR20 → Epic 3 — Démarrage session cartes dues
FR21 → Epic 3 — Geste gauche : passer (rotation)
FR22 → Epic 3 — Geste droite : flip verso
FR23 → Epic 3 — Geste haut recto : écarter (interval long)
FR24 → Epic 3 — Geste haut verso : écarter (interval long)
FR25 → Epic 3 — Geste bas verso : pas retenu (revoir vite)
FR26 → Epic 3 — Calcul SM-2 selon geste
FR27 → Epic 3 — Rendu template dans session
FR14 → Epic 4 — Paste texte/document
FR15 → Epic 4 — Extraction notions-clés par IA
FR16 → Epic 4 — Suggestion template par IA
FR17 → Epic 4 — Validation carte par carte
FR18 → Epic 4 — Enregistrement lot de cartes retenues
FR19 → Epic 4 — Refus document > 50 000 caractères
FR28 → Epic 5 — Cartes dues aujourd'hui (global + par deck)
FR29 → Epic 5 — Streak de révision
FR30 → Epic 5 — Courbe de rétention
FR31 → Epic 6 — Installation PWA iOS + Android
FR32 → Epic 6 — Révision offline (sessions chargées)

## Epic List

### Epic 1 : Socle & Authentification
Un utilisateur peut créer un compte via magic link, se connecter depuis n'importe quel appareil, supprimer son compte (RGPD) et exporter ses données. L'app est déployée en continu sur Vercel dès la première story.
**FRs couverts :** FR1, FR2, FR3, FR4, FR33, FR34

### Epic 2 : Gestion des Decks & Cartes
Un utilisateur peut créer des decks, y ajouter des cartes manuellement avec un choix parmi 8 templates visuels distincts, voir les aperçus, et gérer (modifier, supprimer) decks et cartes.
**FRs couverts :** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13

### Epic 3 : Session de Révision
Un utilisateur peut démarrer une session avec ses cartes dues, les réviser avec les 4 gestes (← passer, → flip, ↑ écarter, ↓ pas retenu), et l'algorithme SM-2 calcule les prochains intervalles.
**FRs couverts :** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

### Epic 4 : Extraction IA
Un utilisateur peut coller un document, voir les cartes candidates générées par Claude Haiku en streaming, les valider ou rejeter une à une, et enregistrer les cartes retenues dans un deck.
**FRs couverts :** FR14, FR15, FR16, FR17, FR18, FR19

### Epic 5 : Dashboard & Progression
Un utilisateur peut voir ses cartes dues aujourd'hui (global et par deck), son streak de révision, et la courbe de rétention de ses decks.
**FRs couverts :** FR28, FR29, FR30

### Epic 6 : PWA & Mode Offline
Un utilisateur peut installer l'app sur son téléphone et réviser sans connexion les sessions déjà chargées.
**FRs couverts :** FR31, FR32

---

## Epic 1 : Socle & Authentification

Un utilisateur peut créer un compte via magic link, se connecter depuis n'importe quel appareil, supprimer son compte (RGPD) et exporter ses données. L'app est déployée en continu sur Vercel dès la première story.

**FRs :** FR1, FR2, FR3, FR4, FR33, FR34 | **NFRs :** NFR5, NFR7, NFR8

### Story 1.1 : Initialisation du projet & déploiement continu

En tant que développeur/opérateur,
je veux que le projet soit initialisé et déployé sur Vercel,
afin que chaque story soit validée dans un vrai environnement dès le premier jour.

**Critères d'acceptation :**

**Étant donné** qu'on exécute `npx create-next-app@latest ilovecards --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` et qu'on installe les dépendances (prisma, @prisma/client, next-auth, @auth/prisma-adapter, resend, @anthropic-ai/sdk, @ducanh2912/next-pwa, recharts, zod)
**Quand** `npm run build` est exécuté
**Alors** le build passe sans erreur et la structure de fichiers correspond à l'architecture (src/app/, src/lib/, src/components/, src/features/)

**Étant donné** que le repo est connecté à GitHub
**Quand** un commit est poussé sur `main`
**Alors** Vercel déploie automatiquement en production (FR33)

**Étant donné** que Vercel est connecté
**Quand** une erreur applicative se produit en prod
**Alors** elle apparaît dans les logs Vercel (FR34)

**Étant donné** que shadcn/ui est configuré (components.json)
**Quand** un composant est ajouté via CLI
**Alors** il est placé dans `src/components/ui/`

**Étant donné** que `.env.example` existe
**Quand** on le consulte
**Alors** il liste toutes les variables requises : DATABASE_URL, NEXTAUTH_SECRET, AUTH_RESEND_KEY, ANTHROPIC_API_KEY

### Story 1.2 : Base de données & schema Auth

En tant que développeur,
je veux la base de données initialisée avec les tables Auth.js,
afin que les sessions et tokens puissent être persistés.

**Critères d'acceptation :**

**Étant donné** que DATABASE_URL pointe vers Neon
**Quand** `prisma migrate dev` est exécuté
**Alors** les tables User, Account, Session, VerificationToken existent dans la base de données

**Étant donné** que la migration a réussi
**Quand** `prisma generate` est exécuté
**Alors** @prisma/client expose les types TypeScript corrects

**Étant donné** `src/lib/prisma.ts`
**Quand** il est importé dans l'app
**Alors** il exporte un singleton PrismaClient (pas de connexions multiples en dev)

**Étant donné** que la connection string Neon utilise le pooler URL
**Quand** une fonction serverless Vercel s'exécute
**Alors** le connection pooling est actif (pas d'erreur "too many connections")

### Story 1.3 : Authentification magic link

En tant qu'utilisateur,
je veux créer un compte et me connecter via un magic link envoyé à mon email,
afin d'accéder à ilovecards sans mot de passe.

**Critères d'acceptation :**

**Étant donné** que je suis sur la page de login
**Quand** je saisis mon email et soumets le formulaire
**Alors** Auth.js envoie un magic link par email via Resend en moins de 30 secondes (FR1, FR2)

**Étant donné** que je clique sur le magic link
**Quand** le token est valide et non utilisé
**Alors** je suis authentifié et redirigé vers le dashboard (NFR7 — token à usage unique)

**Étant donné** que je clique sur un magic link déjà utilisé
**Alors** je vois un message d'erreur et je ne suis pas authentifié

**Étant donné** que je suis authentifié
**Quand** j'accède à une route `(app)/*` ou `/api/*`
**Alors** le middleware vérifie ma session et j'accède à la ressource (NFR5 — HTTPS)

**Étant donné** que je ne suis pas authentifié
**Quand** j'essaie d'accéder à une route protégée
**Alors** je suis redirigé vers la page de login

**Étant donné** qu'Auth.js utilise les sessions BDD (pas JWT)
**Quand** ma session est active
**Alors** un enregistrement existe dans la table Session lié à mon User

### Story 1.4 : Gestion du compte — suppression & export

En tant qu'utilisateur,
je veux supprimer définitivement mon compte ou exporter mes données,
afin d'avoir le contrôle total sur mes informations personnelles.

**Critères d'acceptation :**

**Étant donné** que je suis sur la page compte et confirme la suppression
**Quand** `DELETE /api/account` est appelé avec une session valide
**Alors** toutes mes données (User, decks, cartes, reviews, sessions) sont supprimées en cascade Prisma dans une transaction unique (FR3, NFR8)

**Étant donné** que mon compte est supprimé
**Quand** Auth.js tente de vérifier ma session
**Alors** la session est invalide et je suis déconnecté immédiatement

**Étant donné** que je clique "Exporter mes données"
**Quand** `GET /api/export` est appelé avec une session valide
**Alors** je reçois un fichier JSON contenant tous mes decks et cartes (nom, description, couleur, cards avec notion/développement/source/template) (FR4)

**Étant donné** que `DELETE /api/account` ou `GET /api/export` est appelé sans session valide
**Alors** le handler retourne 401 UNAUTHORIZED

---

## Epic 2 : Gestion des Decks & Cartes

Un utilisateur peut créer des decks, y ajouter des cartes manuellement avec un choix parmi 8 templates visuels distincts, voir les aperçus, et gérer decks et cartes.

**FRs :** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13

### Story 2.1 : Création et gestion des decks

En tant qu'utilisateur,
je veux créer, modifier et supprimer des decks avec un nom, une description optionnelle et une couleur d'accent,
afin d'organiser mes cartes par sujet.

**Critères d'acceptation :**

**Étant donné** que je tape "Nouveau deck" et remplis le formulaire (nom requis, description optionnelle, couleur d'accent)
**Quand** je valide
**Alors** un deck est créé via `POST /api/decks` et apparaît dans ma liste (FR5)

**Étant donné** que j'ouvre un deck existant et tape "Modifier"
**Quand** je mets à jour le nom, la description ou la couleur et sauvegarde
**Alors** `PUT /api/decks/[id]` persiste les changements (FR6)

**Étant donné** que je tape "Supprimer" sur un deck et confirme
**Quand** `DELETE /api/decks/[id]` est appelé
**Alors** le deck et toutes ses cartes sont supprimés (FR7)

**Étant donné** que j'ai plusieurs decks
**Quand** je consulte ma liste via `GET /api/decks`
**Alors** chaque deck affiche son nom, sa couleur d'accent et le nombre de cartes dues aujourd'hui (FR8)

**Étant donné** que `POST /api/decks` est appelé avec un nom vide
**Quand** la validation Zod s'exécute
**Alors** le handler retourne 400 INVALID_INPUT

**Étant donné** que tout appel sur `/api/decks` est fait sans session valide
**Alors** le handler retourne 401 UNAUTHORIZED

### Story 2.2 : Composant CardRenderer & 8 templates CSS

En tant qu'utilisateur,
je veux que mes cartes soient rendues avec des templates visuellement distincts,
afin que chaque template active une mémoire visuelle différente et que l'esthétique soit immédiatement attractive.

**Critères d'acceptation :**

**Étant donné** que `<CardRenderer>` reçoit une carte + prop `size='thumb'`
**Alors** la carte est rendue en miniature (pour le TemplatePicker)

**Étant donné** que `<CardRenderer>` reçoit une carte + prop `size='preview'`
**Alors** la carte est rendue à taille moyenne (pour la validation IA)

**Étant donné** que `<CardRenderer>` reçoit une carte + prop `size='full'`
**Alors** la carte est rendue plein écran (pour la session de révision)

**Étant donné** les 8 templates (poster, quote, magazine, color-block, photo-overlay, minimaliste, equation, sature)
**Quand** chacun est rendu
**Alors** il est visuellement distinct des autres — layout, typographie et traitement des couleurs différents

**Étant donné** que la classe CSS 'flipped' est appliquée au conteneur de carte
**Quand** l'animation se déclenche
**Alors** `transform: rotateY(180deg)` s'anime à 60fps (NFR1) et `backface-visibility: hidden` empêche le recto de transparaître

**Étant donné** qu'une carte est rendue sur mobile (iOS Safari, Android Chrome)
**Quand** le template est affiché en taille 'full'
**Alors** il occupe ~85% de la hauteur d'écran avec un ratio ~9/14

### Story 2.3 : Création d'une carte avec sélecteur de template

En tant qu'utilisateur,
je veux créer une carte manuellement et choisir son template parmi des aperçus visuels,
afin de concevoir l'expérience visuelle de chaque carte dès la création.

**Critères d'acceptation :**

**Étant donné** que je suis sur la page "Nouvelle carte"
**Quand** je remplis le champ notion (requis), développement et source (optionnels)
**Alors** la validation Zod s'applique correctement (notion ≥ 1 char, ≤ 500)

**Étant donné** que je suis dans le TemplatePicker
**Quand** je parcours les 8 templates
**Alors** chacun affiche un aperçu via `<CardRenderer size="thumb">` (FR11)

**Étant donné** que je sélectionne un template et sauvegarde
**Quand** `POST /api/cards` est appelé
**Alors** la carte est persistée avec le template choisi et apparaît dans la liste du deck (FR9, FR10)

**Étant donné** que `POST /api/cards` est appelé avec un template hors enum
**Alors** le handler retourne 400 INVALID_INPUT

**Étant donné** que `POST /api/cards` est appelé sans session valide
**Alors** le handler retourne 401 UNAUTHORIZED

### Story 2.4 : Modification et suppression de cartes

En tant qu'utilisateur,
je veux modifier ou supprimer mes cartes existantes,
afin de corriger des erreurs ou retirer des cartes qui ne me servent plus.

**Critères d'acceptation :**

**Étant donné** que je suis sur la page d'édition d'une carte
**Quand** je modifie la notion, le développement, la source ou le template et sauvegarde
**Alors** `PUT /api/cards/[id]` persiste les changements et je les vois immédiatement (FR12)

**Étant donné** que je tape "Supprimer" sur une carte et confirme
**Quand** `DELETE /api/cards/[id]` est appelé
**Alors** la carte est retirée du deck et exclue des futures sessions de révision (FR13)

**Étant donné** que `PUT` ou `DELETE /api/cards/[id]` est appelé sur une carte n'appartenant pas aux decks de l'utilisateur courant
**Alors** le handler retourne 403 FORBIDDEN

---

## Epic 3 : Session de Révision

Un utilisateur peut démarrer une session avec ses cartes dues, les réviser avec les 4 gestes, et l'algorithme SM-2 calcule les prochains intervalles.

**FRs :** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27 | **NFRs :** NFR1, NFR2

### Story 3.1 : Moteur SM-2 — fonction pure & tests

En tant que développeur,
je veux une implémentation SM-2 pure et testée,
afin que tous les calculs d'intervalles soient corrects et isolés de l'interface.

**Critères d'acceptation :**

**Étant donné** que `src/lib/sm2.ts` exporte `calculateNextReview(card: CardState, action: 'pass' | 'dismiss' | 'fail'): ReviewResult`
**Quand** action est `'dismiss'` (geste haut — carte connue)
**Alors** nextIntervalDays est significativement plus long que l'interval actuel (qualité SM-2 ≥ 4)

**Quand** action est `'fail'` (geste bas — pas retenu)
**Alors** nextIntervalDays est 1 (qualité SM-2 ≤ 1)

**Quand** action est `'pass'` (geste gauche — gardée en rotation)
**Alors** l'interval de la carte est inchangé (neutre, non noté)

**Étant donné** `src/lib/sm2.test.ts`
**Quand** tous les cas de test s'exécutent
**Alors** ils passent tous (première révision, révisions multiples correctes, révision après échec, facteur d'aisance plancher à 1.3)

### Story 3.2 : Session de révision — affichage et navigation

En tant qu'utilisateur,
je veux démarrer une session et naviguer dans mes cartes dues via des gestes,
afin de réviser dans une expérience fluide sans interface bouton.

**Critères d'acceptation :**

**Étant donné** que je navigue vers `/review`
**Quand** la page charge (Server Component)
**Alors** les cartes dues pour aujourd'hui sont chargées via Prisma et passées comme état initial au useReducer (FR20, NFR2 — < 2s)

**Étant donné** qu'une carte est affichée recto
**Quand** je swipe à gauche (geste ←)
**Alors** `dispatch('PASS')` est envoyé, la carte passe à la fin de la queue et la suivante s'affiche (FR21)

**Étant donné** qu'une carte est affichée recto
**Quand** je swipe à droite (geste →)
**Alors** `dispatch('FLIP')` déclenche l'animation CSS flip révélant le verso (FR22)

**Étant donné** que la carte est affichée (recto ou verso)
**Quand** elle est rendue
**Alors** `<CardRenderer size="full">` affiche le template de la carte (FR27)

**Étant donné** le GestureHandler
**Quand** un swipe est détecté (touchstart → touchend, Δx ou Δy > seuil)
**Alors** l'action correcte est dispatchée au useReducer sans bibliothèque d'animation tierce

### Story 3.3 : Session de révision — notation et persistance SM-2

En tant qu'utilisateur,
je veux noter mes cartes pendant la session (connues ou pas retenues),
afin que l'algorithme planifie ma prochaine révision au moment optimal.

**Critères d'acceptation :**

**Étant donné** qu'une carte est affichée (recto ou verso)
**Quand** je swipe en haut (geste ↑)
**Alors** `dispatch('DISMISS')` est envoyé, `calculateNextReview(card, 'dismiss')` est appelé, `POST /api/review` sauvegarde le résultat, et la carte est retirée de la queue (FR23, FR24, FR26)

**Étant donné** qu'une carte est affichée verso
**Quand** je swipe en bas (geste ↓)
**Alors** `dispatch('FAILED')` est envoyé, `calculateNextReview(card, 'fail')` est appelé, `POST /api/review` sauvegarde le résultat, et la carte est remise rapidement en rotation (FR25, FR26)

**Étant donné** que `POST /api/review` est appelé avec une requête valide
**Alors** nextReviewAt, intervalDays et easeFactor de la carte sont mis à jour dans la table Review via Prisma

**Étant donné** que `POST /api/review` est appelé sans session valide
**Alors** le handler retourne 401 UNAUTHORIZED

**Étant donné** que toutes les cartes sont traitées
**Quand** la dernière carte est écartée ou remise en rotation
**Alors** un écran de résumé de session est affiché (cartes vues, écartées, ratées)

---

## Epic 4 : Extraction IA

Un utilisateur peut coller un document, voir les cartes candidates générées en streaming, les valider une à une et enregistrer les retenues.

**FRs :** FR14, FR15, FR16, FR17, FR18, FR19 | **NFRs :** NFR3, NFR6

### Story 4.1 : Interface d'import et validation de taille

En tant qu'utilisateur,
je veux coller un document dans une interface d'import et voir immédiatement si sa taille est acceptable,
afin de savoir à quoi m'attendre avant de lancer l'IA.

**Critères d'acceptation :**

**Étant donné** que je suis sur la page d'import d'un deck
**Quand** je colle du texte dans l'ImportForm
**Alors** le nombre de caractères est affiché en temps réel

**Étant donné** que je colle un document dépassant 50 000 caractères
**Quand** je soumets le formulaire
**Alors** le serveur retourne 400 DOCUMENT_TOO_LARGE avec un message clair (FR19)
**Et** aucun appel Anthropic n'est effectué (NFR6)

**Étant donné** que je colle un document valide (≤ 50 000 caractères) et soumets
**Alors** le formulaire passe en état ExtractionProgress et la requête `POST /api/extract` est initiée (FR14)

**Étant donné** que le body de `POST /api/extract` est vide ou manquant
**Quand** Zod valide la requête
**Alors** le handler retourne 400 INVALID_INPUT

### Story 4.2 : Pipeline d'extraction IA en streaming

En tant qu'utilisateur,
je veux voir les cartes candidates apparaître progressivement pendant que l'IA traite mon document,
afin que l'attente de 15 secondes ressemble à une progression active plutôt qu'à un écran figé.

**Critères d'acceptation :**

**Étant donné** qu'un document valide est soumis à `POST /api/extract`
**Quand** l'appel Claude Haiku 4.5 démarre
**Alors** le Route Handler retourne un ReadableStream avec Content-Type: text/event-stream (FR15)

**Étant donné** que le stream est actif
**Quand** Claude identifie une notion et propose une carte
**Alors** un chunk JSON CardCandidate est poussé dans le stream et `ExtractionProgress` met à jour l'UI avec la nouvelle carte (NFR3 — feedback visible)

**Étant donné** qu'un CardCandidate est reçu
**Quand** il est inspecté
**Alors** il contient : notion, template suggéré par l'IA (FR16), développement optionnel

**Étant donné** que le stream est complété
**Quand** tous les candidats sont reçus
**Alors** la `ValidationQueue` est affichée avec tous les candidats pour review (FR17, FR18)

**Étant donné** que ANTHROPIC_API_KEY est absente ou invalide
**Quand** le Route Handler appelle Anthropic
**Alors** il retourne 500 INTERNAL_ERROR — la clé n'est jamais exposée au client (NFR6)

### Story 4.3 : Validation carte par carte et enregistrement

En tant qu'utilisateur,
je veux examiner chaque carte candidate, l'accepter, la rejeter ou la modifier, puis enregistrer les retenues dans mon deck,
afin de maintenir un engagement cognitif actif avec mon matériel d'apprentissage.

**Critères d'acceptation :**

**Étant donné** que la ValidationQueue est affichée
**Quand** j'examine une carte candidate
**Alors** je peux l'accepter (ajout à la liste "à sauvegarder"), la rejeter (retrait de la queue) ou modifier inline sa notion/développement/template (FR17)

**Étant donné** que je clique "Valider et enregistrer"
**Quand** au moins une carte est acceptée
**Alors** `POST /api/cards` est appelé pour chaque carte acceptée et elles sont sauvegardées dans le deck cible (FR18)

**Étant donné** que tous les candidats sont rejetés
**Quand** j'essaie de valider
**Alors** le bouton est désactivé avec le message "Aucune carte à enregistrer"

**Étant donné** que `POST /api/cards` est appelé sans session valide pour chaque carte à sauvegarder
**Alors** le handler retourne 401 UNAUTHORIZED

---

## Epic 5 : Dashboard & Progression

Un utilisateur peut voir ses cartes dues, son streak et la courbe de rétention de ses decks.

**FRs :** FR28, FR29, FR30

### Story 5.1 : Cartes dues et streak de révision

En tant qu'utilisateur,
je veux voir combien de cartes sont dues aujourd'hui et mon streak de révision actuel,
afin de rester motivé et de savoir d'un coup d'œil ce qui nécessite mon attention.

**Critères d'acceptation :**

**Étant donné** que je suis sur le dashboard
**Quand** la page charge (Server Component)
**Alors** une requête Prisma compte les cartes où `nextReviewAt ≤ aujourd'hui`, groupées par deck (FR28)
**Et** le total de cartes dues est affiché en évidence avec la répartition par deck

**Étant donné** que j'ai révisé des cartes N jours consécutifs
**Quand** je consulte le dashboard
**Alors** mon badge streak affiche N jours (FR29)

**Étant donné** que je rate un jour de révision
**Quand** j'ouvre l'app le lendemain
**Alors** mon streak est remis à 0 (ou 1 si je révise ce jour-là)

**Étant donné** qu'aucune carte n'est due aujourd'hui
**Quand** je consulte le dashboard
**Alors** je vois "Aucune carte due — bonne journée !" avec le streak toujours affiché

### Story 5.2 : Courbe de rétention

En tant qu'utilisateur,
je veux voir la courbe de rétention de mes decks dans le temps,
afin de mesurer si mon apprentissage s'ancre vraiment.

**Critères d'acceptation :**

**Étant donné** que je suis sur le dashboard
**Quand** le composant `<RetentionChart>` charge
**Alors** un LineChart recharts affiche le pourcentage de cartes correctement révisées par jour sur les 30 derniers jours (FR30)

**Étant donné** qu'un deck est sélectionné dans le filtre
**Quand** le filtre change
**Alors** le graphique se met à jour pour afficher uniquement la rétention de ce deck

**Étant donné** que moins de 3 sessions de révision ont eu lieu
**Quand** le graphique serait affiché
**Alors** un message s'affiche : "Pas encore assez de données — revenez après quelques sessions"

**Étant donné** que la rétention est calculée côté serveur
**Quand** la formule est vérifiée
**Alors** elle utilise la table Review : (cartes écartées / total cartes révisées ce jour) × 100

---

## Epic 6 : PWA & Mode Offline

Un utilisateur peut installer l'app sur son téléphone et réviser sans connexion les sessions déjà chargées.

**FRs :** FR31, FR32 | **NFRs :** NFR4

### Story 6.1 : Installation PWA sur iOS et Android

En tant qu'utilisateur,
je veux installer ilovecards sur l'écran d'accueil de mon téléphone,
afin de l'ouvrir comme une app native sans passer par le navigateur.

**Critères d'acceptation :**

**Étant donné** que `@ducanh2912/next-pwa` est configuré dans `next.config.ts`
**Quand** l'app est servie en HTTPS
**Alors** un service worker est enregistré et actif dans le navigateur (FR31)

**Étant donné** que `public/manifest.json` est présent
**Quand** on l'inspecte
**Alors** il contient : name "ilovecards", short_name "ilovecards", icons (192×192 et 512×512), display "standalone", theme_color, background_color, start_url "/"

**Étant donné** que j'ouvre l'app dans iOS Safari
**Quand** les critères PWA sont remplis
**Alors** je peux ajouter ilovecards à mon écran d'accueil via le menu Partager

**Étant donné** que j'ouvre l'app dans Android Chrome
**Quand** les critères PWA sont remplis
**Alors** le navigateur affiche une bannière "Ajouter à l'écran d'accueil"

### Story 6.2 : Mode offline pour les sessions chargées

En tant qu'utilisateur,
je veux réviser mes cartes hors ligne quand j'ai déjà chargé une session,
afin d'étudier n'importe où sans dépendre d'une connexion réseau.

**Critères d'acceptation :**

**Étant donné** que j'ai chargé la page de révision en ligne
**Quand** le service worker a mis en cache la page et les données de cartes
**Alors** je peux ouvrir l'app et démarrer une session hors ligne (FR32)

**Étant donné** que je révise hors ligne
**Quand** j'effectue des gestes (passer, flip, écarter, pas retenu)
**Alors** l'état de session est maintenu localement dans le useReducer

**Étant donné** que je complète une session hors ligne
**Quand** ma connexion est rétablie
**Alors** les `POST /api/review` en attente sont envoyés au serveur (ou un indicateur "sync en attente" est affiché clairement)

**Étant donné** que la stratégie de cache du service worker est configurée
**Quand** une page sous `(app)/review/*` est demandée
**Alors** elle utilise une stratégie cache-first pour le shell de page
**Et** les données initiales de cartes sont pré-fetchées et mises en cache lors de la navigation vers la page de révision en ligne (NFR4)

**Étant donné** que j'essaie d'accéder à une autre page (dashboard, decks) hors ligne
**Alors** je vois un message offline plutôt qu'une page blanche
