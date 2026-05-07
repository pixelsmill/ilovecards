---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-05-07'
lastStep: 8
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'markdeck'
user_name: 'Hubert'
date: '2026-05-07'
---

# Architecture Decision Document

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées au fil des décisions architecturales._

## Analyse du Contexte Projet

### Vue d'ensemble des exigences

**Exigences fonctionnelles — 34 FRs en 7 domaines :**

| Domaine | FRs | Implications architecturales |
|---|---|---|
| Auth & Compte | FR1–FR4 | Magic link (NextAuth), suppression RGPD complète |
| Gestion Decks | FR5–FR8 | CRUD standard, couleur d'accent par deck |
| Gestion Cartes | FR9–FR13 | CRUD + sélecteur de template avec preview |
| Import & Extraction IA | FR14–FR19 | Pipeline LLM serveur-side, validation UI carte par carte |
| Session de Révision | FR20–FR27 | Gestes JS vanilla + CSS, SM-2, flip 3D, logique client-side |
| Dashboard & Progression | FR28–FR30 | Agrégats temporels (streak, rétention), queries optimisées |
| PWA & Offline | FR31–FR32 | Service worker, cache strategy, manifest |

**Exigences non-fonctionnelles critiques :**
- Animations à 60fps sur iOS Safari et Android Chrome — contrainte stricte
- Session charge en <2s sur connexion mobile
- Extraction IA répond en <15s — feedback de progression obligatoire
- Clé API Anthropic exclusivement serveur-side
- Suppression de compte irréversible et complète (RGPD)

### Contraintes techniques et décisions déjà actées

Éléments fixés et non négociables :
- **Framework** : Next.js 15 (App Router, MPA — rendu serveur par route)
- **ORM / BDD** : Prisma + Postgres hébergé sur Neon
- **Authentification** : Auth.js (NextAuth) magic link via Resend
- **LLM** : Anthropic Claude Haiku 4.5 — appel exclusivement serveur-side
- **Animations** : CSS pur (`transform: rotateY()`, `backface-visibility`) + gestes JS vanilla
- **PWA** : next-pwa (service worker + manifest)
- **Hébergement** : Vercel (déploiement continu dès J1)
- **Stack CSS** : Tailwind CSS

### Complexité & Échelle

- **Complexité** : Moyenne — bien scopé, deux surfaces client très différentes
- **Domaine principal** : Full-stack web (Next.js) + PWA mobile-first
- **Utilisateur unique en v1** : pas de multi-tenant, pas de temps réel, pas de collaboration

**Composants architecturaux identifiés :**
1. Couche Auth (NextAuth magic link + gestion sessions)
2. API REST interne (Route Handlers Next.js — sert PWA et future Skill)
3. Pipeline d'extraction IA (document → Claude → JSON structuré → validation)
4. Moteur SM-2 (fonction pure, serveur-side)
5. Session de révision (client-side : gestes, flip, animations CSS)
6. Système de templates de cartes (rendu partagé : création, validation, session)
7. PWA + cache offline (service worker, stratégie de cache)
8. Dashboard / analytics (agrégats streak, rétention)

### Préoccupations transversales

- **Auth** : session NextAuth sur toutes les routes protégées
- **Rendu des cartes** : composant de carte partagé en 3 contextes — sélecteur (miniature), validation IA (preview), session (plein écran)
- **Gestion d'erreurs LLM** : timeout, réponse malformée, dépassement de limite de taille
- **Stratégie offline** : données cachées, politique d'invalidation
- **Dual auth futur** : session NextAuth (PWA) + clé API (Skill post-MVP) — Route Handlers doivent accepter les deux modes

## Starter Template

### Domaine technologique principal

Full-stack Next.js 15 (App Router, MPA, PWA) — starter officiel `create-next-app`.

### Commande d'initialisation

```bash
npx create-next-app@latest markdeck \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Décisions architecturales prises par le starter

**Langage & Runtime :**
- TypeScript strict, configuration Next.js 15 par défaut
- Turbopack comme dev server (défaut Next.js 15)

**Styling :**
- Tailwind CSS configuré (postcss + tailwind.config.ts)

**Structure de projet :**
- `src/` directory — sépare le code applicatif de la config racine
- `src/app/` — App Router (layouts, pages, Route Handlers)
- Import alias `@/*` → `src/*`

**Outillage :**
- ESLint (next/core-web-vitals)
- Git initialisé automatiquement

### Dépendances à ajouter après initialisation

| Dépendance | Usage |
|---|---|
| `prisma` + `@prisma/client` | ORM + types |
| `next-auth` (Auth.js v5) | Magic link auth |
| `@auth/prisma-adapter` | Adaptateur NextAuth ↔ Prisma |
| `resend` | Envoi des emails magic link |
| `@anthropic-ai/sdk` | Extraction IA (Claude Haiku 4.5) |
| `@ducanh2912/next-pwa` | Service worker + manifest PWA (fork maintenu pour Next.js 13+) |
| `recharts` | Courbe de rétention dashboard |
| `bcryptjs` | Hash des clés API (post-MVP) |

**Note :** L'initialisation du projet avec cette commande constitue la première story d'implémentation.

## Décisions Architecturales Clés

### Analyse des priorités

**Décisions critiques (bloquent l'implémentation) :**
- Sessions BDD Auth.js — révocation RGPD immédiate requise par FR3
- Format d'erreur API standardisé — cohérence entre tous les Route Handlers

**Décisions importantes (structurent l'architecture) :**
- Zod pour la validation — inférence TypeScript end-to-end
- useReducer pour la session de révision — état complexe, surface isolée
- shadcn/ui pour les primitives — accessibilité Radix, surcharge Tailwind

**Décisions déférées (post-MVP) :**
- Rate limiting API — surveillance manuelle du dashboard Anthropic en v1
- Hash des clés API (`bcryptjs`) — uniquement pour l'auth Skill post-MVP

---

### Data Architecture

**Validation des données — Zod**

Zod est la bibliothèque de validation TypeScript-first standard dans l'écosystème Next.js 15. Utilisé à deux niveaux :
- Validation des corps de requête dans tous les Route Handlers
- Inférence de types depuis les schémas (pas de duplication type/schema)

```typescript
// Exemple — création de carte
const CreateCardSchema = z.object({
  deckId: z.string().cuid(),
  notion: z.string().min(1).max(500),
  developpement: z.string().max(2000).optional(),
  source: z.string().max(200).optional(),
  template: z.enum(['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature']),
})
type CreateCardInput = z.infer<typeof CreateCardSchema>
```

**Sessions Auth.js — Sessions BDD (Prisma Adapter)**

Mode : sessions base de données via `@auth/prisma-adapter` (pas JWT).

Raison : la suppression de compte (FR3 / RGPD) doit invalider les sessions immédiatement. Les JWT restent valides jusqu'à expiration même après suppression du compte — incompatible avec l'exigence d'effacement irréversible.

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [Resend({ ... })],
})
```

**Limite de taille document IA :** 50 000 caractères max — validée côté serveur avant appel LLM (FR19).

---

### Authentication & Sécurité

**Magic link via Resend**

Auth.js v5 avec provider Email (Resend). Token usage unique, expiration configurée. Aucun mot de passe stocké.

**Protection des routes**

Middleware Next.js (`src/middleware.ts`) vérifie la session Auth.js sur toutes les routes `/app/*` et `/api/*`. Les routes publiques (`/`, `/auth/*`) sont explicitement exclues.

**Sécurité LLM**

`ANTHROPIC_API_KEY` exclusivement en variable d'environnement serveur. Jamais exposée dans le bundle client. Validation de la taille du document côté serveur avant tout appel (50k chars).

**Suppression RGPD (FR3)**

Cascade Prisma sur `User` → `Deck` → `Card` → `Review`. Session détruite avant suppression de l'enregistrement utilisateur. Irréversible, aucun soft-delete.

---

### API & Communication

**Pattern Route Handlers Next.js**

REST pur via `src/app/api/` Route Handlers. Pas de GraphQL en MVP. Structure :

```
src/app/api/
  decks/route.ts          GET (list), POST (create)
  decks/[id]/route.ts     GET, PUT, DELETE
  cards/route.ts          POST
  cards/[id]/route.ts     PUT, DELETE
  extract/route.ts        POST (pipeline IA)
  review/route.ts         POST (soumettre résultat SM-2)
  export/route.ts         GET (export RGPD)
  account/route.ts        DELETE (suppression compte)
```

**Format d'erreur standardisé**

```typescript
// Toutes les erreurs API retournent ce format
type ApiError = { error: string; code?: string }

// Exemples
{ error: "Document trop volumineux", code: "DOCUMENT_TOO_LARGE" }    // 400
{ error: "Non authentifié", code: "UNAUTHORIZED" }                    // 401
{ error: "Deck introuvable", code: "DECK_NOT_FOUND" }                 // 404
{ error: "Erreur serveur", code: "INTERNAL_ERROR" }                   // 500
```

Un helper `apiError(code, message, status)` partagé dans `src/lib/api-error.ts`.

**Extraction IA — réponse en streaming**

`POST /api/extract` retourne un `ReadableStream` (pas un JSON statique). Le route handler envoie les `CardCandidate` au fur et à mesure que Claude les génère. `ExtractionProgress.tsx` consomme le stream via `fetch` + `response.body.getReader()`. Vercel supporte le streaming natif sur les Edge et Node runtimes.

```typescript
// Structure du stream — chaque chunk est un CardCandidate JSON sérialisé
// Le client reconstruit le tableau progressivement
export async function POST(req: Request) {
  // ... validation Zod, auth check
  const stream = new ReadableStream({ start(controller) {
    // appel Anthropic en streaming → push CardCandidate à chaque notion extraite
  }})
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
```

**Dual auth (préparation post-MVP)**

Les Route Handlers vérifient d'abord la session NextAuth, puis (post-MVP) une clé API en header `Authorization: Bearer <key>`. L'interface de vérification est abstraite pour faciliter l'ajout du second mode.

---

### Frontend Architecture

**MPA — Server Components par défaut**

Toutes les routes sont des Server Components React. Les données sont fetchées côté serveur (Prisma direct dans les Server Components ou via des Server Actions). Pas de SWR ni React Query en MVP — les fetches client restent des `fetch()` ponctuels.

**State management — Session de révision (useReducer)**

La session de révision (FR20–FR27) est la seule vue entièrement client-side. Son état est géré par un `useReducer` local :

```typescript
type SessionState = {
  queue: Card[]        // cartes restantes
  current: Card | null
  side: 'recto' | 'verso'
  sessionStats: { passed: number; dismissed: number; failed: number }
}

type SessionAction =
  | { type: 'PASS' }           // ← gauche
  | { type: 'FLIP' }           // → droite (recto → verso)
  | { type: 'DISMISS' }        // ↑ haut (interval long)
  | { type: 'FAILED' }         // ↓ bas (revoir vite)
```

Les résultats sont envoyés au serveur (`POST /api/review`) à chaque action de notation.

**Composants UI — shadcn/ui + Tailwind custom**

- **shadcn/ui** pour les primitives d'interface : Dialog, Select, Button, Sheet, Toast — composants Radix UI copiés dans `src/components/ui/`, accessibilité incluse, stylés en Tailwind.
- **CSS custom** pour tous les templates de cartes et les animations de la session — pas de lib d'animation tierce.
- **Composant `<CardRenderer>`** partagé dans 3 contextes : sélecteur de template (miniature), validation IA (preview), session de révision (plein écran). Prop `size: 'thumb' | 'preview' | 'full'`.

**Dépendances supplémentaires**

| Dépendance | Usage |
|---|---|
| `zod` | Validation schémas |
| `shadcn/ui` (CLI) | Primitives UI |
| `@radix-ui/*` | Installé par shadcn |

---

### Infrastructure & Déploiement

**Vercel — déploiement continu**

- `main` → production automatique
- Branches → preview deployments automatiques
- Variables d'environnement gérées dans le dashboard Vercel

**Variables d'environnement requises**

```
DATABASE_URL          # Neon connection string
NEXTAUTH_SECRET       # Secret Auth.js (≥32 chars)
AUTH_RESEND_KEY       # Clé API Resend
ANTHROPIC_API_KEY     # Clé Anthropic (server-only)
NEXTAUTH_URL          # URL de prod (auto sur Vercel)
```

**Monitoring MVP**

Logs applicatifs via le dashboard Vercel (FR34). Pas de Sentry ni Datadog en v1 — surveillance manuelle des erreurs et du dashboard Anthropic pour les coûts LLM.

**Base de données**

Neon Postgres — connection pooling activé (PgBouncer) pour Vercel serverless. `DATABASE_URL` = connection pooler URL. Migrations via `prisma migrate deploy` en CI.

---

### Analyse d'impact — Dépendances entre décisions

**Séquence d'implémentation imposée par les décisions :**
1. Setup Prisma schema + migrations (Zod schemas en découlent)
2. Auth.js sessions BDD (dépend du schema Prisma — tables `Session`, `User`, `VerificationToken`)
3. Middleware auth (protège toutes les routes avant les features)
4. Route Handlers + helper `apiError` (pattern commun avant chaque feature)
5. `<CardRenderer>` + templates CSS (bloque création, validation IA et session)
6. `useReducer` session de révision (dépend de CardRenderer + API review)

**Composant `<CardRenderer>` — point de couplage fort**

Trois features en dépendent (création, extraction IA, session). Doit être implémenté tôt et stable avant les features qui l'utilisent.

## Patterns d'Implémentation & Règles de Cohérence

### Nommage

**Fichiers & répertoires :**
- Répertoires : `kebab-case` (`src/app/decks/`, `src/components/card-renderer/`)
- Composants React : `PascalCase.tsx` (`CardRenderer.tsx`, `DeckList.tsx`)
- Utilitaires & libs : `kebab-case.ts` (`sm2.ts`, `api-error.ts`)
- Route Handlers : `route.ts` (convention Next.js, immuable)
- Hooks custom : `use-*.ts` (`use-session-reducer.ts`)

**BDD (Prisma) :**
- Modèles : PascalCase singulier (`User`, `Deck`, `Card`, `Review`)
- Champs : camelCase (`deckId`, `nextReviewAt`, `intervalDays`)
- Prisma gère la conversion vers snake_case en DB

**Templates de cartes — enum de référence :**
```
'poster' | 'quote' | 'magazine' | 'color-block' | 'photo-overlay' | 'minimaliste' | 'equation' | 'sature'
```
Utilisé partout : schéma Zod, enum Prisma, classes CSS (`card-poster`, `card-quote`, etc.).

---

### Structure du projet

```
src/
  app/
    (auth)/               # routes publiques (login, verify)
    (app)/                # routes protégées — layout avec middleware auth
      dashboard/
      decks/
        [id]/
          cards/
      review/
    api/                  # Route Handlers uniquement
  components/
    ui/                   # shadcn/ui — généré par CLI, ne pas modifier manuellement
    card-renderer/        # <CardRenderer> + templates CSS — partagé
    layout/               # Header, Nav, etc.
  features/               # logique métier par domaine
    decks/
    cards/
    review/
    extraction/
    dashboard/
  lib/
    prisma.ts             # singleton Prisma client
    auth.ts               # config Auth.js
    sm2.ts                # moteur SM-2 (fonction pure)
    api-error.ts          # helper apiError()
    schemas/              # schémas Zod partagés
```

---

### Quand utiliser Server Component vs `use client` vs Route Handler

| Besoin | Approche |
|---|---|
| Lire des données pour afficher une page | Server Component → Prisma direct |
| Mutation déclenchée par formulaire | Server Action (`'use server'`) |
| Mutation déclenchée par geste / événement JS | `fetch()` → Route Handler |
| Composant avec état local, événements touch | `'use client'` + hooks |
| Endpoint consommable par un client externe futur | Route Handler |

**Règle :** `'use client'` seulement quand indispensable. La page `/review/` est la seule vue entièrement client-side. Tout le reste est Server Components par défaut.

---

### Formats de données

- **Dates** : stockées en UTC (`DateTime @db.Timestamptz`), transmises en ISO 8601 (`"2026-05-07T14:30:00Z"`), formatées par le navigateur en UI
- **JSON API** : camelCase pour tous les champs (`deckId`, `nextReviewAt`, `cardCount`)
- **Booléens** : `true/false` — jamais `0/1`
- **IDs** : CUID2 (`@default(cuid())`) — jamais d'auto-increment exposé

---

### Tests

- Co-localisés avec le fichier testé : `sm2.ts` → `sm2.test.ts`
- Priorité MVP : `sm2.ts` (logique pure critique), schémas Zod, helper `apiError`
- Tests E2E : `src/e2e/` — post-MVP

---

### Patterns de process

**Auth — pattern obligatoire dans chaque Route Handler :**
```typescript
const session = await auth()
if (!session?.user?.id) {
  return apiError('UNAUTHORIZED', 'Non authentifié', 401)
}
```

**Accès BDD :** Prisma direct depuis les Server Components et Route Handlers. Pas de service layer intermédiaire en MVP.

**Loading states :** `loading.tsx` co-localisé dans chaque segment de route Next.js.

**Error boundaries :** `error.tsx` co-localisé par segment. Message générique à l'utilisateur, détail dans les logs serveur.

---

### Règles absolues — tous les agents

- Vérifier la session Auth.js avant toute opération dans un Route Handler
- Valider le body avec Zod avant tout traitement dans un Route Handler
- Aucun appel Anthropic côté client — exclusivement depuis les Route Handlers
- `<CardRenderer>` est le seul composant autorisé à rendre un template — pas de rendu inline ailleurs
- Toutes les suppressions de données utilisateur passent par cascade Prisma explicite

## Structure du Projet & Frontières

### Arborescence complète

```
markdeck/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json             # config shadcn/ui
├── .env.local                  # gitignored
├── .env.example
├── .gitignore
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # icônes PWA (192, 512px)
│   └── fonts/
│
└── src/
    ├── middleware.ts            # protection routes — (app)/* et /api/*
    │
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx           # root layout (PWA meta, fonts)
    │   │
    │   ├── (auth)/              # routes publiques
    │   │   ├── layout.tsx
    │   │   ├── page.tsx         # landing / login
    │   │   └── auth/
    │   │       └── [...nextauth]/route.ts
    │   │
    │   ├── (app)/               # routes protégées
    │   │   ├── layout.tsx       # nav + auth check
    │   │   ├── dashboard/
    │   │   │   └── page.tsx                        # FR28–FR30
    │   │   ├── decks/
    │   │   │   ├── page.tsx                        # liste decks — FR8
    │   │   │   ├── new/page.tsx                    # créer deck — FR5
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx                    # détail + liste cartes
    │   │   │       ├── edit/page.tsx               # modifier deck — FR6
    │   │   │       ├── cards/
    │   │   │       │   ├── new/page.tsx            # créer carte — FR9–FR11
    │   │   │       │   └── [cardId]/edit/page.tsx  # modifier carte — FR12
    │   │   │       └── import/page.tsx             # import IA — FR14–FR18
    │   │   ├── review/
    │   │   │   └── page.tsx                        # session révision — FR20–FR27 (use client)
    │   │   └── account/
    │   │       └── page.tsx                        # profil + suppression — FR3–FR4
    │   │
    │   └── api/
    │       ├── decks/
    │       │   ├── route.ts         # GET list, POST create
    │       │   └── [id]/route.ts    # GET, PUT, DELETE
    │       ├── cards/
    │       │   ├── route.ts         # POST create
    │       │   └── [id]/route.ts    # PUT, DELETE
    │       ├── extract/route.ts     # POST — pipeline IA
    │       ├── review/route.ts      # POST — résultat SM-2
    │       ├── export/route.ts      # GET — export RGPD
    │       └── account/route.ts     # DELETE — suppression compte
    │
    ├── components/
    │   ├── ui/                      # shadcn/ui — généré par CLI, ne pas modifier manuellement
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── select.tsx
    │   │   ├── sheet.tsx
    │   │   └── toast.tsx
    │   ├── card-renderer/           # composant partagé critique
    │   │   ├── CardRenderer.tsx     # prop size: 'thumb' | 'preview' | 'full'
    │   │   ├── card-renderer.css    # flip 3D, backface-visibility
    │   │   └── templates/
    │   │       ├── CardPoster.tsx
    │   │       ├── CardQuote.tsx
    │   │       ├── CardMagazine.tsx
    │   │       ├── CardColorBlock.tsx
    │   │       ├── CardPhotoOverlay.tsx
    │   │       ├── CardMinimaliste.tsx
    │   │       ├── CardEquation.tsx
    │   │       └── CardSature.tsx
    │   └── layout/
    │       ├── AppNav.tsx
    │       └── AppHeader.tsx
    │
    ├── features/
    │   ├── decks/
    │   │   ├── DeckForm.tsx
    │   │   ├── DeckList.tsx
    │   │   └── DeckCard.tsx
    │   ├── cards/
    │   │   ├── CardForm.tsx
    │   │   ├── CardList.tsx
    │   │   └── TemplatePicker.tsx   # sélecteur avec preview — FR10–FR11
    │   ├── review/
    │   │   ├── ReviewSession.tsx    # 'use client' — composant principal
    │   │   ├── GestureHandler.tsx   # touchstart/touchmove/touchend vanilla
    │   │   ├── CardFlip.tsx         # animation 3D CSS
    │   │   └── use-session-reducer.ts  # useReducer + SessionState/Action
    │   ├── extraction/
    │   │   ├── ImportForm.tsx           # paste document — FR14
    │   │   ├── ExtractionProgress.tsx   # feedback <15s — FR15
    │   │   └── ValidationQueue.tsx      # validation carte par carte — FR17–FR18
    │   └── dashboard/
    │       ├── DueCount.tsx             # FR28
    │       ├── StreakBadge.tsx           # FR29
    │       └── RetentionChart.tsx        # FR30 — recharts
    │
    └── lib/
        ├── prisma.ts                # singleton PrismaClient
        ├── auth.ts                  # config Auth.js v5
        ├── sm2.ts                   # moteur SM-2 (fonction pure)
        ├── sm2.test.ts
        ├── api-error.ts             # helper apiError()
        ├── api-error.test.ts
        └── schemas/
            ├── deck.ts              # schémas Zod Deck
            ├── card.ts              # schémas Zod Card
            ├── review.ts            # schémas Zod Review
            └── extract.ts           # schéma Zod import (max 50k chars)
```

---

### Frontières architecturales

**Frontière Auth** : `src/middleware.ts` est la seule porte d'entrée. Protège `(app)/*` et `/api/*`. Les Route Handlers ré-vérifient `await auth()` en premier (défense en profondeur).

**Frontière LLM** : `src/app/api/extract/route.ts` est le seul point d'appel Anthropic. Reçoit le texte brut, retourne `CardCandidate[]`. La clé API ne quitte jamais ce périmètre.

**Frontière `<CardRenderer>`** : seul composant autorisé à rendre un template. Utilisé dans `TemplatePicker` (thumb), `ValidationQueue` (preview), `ReviewSession` (full). Aucun rendu inline de template ailleurs.

---

### Flux de données principaux

**Session de révision :**
```
page.tsx (server) → charge les cartes dues (Prisma)
  → ReviewSession.tsx (use client) → useReducer
    → GestureHandler → dispatch(action)
      → CardFlip (animation CSS)
      → fetch POST /api/review → sm2.ts → Prisma update
```

**Extraction IA :**
```
ImportForm (paste texte) → fetch POST /api/extract
  → validation Zod (≤50k chars) → Anthropic SDK
  → CardCandidate[] → ExtractionProgress (feedback)
  → ValidationQueue (carte par carte)
  → fetch POST /api/cards (pour chaque carte acceptée)
```

---

### Mapping FR → répertoires

| Domaine FR | Répertoire principal |
|---|---|
| Auth & Compte (FR1–FR4) | `src/app/(auth)/`, `src/app/api/account/`, `src/lib/auth.ts` |
| Gestion Decks (FR5–FR8) | `src/features/decks/`, `src/app/(app)/decks/`, `src/app/api/decks/` |
| Gestion Cartes (FR9–FR13) | `src/features/cards/`, `src/components/card-renderer/` |
| Import & IA (FR14–FR19) | `src/features/extraction/`, `src/app/api/extract/` |
| Session Révision (FR20–FR27) | `src/features/review/`, `src/lib/sm2.ts`, `src/app/api/review/` |
| Dashboard (FR28–FR30) | `src/features/dashboard/`, `src/app/(app)/dashboard/` |
| PWA & Offline (FR31–FR32) | `public/manifest.json`, `next.config.ts` (`@ducanh2912/next-pwa` config) |

## Validation de l'Architecture

### Cohérence des décisions ✅

Toutes les technologies sont compatibles et sans conflits :
- Next.js 15 + Prisma + Neon + Auth.js v5 + `@auth/prisma-adapter` — stack éprouvée
- shadcn/ui construit sur Tailwind — intégration native, zéro friction
- Zod s'intègre directement avec TypeScript — pas de duplication type/schéma
- recharts rendu côté client uniquement — compatible avec l'approche MPA/Server Components
- `@ducanh2912/next-pwa` — fork maintenu compatible Next.js 15 (gap corrigé)
- Streaming Anthropic SDK — supporté nativement par Vercel (gap corrigé)

Les patterns sont cohérents avec les décisions : Server Components par défaut, `use client` isolé sur la session de révision, Prisma direct sans service layer, auth middleware + double vérification dans les handlers.

### Couverture des exigences ✅

**34 FRs — couverture complète :**

| Domaine | Statut |
|---|---|
| Auth & Compte (FR1–FR4) | ✅ magic link, sessions BDD, cascade RGPD, export |
| Gestion Decks (FR5–FR8) | ✅ CRUD + couleur d'accent |
| Gestion Cartes (FR9–FR13) | ✅ CRUD + TemplatePicker + CardRenderer |
| Import & IA (FR14–FR19) | ✅ pipeline streaming, ValidationQueue, limite Zod 50k |
| Session Révision (FR20–FR27) | ✅ 4 gestes, flip CSS 3D, useReducer, SM-2 server-side |
| Dashboard (FR28–FR30) | ✅ DueCount, StreakBadge, RetentionChart |
| PWA & Offline (FR31–FR32) | ✅ manifest, service worker |
| Administration (FR33–FR34) | ✅ Vercel CI/CD, logs platform |

**NFRs couverts :**
- Animations 60fps → CSS pur, aucun JS sur le chemin de rendu
- Session <2s → données pré-chargées en Server Component
- Extraction <15s → streaming + ExtractionProgress
- Clé Anthropic server-side → règle absolue documentée + frontière LLM
- Suppression RGPD → cascade Prisma + destruction session avant delete

### Lisibilité pour les agents IA ✅

**Checklist de complétude :**

- [x] Contexte projet analysé — 34 FRs en 7 domaines, contraintes NFR
- [x] Complexité et échelle évaluées — moyenne, utilisateur unique v1
- [x] Contraintes techniques identifiées — stack fixée, non négociable
- [x] Préoccupations transversales cartographiées — auth, CardRenderer, offline
- [x] Décisions critiques documentées — sessions BDD, Zod, shadcn/ui, useReducer
- [x] Stack technologique complet — avec versions et rationale
- [x] Patterns d'intégration définis — streaming extract, dual-auth préparé
- [x] Performance adressée — CSS pur, Server Components, streaming
- [x] Conventions de nommage établies — fichiers, BDD, templates, API
- [x] Patterns de structure définis — Server/Client/RouteHandler tableau de décision
- [x] Patterns de communication spécifiés — format erreur, dates ISO, camelCase
- [x] Patterns de process documentés — auth obligatoire, Zod obligatoire, CardRenderer exclusif
- [x] Arborescence complète définie — tous les fichiers significatifs
- [x] Frontières composants établies — Auth, LLM, CardRenderer
- [x] Points d'intégration cartographiés — flux révision, flux extraction
- [x] Mapping FR → répertoires complet

### Statut

**READY FOR IMPLEMENTATION**

Tous les gaps identifiés ont été résolus. Aucune décision bloquante ouverte.

**Forces de cette architecture :**
- Zéro ambiguïté pour les agents IA : chaque FR pointe vers un fichier précis
- Point de couplage `<CardRenderer>` bien isolé et documenté — le risque le plus élevé du projet
- Frontière LLM hermétique — sécurité et coûts maîtrisés
- Stack minimaliste : pas de surcouche inutile, chaque dépendance justifiée

**Amélioration future (post-MVP) :**
- Détailler la stratégie de cache service worker par route pattern
- Ajouter rate limiting sur `/api/extract` (coût LLM)
- Dual auth (clé API) pour le Skill Claude Code

### Handoff vers l'implémentation

**Première story :**
```bash
npx create-next-app@latest markdeck \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Ordre d'implémentation imposé par les dépendances :**
1. Prisma schema + migrations (socle de tout)
2. Auth.js v5 + sessions BDD + middleware
3. Helper `apiError` + schémas Zod de base
4. `<CardRenderer>` + 8 templates CSS (bloque 3 features)
5. CRUD decks + cartes
6. Pipeline extraction IA (streaming)
7. Session de révision (useReducer + gestes + SM-2)
8. Dashboard
9. PWA + offline
