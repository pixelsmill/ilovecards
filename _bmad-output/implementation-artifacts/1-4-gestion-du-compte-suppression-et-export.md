# Story 1.4 : Gestion du compte — suppression & export

Status: review

## Story

En tant qu'utilisateur,
je veux supprimer définitivement mon compte ou exporter mes données,
afin d'avoir le contrôle total sur mes informations personnelles.

## Acceptance Criteria

1. `DELETE /api/account` avec session valide supprime toutes les données de l'utilisateur (User, Account, Session) dans une transaction Prisma et retourne 200 (FR3, NFR8)
2. Après suppression, la session Auth.js est immédiatement invalide — toute requête authentifiée suivante redirige vers `/login`
3. `GET /api/export` avec session valide retourne un fichier JSON (Content-Disposition: attachment) contenant les données utilisateur (email, createdAt, et les decks/cartes quand ils existeront) (FR4)
4. `DELETE /api/account` sans session valide retourne `{ error: "Non authentifié", code: "UNAUTHORIZED" }` avec status 401
5. `GET /api/export` sans session valide retourne `{ error: "Non authentifié", code: "UNAUTHORIZED" }` avec status 401
6. La page `/account` (protégée) affiche un bouton "Exporter mes données" et un bouton "Supprimer mon compte" avec confirmation
7. Le bouton "Supprimer" déclenche une dialog de confirmation avant d'appeler l'API — pas de suppression accidentelle
8. `src/lib/api-error.ts` exporte un helper `apiError(message, code, status)` réutilisable dans toutes les routes API

## Tasks / Subtasks

- [x] Créer `src/lib/api-error.ts` (AC: 4, 5, 8)
  - [x] Helper `apiError(message, code, status)` retourne un `Response` JSON formaté

- [x] Créer `src/app/api/account/route.ts` (AC: 1, 2, 4)
  - [x] Vérifier session avec `auth()` → 401 si absent
  - [x] Transaction Prisma : `prisma.$transaction` → `prisma.user.delete({ where: { id: session.user.id } })` (cascade sur Account + Session)
  - [x] Retourner `{ success: true }` avec status 200

- [x] Créer `src/app/api/export/route.ts` (AC: 3, 5)
  - [x] Vérifier session avec `auth()` → 401 si absent
  - [x] Construire objet export : `{ exportedAt, user: { email, createdAt }, decks: [] }` (decks vides jusqu'à epic 2)
  - [x] Retourner `Response` avec `Content-Type: application/json` et `Content-Disposition: attachment; filename="ilovecards-export.json"`

- [x] Créer `src/app/(app)/account/page.tsx` (AC: 6, 7)
  - [x] Server Component — affiche email de session
  - [x] Bouton "Exporter mes données" — lien `href="/api/export"` en `<a download>`
  - [x] Bouton "Supprimer mon compte" — déclenche confirmation (dialog ou `window.confirm`)
  - [x] Sur confirmation → `fetch DELETE /api/account` → redirect vers `/login`
  - [x] Lien "Retour" vers `/dashboard`

- [x] Ajouter lien vers `/account` dans le dashboard (AC: 6)
  - [x] `src/app/(app)/dashboard/page.tsx` — ajouter lien "Mon compte"

## Dev Notes

### Pattern auth dans les Route Handlers

Toujours utiliser `auth()` de `@/lib/auth` pour vérifier la session :

```typescript
import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("Non authentifié", "UNAUTHORIZED", 401)
  }
  // ...
}
```

### `src/lib/api-error.ts`

```typescript
export function apiError(message: string, code: string, status: number): Response {
  return Response.json({ error: message, code }, { status })
}
```

Ce helper est utilisé dans TOUTES les routes API du projet (epics 2, 3, 4) — bien le créer ici.

### Suppression en cascade

Le schéma Prisma actuel a déjà `onDelete: Cascade` sur `Account` et `Session` via la relation `User`. Supprimer l'utilisateur suffit — Prisma supprime Account + Session automatiquement.

```typescript
await prisma.user.delete({ where: { id: session.user.id } })
```

Pas besoin d'une `$transaction` explicite pour le MVP — la cascade Prisma gère l'atomicité. En revanche, quand les modèles Deck/Card/Review seront ajoutés (epic 2 + 3), il faudra s'assurer que leurs relations sur User ont aussi `onDelete: Cascade`.

### Export JSON — structure cible

```typescript
const exportData = {
  exportedAt: new Date().toISOString(),
  user: {
    email: session.user.email,
    createdAt: user.createdAt,
  },
  decks: [], // rempli à partir de l'epic 2
}
```

Retourner en tant que téléchargement :

```typescript
return new Response(JSON.stringify(exportData, null, 2), {
  headers: {
    "Content-Type": "application/json",
    "Content-Disposition": `attachment; filename="ilovecards-export.json"`,
  },
})
```

### Page `/account` — interaction client

La page doit être un Server Component pour afficher l'email, mais le bouton "Supprimer" nécessite une interaction client. Deux options :
1. **Recommandée** : Extraire uniquement le bouton de suppression dans un `"use client"` composant `DeleteAccountButton.tsx`
2. Alternative : Server Action avec redirect

Utiliser l'option 1 — pattern standard pour cette app (SC avec îlots client).

```tsx
// src/app/(app)/account/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import DeleteAccountButton from "./DeleteAccountButton"

export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <main>
      <h1>Mon compte</h1>
      <p>{session.user?.email}</p>
      <a href="/api/export" download="ilovecards-export.json">
        Exporter mes données
      </a>
      <DeleteAccountButton />
    </main>
  )
}
```

```tsx
// src/app/(app)/account/DeleteAccountButton.tsx
"use client"
import { useRouter } from "next/navigation"

export default function DeleteAccountButton() {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Supprimer définitivement ton compte ? Cette action est irréversible.")) return
    const res = await fetch("/api/account", { method: "DELETE" })
    if (res.ok) router.push("/login")
  }

  return (
    <button onClick={handleDelete}>
      Supprimer mon compte
    </button>
  )
}
```

### État actuel du dashboard

`src/app/(app)/dashboard/page.tsx` existe mais son contenu exact n'est pas critique pour cette story — ajouter juste un lien `<a href="/account">Mon compte</a>`.

### Routing dans (app)

Le groupe `(app)` est protégé via `src/app/(app)/layout.tsx` qui vérifie la session. La page `/account` bénéficiera automatiquement de cette protection. Redondance `auth()` dans la page elle-même recommandée pour récupérer `session.user.email`.

### Références architecture

- Route handlers : `src/app/api/account/route.ts`, `src/app/api/export/route.ts` [Source: architecture.md#API & Communication]
- Suppression RGPD cascade : [Source: architecture.md#Suppression RGPD]
- Format erreur API : `{ error: string, code?: string }` [Source: architecture.md#Format d'erreur standardisé]
- Helper `api-error.ts` : [Source: architecture.md#API & Communication]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

- src/lib/api-error.ts (NEW)
- src/app/api/account/route.ts (NEW)
- src/app/api/export/route.ts (NEW)
- src/app/(app)/account/page.tsx (NEW)
- src/app/(app)/account/DeleteAccountButton.tsx (NEW)
- src/app/(app)/dashboard/page.tsx (MODIFIED)
- _bmad-output/implementation-artifacts/sprint-status.yaml (MODIFIED)

### Change Log

- 2026-05-08 : Story 1.4 implémentée — suppression compte (DELETE /api/account), export JSON (GET /api/export), page /account avec confirmation, helper apiError partagé
