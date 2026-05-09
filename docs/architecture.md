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

> [!TIP]
> **Comment Prisma sait quelles migrations ont déjà été appliquées ?** Il maintient une table `_prisma_migrations` directement dans ta base de données. Elle enregistre chaque migration appliquée avec son nom, sa date et un **checksum** (empreinte du fichier SQL).
>
> ```
> migration_name                      | applied_steps_at
> ------------------------------------|------------------
> 20260508165832_add_ai_credits       | 2026-05-08 16:58
> 20260508173733_add_card_image_url   | 2026-05-08 17:37
> 20260508180000_add_deck_share_token | 2026-05-08 18:00
> 20260509000000_add_user_is_pro      | 2026-05-09 00:00
> ```
>
> Quand `migrate deploy` tourne, Prisma compare cette table avec les dossiers dans `prisma/migrations/` — tout ce qui est présent localement mais absent de la table est appliqué dans l'ordre chronologique (d'où l'importance du timestamp dans le nom du dossier).
>
> Le checksum est une protection : si tu modifies un fichier de migration déjà appliqué, Prisma le détecte et refuse d'avancer.

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

> [!TIP]
> **Server Actions vs REST : une entorse assumée.** Une Server Action passe par un `POST` générique vers une URL opaque générée par Next.js — pas de verbe sémantique, pas d'URL lisible, pas de contrat explicite. Ce n'est pas du REST.
>
> C'est acceptable ici parce que le front et le back sont la même app et que ces actions ne sont pas destinées à être consommées par un client externe. Dès qu'une opération doit être accessible depuis une app mobile, un service tiers ou un autre frontend, elle mérite une vraie route REST dans `/api/` avec ses verbes et ses URLs propres.
>
> Dans ce projet la ligne est tenue : les Server Actions ne gèrent que la création/modification de carte et la connexion. Tout ce qui est métier partageable passe par des routes REST normales.

### Validation des entrées

Toutes les données entrantes passent par des schémas [Zod](https://zod.dev) définis dans `src/lib/schemas/`. Zod garantit le typage à l'exécution et génère les messages d'erreur.

> [!TIP]
> **Pourquoi Zod ?** TypeScript vérifie les types à la compilation — mais à l'exécution, une API reçoit du JSON brut que TypeScript ne peut pas contrôler. Si quelqu'un envoie `{ "aiCredits": "beaucoup" }` à la place d'un nombre, TypeScript ne dit rien : il ne tourne plus.
>
> Zod valide les données au moment où elles arrivent, à l'exécution :
> ```ts
> const CreateCardSchema = z.object({
>   notion: z.string().min(1).max(500),
>   template: z.enum(['poster', 'quote', 'minimaliste', ...]),
>   imageUrl: z.string().url().optional(),
> })
>
> const parsed = CreateCardSchema.safeParse(body)
> if (!parsed.success) return apiError("Données invalides", 400)
> // ici parsed.data est garanti correct — TypeScript ET l'exécution sont d'accord
> ```
>
> C'est la validation à la frontière du système (entrée utilisateur, corps de requête HTTP). Le reste du code fait confiance aux types sans re-valider.

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

> [!TIP]
> **Anatomie d'un JWT.** C'est une chaîne en trois parties séparées par des points :
> ```
> eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjbHVzZXIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
> ```
>
> Chaque partie est encodée en base64url (encodage texte réversible, **pas du chiffrement**) :
>
> - **Header** — algorithme de signature : `{ "alg": "HS256" }`
> - **Payload** — les données de session :
>   ```json
>   { "sub": "cluserid123", "email": "user@example.com", "iat": 1700000000, "exp": 1700003600 }
>   ```
> - **Signature** — `HMAC-SHA256(header + "." + payload, NEXTAUTH_SECRET)`
>
> Le serveur recalcule la signature à chaque requête. Si elle correspond → token valide. Si quelqu'un modifie le payload (ex : change l'id), la signature ne correspond plus → rejeté.
>
> Deux points importants : le payload est **lisible par n'importe qui** (ne jamais y mettre de données sensibles) mais **infalsifiable** sans connaître le secret. Et comme tout est dans le cookie côté client, le serveur ne stocke rien — c'est pour ça que le proxy peut vérifier l'auth sans toucher à la base.

### Magic link (Resend)

Pas de mot de passe. L'utilisateur entre son email → Resend envoie un lien à usage unique → Auth.js valide le token et crée la session. En développement, le lien est affiché dans la console au lieu d'être envoyé par email.

### Proxy (`src/proxy.ts`)

Le proxy (`src/proxy.ts`) intercepte toutes les requêtes pour vérifier l'authentification. Il laisse passer :
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

L'algorithme [SM-2](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm) (SuperMemo 2) calcule quand revoir chaque carte.

Implémenté dans `src/lib/sm2.ts`. Chaque carte stocke trois valeurs :

- `easeFactor` (défaut 2.5) — facteur de facilité, diminue si la carte est souvent ratée.
- `interval` (défaut 0) — nombre de jours jusqu'à la prochaine révision.
- `repetitions` — nombre de fois consécutives où la carte a été correctement retenue.

Deux actions définies dans l'algorithme :
- **`dismiss`** (↑ swipe haut — carte maîtrisée) → `quality 4` dans SM-2 → l'intervalle croît.
- **`fail`** (carte ratée) → `quality 1` → l'intervalle reset à 1 jour, `repetitions` = 0.

Actuellement, seul `dismiss` est exposé dans l'UI (swipe haut). `fail` est implémenté dans `sm2.ts` et l'API `/api/review` l'accepte, mais aucun geste ne le déclenche encore.

---

## Front-end

### Next.js App Router

Toutes les pages sont dans `src/app/`. Next.js distingue deux types de composants :

- **Server Components** (défaut) : rendus côté serveur, peuvent faire des appels DB directs (via Prisma), ne peuvent pas utiliser `useState`/`useEffect`.
- **Client Components** (`"use client"`) : hydratés côté client, gèrent l'interactivité.

La règle pratique : tout ce qui est statique ou nécessite des données → Server Component. Tout ce qui a de l'état ou des événements utilisateur → Client Component.

### Structure des dossiers

**Légende :** `[S]` Server Component (rendu serveur, peut accéder à la DB) · `[C]` Client Component (`"use client"`, état, événements)

> [!TIP]
> Règle rapide : si le fichier commence par `"use client"` → `[C]`, sinon → `[S]` par défaut. Les `page.tsx` et `layout.tsx` sont presque toujours `[S]`. Les composants avec `useState`, `useEffect`, ou des handlers d'événements sont forcément `[C]`.

```
src/
├── app/                        — routing Next.js (App Router)
│   ├── (app)/                  — pages authentifiées (layout avec nav)
│   │   ├── dashboard/          — page d'accueil                      [S]
│   │   ├── decks/              — liste et détail des decks            [S]
│   │   │   └── [id]/
│   │   │       └── DeleteDeckButton.tsx                              [C]
│   │   ├── import/             — génération IA                        [S]
│   │   ├── review/             — charge les cartes, passe au client   [S]
│   │   └── account/            — paramètres du compte                 [S]
│   ├── (auth)/                 — pages publiques d'auth               [S]
│   ├── s/[token]/              — page de partage public               [S]
│   ├── api/                    — API Routes (REST)
│   └── page.tsx                — landing page (/)                     [S]
├── components/
│   ├── card-renderer/          — CardRenderer + 8 templates           [S]
│   ├── nav/
│   │   ├── TopBar.tsx                                                 [S]
│   │   └── BurgerMenu.tsx      — menu interactif                      [C]
│   └── ui/                     — primitives shadcn (Dialog, Select…)  [C]
├── features/                   — composants métier par domaine
│   ├── cards/
│   │   ├── CardForm.tsx                                               [C]
│   │   ├── TemplatePicker.tsx                                         [C]
│   │   └── DeleteCardButton.tsx                                       [C]
│   ├── decks/
│   │   ├── DeckForm.tsx                                               [C]
│   │   ├── ShareButton.tsx                                            [C]
│   │   └── CopyDeckButton.tsx                                         [C]
│   ├── dashboard/
│   │   └── RetentionChart.tsx                                         [C]
│   ├── extraction/
│   │   └── ImportFlow.tsx      — flux de génération IA streaming      [C]
│   └── review/
│       ├── ReviewSession.tsx   — orchestrateur de la session          [C]
│       └── SwipeCard.tsx       — gestion des gestes tactiles          [C]
└── lib/                        — utilitaires partagés (auth, prisma, schémas, sm2)
```

Le pattern général : les `page.tsx` sont `[S]` et font la requête DB, puis passent les données en props à un composant `[C]` (ex: `ReviewSession`, `ImportFlow`). Cela évite de descendre le contexte serveur dans les composants interactifs.

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

### Neon (base de données)

- **Où créer un compte** : [neon.tech](https://neon.tech) — plan gratuit disponible
- **Ce qu'il faut récupérer** : dans le dashboard Neon → ton projet → *Connection string*. Deux URLs à copier : la poolée (`DATABASE_URL`) et la directe (`DATABASE_URL_UNPOOLED`). Neon les affiche côte à côte avec un toggle "Pooled / Direct".
- **Limite du plan gratuit** : 1 projet, 0.5 GB de stockage, compute mis en veille après inactivité (se réveille automatiquement à la prochaine requête, avec une légère latence).

### Resend (emails)

- **Où créer un compte** : [resend.com](https://resend.com) — plan gratuit disponible
- **Ce qu'il faut récupérer** : *API Keys* dans le dashboard → créer une clé → copier la valeur (`re_...`) dans `AUTH_RESEND_KEY`
- **Configuration domaine** : en production, Resend exige de vérifier un domaine pour envoyer depuis une adresse personnalisée (ex: `noreply@ilovecards.fr`). Sans ça, les emails partent depuis `onboarding@resend.dev` (domaine Resend partagé, limité à 100 emails/jour).
- **En développement** : le provider est remplacé par un simple `console.log` — le magic link s'affiche dans le terminal, aucun email n'est envoyé.
- **Limite du plan gratuit** : 3 000 emails/mois, 100/jour.

### Anthropic (IA)

- **Où créer un compte** : [console.anthropic.com](https://console.anthropic.com)
- **Ce qu'il faut récupérer** : *API Keys* → créer une clé → copier la valeur (`sk-ant-...`) dans `ANTHROPIC_API_KEY`
- **Facturation** : à l'usage (tokens consommés). Pas de plan gratuit — il faut créditer son compte. Le modèle utilisé ici (`claude-haiku-4-5`) est le moins cher de la gamme (~0.25$/million de tokens en entrée).
- **SDK** : `@anthropic-ai/sdk` — utilisé en mode streaming (`messages.create({ stream: true })`).

### Unsplash (photos)

- **Où créer un compte** : [unsplash.com/developers](https://unsplash.com/developers)
- **Ce qu'il faut récupérer** : créer une application → copier l'*Access Key* dans `UNSPLASH_ACCESS_KEY`
- **Optionnel** : si la clé est absente, le template `photo-overlay` utilise un dégradé de couleur à la place.
- **Limite** : 50 requêtes/heure en mode "demo". Pour passer en production (limite à 5 000 req/heure), il faut soumettre l'application à la validation Unsplash.
- **Attribution** : les conditions Unsplash exigent d'afficher "Photo by [auteur] on Unsplash" quelque part dans l'interface en production.

### Vercel (hébergement)

- **Où créer un compte** : [vercel.com](https://vercel.com) — plan gratuit disponible
- **Connexion au repo** : Vercel se connecte à GitHub, détecte automatiquement Next.js et configure le build.
- **Variables d'environnement** : à renseigner dans *Project Settings → Environment Variables*. Chaque variable peut être activée pour Production, Preview et/ou Development. Toutes les variables listées ci-dessous sont à y ajouter.
- **Déploiement automatique** : chaque `git push` sur `main` déclenche un build. Les branches créent des URLs de preview.
- **Limite du plan gratuit** : largement suffisant pour un projet en phase de lancement (100 GB de bande passante/mois, fonctions serverless illimitées).

---

## Variables d'environnement

```bash
# Base de données (Neon → Connection string)
DATABASE_URL=               # URL poolée  — pour l'app
DATABASE_URL_UNPOOLED=      # URL directe — pour les migrations Prisma

# Auth.js
NEXTAUTH_SECRET=            # Générer avec : openssl rand -base64 32

# Resend (resend.com → API Keys)
AUTH_RESEND_KEY=            # re_...

# Anthropic (console.anthropic.com → API Keys)
ANTHROPIC_API_KEY=          # sk-ant-...

# Unsplash (unsplash.com/developers → Access Key) — optionnel
UNSPLASH_ACCESS_KEY=
```

En développement : ces variables sont à mettre dans `.env.local` (lu par Next.js) **et** dans `.env` (lu par Prisma CLI). Les deux fichiers doivent exister et contenir les mêmes valeurs DB.  
En production : à renseigner dans le dashboard Vercel (*Project Settings → Environment Variables*).

---

## Déploiement

Hébergé sur **Vercel**, connecté au repo GitHub. Le pipeline est automatique :

1. `git push origin main`
2. Vercel détecte le push et lance le build : `prisma generate && next build`
3. `prisma generate` regénère le client TypeScript depuis le schéma
4. `prisma migrate deploy` applique les éventuelles migrations en attente
5. `next build` compile et optimise l'app
6. Le déploiement remplace la version précédente (zéro downtime)

Les fonctions API sont déployées en **Serverless Functions** (Node.js) et le proxy (`src/proxy.ts`) en **Edge Function** — il tourne dans un runtime V8 léger, sans Node.js, ce qui le rend très rapide mais incompatible avec Prisma (d'où le split-config auth).
