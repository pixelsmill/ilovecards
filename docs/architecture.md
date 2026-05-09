# Architecture — ilovecards

Application de flashcards avec génération IA, répétition espacée et partage de decks.

---

## Stack en un coup d'œil

| Couche | Techno |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript |
| UI | React 19 + Tailwind CSS v4 |
| Base de données | PostgreSQL serverless (Neon) |
| ORM | Prisma 5 |
| Auth | Auth.js v5 (magic link via Resend) |
| IA | Anthropic Claude Haiku 4.5 |
| Photos | Unsplash API |
| Hébergement | Vercel |

---

## Base de données

### Hébergement : Neon

PostgreSQL hébergé sur [Neon](https://neon.tech), un service serverless. Neon expose **deux URLs** :

- `DATABASE_URL` — URL avec connection pooler (PgBouncer). Utilisée par l'application en prod.
- `DATABASE_URL_UNPOOLED` — URL directe, sans pooler. Utilisée par Prisma Migrate pour les migrations.

#### Pourquoi deux URLs ? Le problème des connexions

Ouvrir une connexion à PostgreSQL coûte cher : handshake TCP, authentification, allocation mémoire côté serveur. PostgreSQL a une limite de connexions simultanées (environ 100 par défaut). Or les fonctions serverless Vercel ouvrent une nouvelle connexion à chaque requête HTTP — avec du trafic, on épuise la limite très vite.

**Le pooler** (groupeur de connexions) est un intermédiaire qui maintient un petit nombre de connexions ouvertes en permanence vers la base, et les prête tour à tour aux requêtes entrantes. 100 requêtes HTTP peuvent ainsi se partager 10 connexions sans que Postgres le sache.

```
Sans pooler :
Requête 1 ──ouvre──▶ Postgres
Requête 2 ──ouvre──▶ Postgres   ← Postgres gère N connexions simultanées
Requête 3 ──ouvre──▶ Postgres

Avec pooler (PgBouncer) :
Requête 1 ──▶ PgBouncer ──réutilise──▶ Postgres
Requête 2 ──▶ PgBouncer ──réutilise──▶ Postgres   ← Postgres gère 2-3 connexions
Requête 3 ──▶ PgBouncer ──attend────▶ Postgres
```

**PgBouncer** est le nom du logiciel de pooling utilisé par Neon (terme anglais universellement utilisé, même en français).

**Pourquoi l'URL directe pour les migrations ?** PgBouncer ne supporte pas les transactions DDL (`ALTER TABLE`, `CREATE INDEX`…) en mode poolé. Prisma Migrate a donc besoin de l'URL directe pour appliquer les migrations.

### Schéma des tables

```
User
├── id, email, name, image
├── aiCredits (Int, défaut 30)   — crédits de génération IA
├── lastCreditAt (DateTime)      — date du dernier rechargement
└── isPro (Boolean, défaut false) — bypass des limites de crédits

Deck
├── id, userId (→ User)
├── name, description, accentColor
└── shareToken (String?, unique)  — token de partage public (null = non partagé)

Card
├── id, deckId (→ Deck)
├── notion, developpement, source
├── template (String)             — nom du template visuel
├── imageUrl (String?)            — URL Unsplash pour photo-overlay
└── easeFactor, interval, repetitions, nextReviewAt, lastReviewAt  — état SM-2

Review
├── id, cardId (→ Card), deckId, userId
├── action ("dismiss" | "fail")
└── reviewedAt
```

Les relations sont en cascade : supprimer un `User` supprime ses `Deck`, qui supprime leurs `Card` et `Review`.

### Migrations

Les migrations sont des fichiers SQL dans `prisma/migrations/`. Chaque migration correspond à une évolution du schéma.

- **En développement** : `npx prisma migrate dev` dans ton terminal — demande confirmation, crée le fichier SQL dans `prisma/migrations/` et l'applique.
- **En production (Vercel)** : `prisma migrate deploy` s'exécute automatiquement au build (`"build": "prisma generate && next build"`). Cette commande applique les migrations en attente sans demander de confirmation.

---

## ORM — Prisma

Prisma joue deux rôles :

1. **Client typé** (`@prisma/client`) : l'objet `prisma` exporté depuis `src/lib/prisma.ts` est l'unique point d'accès à la base. Il est instancié en singleton pour ne pas multiplier les connexions en développement.

2. **Migration** : Prisma Migrate gère l'historique des changements de schéma via des fichiers SQL versionnés.

Le schéma source est `prisma/schema.prisma`. Après chaque modification, `prisma generate` regénère le client TypeScript (c'est pourquoi il faut relancer le serveur de dev après une migration).

> [!TIP]
> **Où vivent ces types ?** Dans `node_modules/.prisma/client/index.d.ts` — un fichier généré de plusieurs milliers de lignes contenant les types de toutes tes tables (`User`, `Card`, `Deck`…) ainsi que les méthodes typées de `prisma.card.findUnique()`, etc. Il est ignoré par git, d'où le `prisma generate` au début du build Vercel.
>
> Le bénéfice concret : si tu ajoutes `isPro` dans le schéma et oublies de relancer `generate`, TypeScript signale `Property 'isPro' does not exist` à la compilation — pas en production. C'est la différence avec du SQL brut où une faute de frappe ne se voit qu'à l'exécution.

---

## Back-end

### Next.js API Routes

Toute la logique serveur vit dans `src/app/api/`. Chaque fichier `route.ts` expose des handlers HTTP (`GET`, `POST`, `PUT`, `DELETE`).

```
/api/auth/[...nextauth]   — Auth.js (magic link, callback, session)
/api/decks                — liste + création de decks
/api/decks/[id]           — lecture, modification, suppression d'un deck
/api/decks/[id]/share     — POST : génère un shareToken / DELETE : le supprime
/api/decks/copy           — POST : copie un deck partagé dans son propre compte
/api/cards                — création d'une carte
/api/cards/[id]           — modification, suppression d'une carte
/api/review               — POST : enregistre un résultat de révision (SM-2)
/api/generate             — POST : génération IA (streaming NDJSON)
/api/extract              — extraction de contenu
/api/export               — export du compte
/api/account              — suppression de compte
```

Chaque route commence par vérifier la session Auth.js. Si pas de session → `401`. Si la ressource appartient à un autre utilisateur → `403`. Les erreurs sont normalisées via `src/lib/api-error.ts`.

### Server Actions

Quelques pages utilisent des **Server Actions** Next.js (fonctions `"use server"` définies directement dans les composants serveur). C'est le cas pour :
- Création / modification de carte (`/decks/[id]/cards/new` et `/edit`)
- Connexion (`/login` → appel à `signIn`)

Les Server Actions évitent de passer par une API Route pour des opérations simples liées à une page. Elles s'exécutent côté serveur et peuvent déclencher un `redirect()`.

### Validation des entrées

Toutes les données entrantes passent par des schémas [Zod](https://zod.dev) définis dans `src/lib/schemas/`. Zod garantit le typage à l'exécution et génère les messages d'erreur.

---

## Authentification

### Auth.js v5 — pattern "split config"

Le problème : Auth.js v5 supporte deux environnements d'exécution :
- **Edge Runtime** (proxy/middleware Next.js) : très rapide, mais pas d'accès Node.js (pas de Prisma, pas de providers email).
- **Node.js Runtime** (API routes, server components) : accès complet.

La solution est de diviser la config en deux fichiers :

**`src/lib/auth.config.ts`** — Edge-safe, importé par le proxy :
```ts
export const authConfig = {
  trustHost: true,
  providers: [],  // vide — pas de provider email ici
  pages: { signIn: "/login", verifyRequest: "/verify", error: "/login" },
}
```

**`src/lib/auth.ts`** — Node.js uniquement, importé par les API routes et Server Components :
```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },   // JWT, pas de session en base
  providers: [Resend(...)],        // magic link email
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub  // expose l'id user dans la session
    }
  }
})
```

### Stratégie JWT

La session utilise un **JWT stocké en cookie**, pas en base de données. Avantage : le proxy peut vérifier l'authentification sans toucher à Prisma (Edge-compatible). L'`id` de l'utilisateur est stocké dans le token (`token.sub`) et exposé via le callback `session`.

### Magic link (Resend)

Pas de mot de passe. L'utilisateur entre son email → Resend envoie un lien à usage unique → Auth.js valide le token et crée la session. En développement, le lien est affiché dans la console au lieu d'être envoyé par email.

### Proxy (`src/proxy.ts`)

Le proxy (anciennement `middleware.ts`) intercepte toutes les requêtes pour vérifier l'authentification. Il laisse passer :
- `/` — landing page publique
- `/s/*` — pages de partage publiques
- `/login`, `/verify`, `/api/auth/*` — routes d'auth

Tout le reste redirige vers `/login` si pas de session.

---

## Génération IA

### Route `/api/generate` — streaming NDJSON

La génération de cartes depuis un texte/URL/PDF est streamée : les cartes arrivent une par une dans le front au fur et à mesure que Claude les génère.

**Format de réponse** : NDJSON (Newline-Delimited JSON) — chaque ligne est un objet JSON indépendant :
```
{"notion":"Le rasoir d'Ockham","developpement":"...","template":"quote"}
{"notion":"La loi des grands nombres","developpement":"...","template":"equation"}
{"_usage":{"cardsGenerated":2,"creditsLeft":28}}
```

La dernière ligne `_usage` indique le bilan : cartes créées + crédits restants.

**Deux modes** selon l'entrée :
- **`SYSTEM_PROMPT_EXTRACT`** — si un contenu est fourni (texte, URL, PDF) : extrait les concepts clés.
- **`SYSTEM_PROMPT_GENERATE`** — si seulement un prompt : génère des cartes sur un sujet.

**PDF** : envoyé à Claude sous forme de bloc `document` base64 (API Anthropic native). Taille max : 20 Mo.

**URL** : fetchée côté serveur avec `User-Agent` Mozilla, contenu HTML strippé (scripts, styles, balises retirées), tronqué à 50 000 caractères.

### Modèle utilisé

`claude-haiku-4-5-20251001` — le modèle le plus rapide et économique d'Anthropic, suffisant pour la génération de flashcards structurées.

### Système de crédits

- Chaque utilisateur démarre avec **30 crédits**.
- **+1 crédit par jour** (rechargement paresseux : calculé à la prochaine requête, pas via cron).
- Plafond à 30 crédits maximum.
- **Utilisateurs `isPro`** : aucun check, aucune déduction.

---

## Répétition espacée — Algorithme SM-2

L'algorithme [SM-2](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-super-memo-method) (SuperMemo 2) calcule quand revoir chaque carte.

Implémenté dans `src/lib/sm2.ts`. Chaque carte stocke trois valeurs :

- `easeFactor` (défaut 2.5) — facteur de facilité, diminue si la carte est souvent ratée.
- `interval` (défaut 0) — nombre de jours jusqu'à la prochaine révision.
- `repetitions` — nombre de fois consécutives où la carte a été correctement retenue.

Deux actions possibles :
- **`dismiss`** (↑ swipe haut — carte sue) → `quality 4` dans SM-2 → l'intervalle croît.
- **`fail`** (↓ swipe bas — carte ratée) → `quality 1` → l'intervalle reset à 1 jour, `repetitions` = 0.

---

## Front-end

### Next.js App Router

Toutes les pages sont dans `src/app/`. Next.js distingue deux types de composants :

- **Server Components** (défaut) : rendus côté serveur, peuvent faire des appels DB directs (via Prisma), ne peuvent pas utiliser `useState`/`useEffect`.
- **Client Components** (`"use client"`) : hydratés côté client, gèrent l'interactivité.

La règle pratique : tout ce qui est statique ou nécessite des données → Server Component. Tout ce qui a de l'état ou des événements utilisateur → Client Component.

### Structure des dossiers

```
src/
├── app/
│   ├── (app)/          — pages authentifiées (layout avec sidebar/nav)
│   │   ├── dashboard/
│   │   ├── decks/
│   │   ├── import/
│   │   ├── review/
│   │   └── account/
│   ├── (auth)/         — pages publiques d'auth
│   │   ├── login/
│   │   └── verify/
│   ├── s/[token]/      — pages de partage public
│   ├── api/            — API Routes
│   └── page.tsx        — landing page (/)
├── components/
│   └── card-renderer/  — composant de rendu de carte + 8 templates
├── features/           — composants métier par domaine
│   ├── cards/
│   ├── decks/
│   └── extraction/
└── lib/                — utilitaires partagés (auth, prisma, schémas, sm2)
```

### CardRenderer et templates

`CardRenderer` est le composant central de l'affichage des cartes. Il supporte 3 tailles (`thumb`, `preview`, `full`) et 8 templates visuels :

| Template | Usage |
|---|---|
| `minimaliste` | Texte épuré, fond blanc |
| `poster` | Grande typographie, fond coloré |
| `quote` | Style citation |
| `magazine` | Layout inspiré presse |
| `color-block` | Blocs de couleur |
| `photo-overlay` | Photo Unsplash en arrière-plan |
| `equation` | Adapté aux formules |
| `sature` | Couleurs saturées |

Le template `photo-overlay` est le seul à utiliser une image externe (`imageUrl`). L'image est fetchée lors de la génération IA ou de la sauvegarde manuelle d'une carte si ce template est sélectionné.

### Styles

Tailwind CSS v4 avec PostCSS. Pas de `tailwind.config.js` — la configuration est inline dans le CSS (`@theme`, `@layer`). Les couleurs de l'app sont définies en custom properties CSS (`--color-*`).

---

## Services tiers

### Anthropic (Claude)

- **Clé** : `ANTHROPIC_API_KEY`
- **Usage** : génération et extraction de flashcards via `claude-haiku-4-5-20251001`
- **SDK** : `@anthropic-ai/sdk` — utilisé en mode streaming (`messages.create({ stream: true })`)
- Facturation à l'usage (tokens in/out). Le modèle Haiku est ~10× moins cher que Sonnet.

### Resend

- **Clé** : `AUTH_RESEND_KEY`
- **Usage** : envoi des magic links d'authentification
- **SDK** : intégré via le provider Auth.js `next-auth/providers/resend`
- En développement, les emails ne sont pas envoyés — le lien s'affiche dans la console.

### Unsplash

- **Clé** : `UNSPLASH_ACCESS_KEY`
- **Usage** : récupération d'une photo portrait pour le template `photo-overlay`
- **API** : `https://api.unsplash.com/search/photos?query=...&per_page=1&orientation=portrait`
- Optionnel : si la clé est absente, le template utilise un dégradé de couleur.
- Limite : 50 req/heure en mode "demo". Les conditions Unsplash exigent une attribution en production.

---

## Variables d'environnement

```bash
# Base de données
DATABASE_URL=               # URL poolée Neon (utilisée par l'app)
DATABASE_URL_UNPOOLED=      # URL directe Neon (utilisée par les migrations)

# Auth.js
NEXTAUTH_SECRET=            # Secret JWT (générer avec: openssl rand -base64 32)

# Resend (magic links)
AUTH_RESEND_KEY=            # re_...

# Anthropic
ANTHROPIC_API_KEY=          # sk-ant-...

# Unsplash (optionnel)
UNSPLASH_ACCESS_KEY=        # clé d'accès API Unsplash
```

En développement : `.env.local` (lu par Next.js) et `.env` (lu par Prisma CLI — les deux doivent exister).  
En production : variables définies dans le dashboard Vercel.

---

## Déploiement

Hébergé sur **Vercel**. Le pipeline est simple :

1. `git push origin main`
2. Vercel détecte le push, lance le build : `prisma generate && next build`
3. `prisma generate` regénère le client TypeScript depuis le schéma
4. `next build` compile et optimise l'app
5. Les migrations sont appliquées en production par `prisma migrate deploy` (ajouté au build si besoin)

Les fonctions API sont déployées en **Edge Functions** ou **Serverless Functions** selon leur runtime. Le proxy (`src/proxy.ts`) tourne en Edge ; les API routes tournent en Node.js serverless.
