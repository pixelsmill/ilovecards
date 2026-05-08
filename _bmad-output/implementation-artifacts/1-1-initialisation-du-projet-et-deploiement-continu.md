# Story 1.1 : Initialisation du projet & déploiement continu

Status: done

## Story

En tant que développeur/opérateur,
je veux que le projet soit initialisé et déployé sur Vercel,
afin que chaque story soit validée dans un vrai environnement dès le premier jour.

## Acceptance Criteria

1. `npx create-next-app@latest ilovecards --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` exécuté avec succès — structure de base présente
2. Dépendances installées : prisma, @prisma/client, next-auth, @auth/prisma-adapter, resend, @anthropic-ai/sdk, @ducanh2912/next-pwa, recharts, zod
3. shadcn/ui initialisé via CLI (`npx shadcn@latest init`) — `components.json` présent, composants ajoutés dans `src/components/ui/`
4. Structure de répertoires complète créée : `src/features/`, `src/lib/`, `src/components/card-renderer/`, `src/components/layout/`
5. `.env.example` liste toutes les variables requises : DATABASE_URL, NEXTAUTH_SECRET, AUTH_RESEND_KEY, ANTHROPIC_API_KEY
6. `npm run build` passe sans erreur
7. Repo connecté à GitHub, Vercel connecté au repo — push sur `main` déclenche un déploiement automatique (FR33)
8. Une erreur applicative volontaire dans les logs confirme qu'elle est visible dans le dashboard Vercel (FR34)

## Tasks / Subtasks

- [x] Initialiser le projet Next.js (AC: 1)
  - [x] Exécuter `npx create-next-app@latest ilovecards --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] Vérifier la structure générée : `src/app/`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  - [x] Supprimer le contenu de démonstration de `src/app/page.tsx` (remplacer par un placeholder simple)

- [x] Installer les dépendances (AC: 2)
  - [x] `npm install prisma @prisma/client`
  - [x] `npm install next-auth @auth/prisma-adapter`
  - [x] `npm install resend`
  - [x] `npm install @anthropic-ai/sdk`
  - [x] `npm install @ducanh2912/next-pwa`
  - [x] `npm install recharts`
  - [x] `npm install zod`
  - [x] `npm install -D @types/bcryptjs` (pour post-MVP — optionnel maintenant)

- [x] Initialiser shadcn/ui (AC: 3)
  - [x] `npx shadcn@latest init` — choisir style "New York", base color "Zinc", CSS variables: yes
  - [x] Vérifier que `components.json` est créé à la racine
  - [x] Ajouter les composants de base : `npx shadcn@latest add button dialog select sheet sonner` (toast déprécié → sonner)
  - [x] Vérifier que les composants sont dans `src/components/ui/`

- [x] Créer la structure de répertoires complète (AC: 4)
  - [x] `src/features/decks/` (vide — placeholder `.gitkeep`)
  - [x] `src/features/cards/` (vide)
  - [x] `src/features/review/` (vide)
  - [x] `src/features/extraction/` (vide)
  - [x] `src/features/dashboard/` (vide)
  - [x] `src/components/card-renderer/` (vide)
  - [x] `src/components/card-renderer/templates/` (vide)
  - [x] `src/components/layout/` (vide)
  - [x] `src/lib/` (créé par create-next-app + shadcn — utils.ts présent)
  - [x] `src/app/(auth)/` — layout.tsx vide + page.tsx placeholder
  - [x] `src/app/(app)/` — layout.tsx vide + dashboard/page.tsx placeholder
  - [x] `src/app/api/` — créer les sous-dossiers vides : decks/, cards/, extract/, review/, export/, account/

- [x] Créer `src/middleware.ts` stub (AC: 4)
  - [x] Créer un middleware minimal qui ne bloque rien encore (sera complété en story 1.3)
  - [x] Note : Next.js 16 requiert export de fonction — stub adapté (pas l'export next-auth v4 du spec)

- [x] Créer `.env.example` et `.env.local` (AC: 5)
  - [x] `.env.example` avec toutes les variables
  - [x] `.env.local` placeholder créé (gitignored — valeurs réelles à remplir)
  - [x] `.gitignore` mis à jour : `.env.local`, `.env*.local`, `.env.development`, `.env.production` (pas `.env*` qui bloquait .env.example)

- [x] Vérifier le build (AC: 6)
  - [x] `npm run build` — 0 erreur TypeScript ni ESLint, 5 routes générées
  - [x] Warning middleware déprécié (Next.js 16 : proxy vs middleware) — non bloquant, à corriger en story 1.3
  - [ ] `npm run dev` — à vérifier par l'utilisateur

- [x] Déploiement Vercel (AC: 7, 8)
  - [x] Repo GitHub : https://github.com/pixelsmill/ilovecards
  - [x] Remote origin configuré + push
  - [x] Vercel connecté — https://ilovecards.vercel.app/ (Ready, ~32s)
  - [x] Variables d'environnement configurées dans Vercel
  - [x] Premier déploiement réussi
  - [x] console.error("Test Vercel logs - story 1.1") ajouté, déployé, vérifié dans logs Vercel, retiré

## Dev Notes

### Stack exact à utiliser

- **Next.js** : 15.x (App Router, MPA — pas de SPA)
- **TypeScript** : strict (tsconfig généré par create-next-app)
- **Tailwind CSS** : v4 ou v3 selon la version installée par create-next-app@latest — ne pas changer
- **shadcn/ui** : `npx shadcn@latest init` (pas `npx shadcn-ui@latest` — package renommé)
- **@ducanh2912/next-pwa** : fork maintenu de next-pwa — compatible Next.js 15 (l'original `next-pwa` de shadowwalker ne l'est pas)

### Structure de projet imposée par l'architecture

```
src/
  app/
    (auth)/          # routes publiques — login, verify
    (app)/           # routes protégées — layout avec auth
      dashboard/
    api/             # Route Handlers uniquement
  components/
    ui/              # shadcn/ui — généré par CLI
    card-renderer/   # CardRenderer + templates (story 2.2)
    layout/
  features/          # logique métier par domaine
    decks/
    cards/
    review/
    extraction/
    dashboard/
  lib/               # singletons et utilitaires partagés
    prisma.ts        # à créer en story 1.2
    auth.ts          # à créer en story 1.3
    sm2.ts           # à créer en story 3.1
    api-error.ts     # à créer dans cette story ou story 1.2
    schemas/         # schémas Zod partagés
  middleware.ts      # stub minimal dans cette story
```

### Conventions de nommage (imposées par l'architecture)

- Répertoires : `kebab-case`
- Composants React : `PascalCase.tsx`
- Utilitaires & libs : `kebab-case.ts`
- Import alias : `@/*` → `src/*` (configuré par create-next-app)

### Route Groups Next.js App Router

- `(auth)` et `(app)` sont des **route groups** — les parenthèses signifient que le segment n'apparaît PAS dans l'URL. `/app/(app)/dashboard/page.tsx` → URL `/dashboard`
- Chaque route group a son propre `layout.tsx`

### shadcn/ui — configuration correcte

- Utiliser `npx shadcn@latest` (pas `shadcn-ui`)
- Base color recommandée : Zinc ou Neutral (s'adapte aux templates de cartes colorés)
- Les composants sont **copiés** dans `src/components/ui/` — ils n'ont pas de dépendance runtime à shadcn
- Ne **jamais** modifier manuellement les fichiers dans `src/components/ui/` — utiliser le CLI pour les mises à jour

### Middleware stub — attention

Le stub de middleware utilise l'export par défaut de `next-auth/middleware`. Ce middleware SERA remplacé en story 1.3 avec la vraie configuration Auth.js v5. En story 1.1, l'objectif est juste d'avoir le fichier en place avec la bonne structure.

Note : Auth.js v5 (next-auth@5) change l'API de middleware par rapport à v4. Ne pas se baser sur des exemples next-auth v4.

### Variables d'environnement Vercel

Configurer dans le dashboard Vercel → Project Settings → Environment Variables :
- Appliquer à : Production + Preview + Development
- `DATABASE_URL` : connection string Neon avec pooler (format : `postgresql://user:pass@host-pooler.neon.tech/dbname?sslmode=require`)
- `NEXTAUTH_SECRET` : générer avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : Vercel l'injecte automatiquement — ne pas le configurer manuellement

### Ce que cette story NE fait PAS

- Pas de Prisma schema ni migration (→ story 1.2)
- Pas de configuration Auth.js (→ story 1.3)
- Pas de `src/lib/prisma.ts` complet (→ story 1.2)
- Pas de middleware fonctionnel (juste un stub)
- Le `src/app/api/` ne contient que des dossiers vides — les Route Handlers seront créés dans les stories concernées

### Références

- Architecture : stack + structure projet [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template]
- Architecture : variables d'environnement [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Déploiement]
- Architecture : patterns de nommage [Source: _bmad-output/planning-artifacts/architecture.md#Patterns d'Implémentation]
- Epics : Story 1.1 ACs [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Next.js 16.2.6 installé (pas 15.x comme spécifié — create-next-app@latest résout maintenant v16)
- Tailwind v4 installé (pas v3)
- shadcn `toast` déprécié → remplacé par `sonner`
- middleware.ts : `export { default } from 'next-auth/middleware'` incompatible Next.js 16 → stub fonction native NextResponse.next()
- create-next-app refuse les répertoires non vides → scaffolding dans temp dir puis copie vers ilovecards root
- `.gitignore` scaffold : `.env*` bloquait `.env.example` → corrigé en patterns spécifiques

### Completion Notes List

- ✅ AC1 : Next.js 16.2.6 initialisé, structure src/app/ présente
- ✅ AC2 : Toutes les dépendances installées (prisma, next-auth v4, @auth/prisma-adapter, resend, @anthropic-ai/sdk, @ducanh2912/next-pwa, recharts, zod)
- ✅ AC3 : shadcn/ui initialisé (Tailwind v4 détecté), composants button/dialog/select/sheet/sonner dans src/components/ui/
- ✅ AC4 : Structure complète créée — features/, card-renderer/, layout/, route groups (auth)/(app), api/ stubs
- ✅ AC5 : .env.example créé avec 4 variables, .env.local placeholder gitignored
- ✅ AC6 : npm run build → 0 erreur, 5 routes (/, /_not-found, /dashboard + middleware proxy)
- ⚠️ AC7/AC8 : GitHub repo + Vercel setup requiert action utilisateur (pas de GitHub CLI ni credentials)

### File List

- src/app/page.tsx (modifié — placeholder simple)
- src/app/(auth)/layout.tsx (nouveau)
- src/app/(auth)/page.tsx (nouveau)
- src/app/(app)/layout.tsx (nouveau)
- src/app/(app)/dashboard/page.tsx (nouveau)
- src/app/api/decks/.gitkeep (nouveau)
- src/app/api/cards/.gitkeep (nouveau)
- src/app/api/extract/.gitkeep (nouveau)
- src/app/api/review/.gitkeep (nouveau)
- src/app/api/export/.gitkeep (nouveau)
- src/app/api/account/.gitkeep (nouveau)
- src/features/decks/.gitkeep (nouveau)
- src/features/cards/.gitkeep (nouveau)
- src/features/review/.gitkeep (nouveau)
- src/features/extraction/.gitkeep (nouveau)
- src/features/dashboard/.gitkeep (nouveau)
- src/components/card-renderer/templates/.gitkeep (nouveau)
- src/components/layout/.gitkeep (nouveau)
- src/components/ui/button.tsx (shadcn)
- src/components/ui/dialog.tsx (shadcn)
- src/components/ui/select.tsx (shadcn)
- src/components/ui/sheet.tsx (shadcn)
- src/components/ui/sonner.tsx (shadcn)
- src/lib/utils.ts (shadcn)
- src/middleware.ts (nouveau — stub)
- .env.example (nouveau)
- .env.local (nouveau — gitignored, placeholder)
- .gitignore (modifié — .env* → patterns spécifiques)
- next.config.ts (nouveau — turbopack.root configuré)
- package.json (modifié — name: ilovecards, toutes les deps)
- components.json (nouveau — shadcn/ui config)
