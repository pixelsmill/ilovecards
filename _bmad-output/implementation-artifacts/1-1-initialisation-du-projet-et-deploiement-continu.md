# Story 1.1 : Initialisation du projet & déploiement continu

Status: ready-for-dev

## Story

En tant que développeur/opérateur,
je veux que le projet soit initialisé et déployé sur Vercel,
afin que chaque story soit validée dans un vrai environnement dès le premier jour.

## Acceptance Criteria

1. `npx create-next-app@latest markdeck --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` exécuté avec succès — structure de base présente
2. Dépendances installées : prisma, @prisma/client, next-auth, @auth/prisma-adapter, resend, @anthropic-ai/sdk, @ducanh2912/next-pwa, recharts, zod
3. shadcn/ui initialisé via CLI (`npx shadcn@latest init`) — `components.json` présent, composants ajoutés dans `src/components/ui/`
4. Structure de répertoires complète créée : `src/features/`, `src/lib/`, `src/components/card-renderer/`, `src/components/layout/`
5. `.env.example` liste toutes les variables requises : DATABASE_URL, NEXTAUTH_SECRET, AUTH_RESEND_KEY, ANTHROPIC_API_KEY
6. `npm run build` passe sans erreur
7. Repo connecté à GitHub, Vercel connecté au repo — push sur `main` déclenche un déploiement automatique (FR33)
8. Une erreur applicative volontaire dans les logs confirme qu'elle est visible dans le dashboard Vercel (FR34)

## Tasks / Subtasks

- [ ] Initialiser le projet Next.js (AC: 1)
  - [ ] Exécuter `npx create-next-app@latest markdeck --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [ ] Vérifier la structure générée : `src/app/`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  - [ ] Supprimer le contenu de démonstration de `src/app/page.tsx` (remplacer par un placeholder simple)

- [ ] Installer les dépendances (AC: 2)
  - [ ] `npm install prisma @prisma/client`
  - [ ] `npm install next-auth @auth/prisma-adapter`
  - [ ] `npm install resend`
  - [ ] `npm install @anthropic-ai/sdk`
  - [ ] `npm install @ducanh2912/next-pwa`
  - [ ] `npm install recharts`
  - [ ] `npm install zod`
  - [ ] `npm install -D @types/bcryptjs` (pour post-MVP — optionnel maintenant)

- [ ] Initialiser shadcn/ui (AC: 3)
  - [ ] `npx shadcn@latest init` — choisir style "New York", base color "Zinc", CSS variables: yes
  - [ ] Vérifier que `components.json` est créé à la racine
  - [ ] Ajouter les composants de base : `npx shadcn@latest add button dialog select sheet toast`
  - [ ] Vérifier que les composants sont dans `src/components/ui/`

- [ ] Créer la structure de répertoires complète (AC: 4)
  - [ ] `src/features/decks/` (vide — placeholder `.gitkeep`)
  - [ ] `src/features/cards/` (vide)
  - [ ] `src/features/review/` (vide)
  - [ ] `src/features/extraction/` (vide)
  - [ ] `src/features/dashboard/` (vide)
  - [ ] `src/components/card-renderer/` (vide)
  - [ ] `src/components/card-renderer/templates/` (vide)
  - [ ] `src/components/layout/` (vide)
  - [ ] `src/lib/` (déjà créé par create-next-app — vérifier)
  - [ ] `src/app/(auth)/` — layout.tsx vide + page.tsx placeholder
  - [ ] `src/app/(app)/` — layout.tsx vide + dashboard/page.tsx placeholder
  - [ ] `src/app/api/` — créer les sous-dossiers vides : decks/, cards/, extract/, review/, export/, account/

- [ ] Créer `src/middleware.ts` stub (AC: 4)
  - [ ] Créer un middleware minimal qui ne bloque rien encore (sera complété en story 1.3)
  ```typescript
  export { default } from 'next-auth/middleware'
  export const config = { matcher: ['/app/:path*', '/api/:path*'] }
  ```
  - [ ] Note : ce stub sera remplacé en story 1.3

- [ ] Créer `.env.example` et `.env.local` (AC: 5)
  - [ ] `.env.example` avec toutes les variables commentées :
  ```
  # Base de données Neon (connection pooler URL)
  DATABASE_URL="postgresql://..."

  # Auth.js
  NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

  # Resend (magic link emails)
  AUTH_RESEND_KEY="re_..."

  # Anthropic Claude Haiku 4.5
  ANTHROPIC_API_KEY="sk-ant-..."
  ```
  - [ ] `.env.local` avec les vraies valeurs (gitignored — ne pas committer)
  - [ ] Vérifier que `.gitignore` contient `.env.local` et `.env*.local`

- [ ] Vérifier le build (AC: 6)
  - [ ] `npm run build` — doit passer sans erreur TypeScript ni ESLint
  - [ ] Corriger tout warning ESLint bloquant
  - [ ] `npm run dev` — vérifier que le serveur démarre correctement

- [ ] Déploiement Vercel (AC: 7, 8)
  - [ ] Créer le repo GitHub `markdeck` (public ou privé)
  - [ ] `git init && git add . && git commit -m "chore: initialisation projet markdeck"`
  - [ ] `git push origin main`
  - [ ] Connecter le repo à Vercel (nouveau projet)
  - [ ] Configurer les variables d'environnement dans Vercel (DATABASE_URL, NEXTAUTH_SECRET, AUTH_RESEND_KEY, ANTHROPIC_API_KEY)
  - [ ] Vérifier que le premier déploiement réussit
  - [ ] Ajouter `console.error("Test Vercel logs - story 1.1")` temporaire dans `src/app/page.tsx`, pusher, vérifier dans les logs Vercel, puis le retirer

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

### Completion Notes List

### File List
