# Story 1.3 : Authentification magic link

Status: done

## Story

En tant qu'utilisateur,
je veux créer un compte et me connecter via un magic link envoyé à mon email,
afin d'accéder à ilovecards sans mot de passe.

## Acceptance Criteria

1. La page `/login` affiche un formulaire email — soumission envoie un magic link via Resend (FR1, FR2)
2. Après soumission, l'utilisateur voit une page "Vérifiez votre email"
3. En cliquant sur le magic link, l'utilisateur est authentifié et redirigé vers `/dashboard`
4. Un magic link déjà utilisé affiche une erreur Auth.js
5. Les routes `(app)/*` et `/api/*` (sauf `/api/auth/*`) sont protégées — redirect vers `/login` si non authentifié
6. `src/lib/auth.ts` exporte `{ handlers, auth, signIn, signOut }` via Auth.js v5
7. `src/app/api/auth/[...nextauth]/route.ts` expose les handlers GET et POST
8. Les sessions sont stockées en base (table `Session`) — pas de JWT

## Tasks / Subtasks

- [x] Upgrader next-auth v4 → v5 (AC: 6)
  - [x] `npm install next-auth@5`
  - [x] Vérifier que `@auth/prisma-adapter` est toujours compatible

- [x] Créer `src/lib/auth.ts` (AC: 6, 8)
  - [x] Config NextAuth avec PrismaAdapter, strategy database, provider Resend

- [x] Créer le route handler Auth.js (AC: 7)
  - [x] `src/app/api/auth/[...nextauth]/route.ts`

- [x] Créer la page de login (AC: 1, 2)
  - [x] `src/app/(auth)/login/page.tsx` — formulaire email + Server Action signIn
  - [x] `src/app/(auth)/verify/page.tsx` — "Vérifiez votre email"

- [x] Mettre à jour le middleware (AC: 5)
  - [x] `src/middleware.ts` — Auth.js v5, protège tout sauf login/verify/api/auth

- [x] Mettre à jour la page root (AC: 3, 5)
  - [x] `src/app/page.tsx` — redirect vers /dashboard si auth, /login sinon

- [x] Mettre à jour `src/app/(app)/layout.tsx` (AC: 5)
  - [x] Vérifier session côté serveur, redirect si non auth

- [x] Vérifier le build (AC: tous)
  - [x] `npm run build` sans erreur

## Dev Notes

### next-auth v5 — différences clés vs v4

- Import : `import NextAuth from "next-auth"` (même mais API différente)
- Providers : `import Resend from "next-auth/providers/resend"`
- Middleware : `export { auth as middleware }` (pas `withAuth`)
- `auth()` utilisable dans Server Components et Route Handlers
- `handlers` exportés pour l'API route

### `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "noreply@ilovecards.app",  // domaine vérifié requis en prod
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/login",
  },
})
```

**Note from email :** Resend exige un domaine vérifié pour `from`. En dev, utiliser `onboarding@resend.dev` (envoie uniquement à l'adresse du compte Resend). En prod, configurer le domaine dans le dashboard Resend.

### Route handler (App Router Next.js 16)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### Login page — Server Action

```tsx
// src/app/(auth)/login/page.tsx
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <main>
      <form action={async (formData: FormData) => {
        "use server"
        await signIn("resend", { email: formData.get("email"), redirectTo: "/dashboard" })
      }}>
        <input type="email" name="email" required placeholder="ton@email.com" />
        <button type="submit">Envoyer le lien</button>
      </form>
    </main>
  )
}
```

### Middleware v5

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth"
export default auth

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login|verify).*)"],
}
```

### Conflit src/app/page.tsx vs src/app/(auth)/

`src/app/page.tsx` (URL `/`) et `src/app/(auth)/page.tsx` (URL `/` aussi) sont en conflit. Solution : login à `/login` (pas `/`). La page root `/` redirige selon auth.

### Variables nécessaires

- `AUTH_RESEND_KEY` : clé Resend (https://resend.com → API Keys)
- `NEXTAUTH_SECRET` : 32 bytes base64 (déjà généré en story 1.1)
- Mettre à jour `.env.local` et Vercel

### Références

- Architecture : auth.ts config [Source: architecture.md#Authentication & Sécurité]
- Architecture : middleware pattern [Source: architecture.md#Frontière Auth]
- Architecture : auth() pattern [Source: architecture.md#Patterns de process]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
