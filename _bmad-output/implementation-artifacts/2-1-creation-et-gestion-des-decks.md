# Story 2.1 : Création et gestion des decks

Status: in-progress

## Story

En tant qu'utilisateur,
je veux créer, modifier et supprimer des decks avec un nom, une description optionnelle et une couleur d'accent,
afin d'organiser mes cartes par sujet.

## Acceptance Criteria

1. `POST /api/decks` avec session + `{ name, description?, accentColor }` crée un deck et le retourne (FR5)
2. `GET /api/decks` retourne la liste des decks de l'utilisateur avec `{ id, name, accentColor, cardCount }` (FR8)
3. `PUT /api/decks/[id]` met à jour name/description/accentColor — retourne 403 si le deck n'appartient pas à l'utilisateur (FR6)
4. `DELETE /api/decks/[id]` supprime le deck et toutes ses cartes (cascade Prisma) — retourne 403 si non propriétaire (FR7)
5. `POST /api/decks` avec `name` vide retourne `{ error, code: "INVALID_INPUT" }` 400
6. Tout appel sans session retourne 401 UNAUTHORIZED
7. La page `/decks` liste les decks avec nom, couleur et nombre de cartes — lien "Nouveau deck"
8. La page `/decks/new` contient un formulaire (name requis, description, colorPicker) — soumet via Server Action
9. La page `/decks/[id]` affiche le deck + ses cartes (liste vide pour l'instant) + liens modifier/supprimer
10. La page `/decks/[id]/edit` permet de modifier le deck — soumet via Server Action
11. Le dashboard affiche un lien vers `/decks`

## Tasks / Subtasks

- [ ] Étendre le schéma Prisma + migration (AC: 1, 2, 3, 4)
  - [ ] Ajouter modèle `Deck` (id, userId, name, description, accentColor, createdAt, updatedAt) avec relation User + onDelete: Cascade
  - [ ] Ajouter modèle `Card` (id, deckId, notion, developpement, source, template, easeFactor, interval, repetitions, nextReviewAt, lastReviewAt, createdAt, updatedAt) avec relation Deck + onDelete: Cascade
  - [ ] Mettre à jour relation `User` avec `decks Deck[]`
  - [ ] Exécuter `npx prisma migrate dev --name add_deck_card`

- [ ] Créer `src/lib/schemas/deck.ts` (AC: 1, 5)
  - [ ] `CreateDeckSchema` : name (min 1, max 100), description (max 500, optional), accentColor (hex string, default #6366f1)
  - [ ] `UpdateDeckSchema` : même champs, tous optionnels

- [ ] Créer `src/app/api/decks/route.ts` (AC: 1, 2, 5, 6)
  - [ ] `GET` : retourne `prisma.deck.findMany({ where: { userId }, include: { _count: { select: { cards: true } } } })`
  - [ ] `POST` : valide avec CreateDeckSchema, crée le deck, retourne 201

- [ ] Créer `src/app/api/decks/[id]/route.ts` (AC: 3, 4, 6)
  - [ ] `GET` : retourne le deck + ses cartes (pour la page détail)
  - [ ] `PUT` : vérifie ownership (403 si non propriétaire), valide UpdateDeckSchema, met à jour
  - [ ] `DELETE` : vérifie ownership (403), supprime (cascade sur cards)

- [ ] Créer `src/features/decks/DeckForm.tsx` (AC: 8, 10)
  - [ ] Champ name (input text, requis)
  - [ ] Champ description (textarea, optionnel)
  - [ ] ColorPicker : grille de 8 couleurs prédéfinies (pastilles cliquables)
  - [ ] Submit via Server Action (create ou update selon mode)

- [ ] Créer `src/features/decks/DeckCard.tsx` (AC: 7)
  - [ ] Affiche nom + bande de couleur d'accent + compteur de cartes
  - [ ] Liens vers `/decks/[id]`

- [ ] Créer pages decks (AC: 7, 8, 9, 10)
  - [ ] `src/app/(app)/decks/page.tsx` — liste via Prisma direct (Server Component)
  - [ ] `src/app/(app)/decks/new/page.tsx` — DeckForm en mode création
  - [ ] `src/app/(app)/decks/[id]/page.tsx` — détail deck + liste cartes vide + actions
  - [ ] `src/app/(app)/decks/[id]/edit/page.tsx` — DeckForm en mode édition

- [ ] Mettre à jour le dashboard (AC: 11)
  - [ ] `src/app/(app)/dashboard/page.tsx` — lien vers `/decks`

## Dev Notes

### Modèles Prisma à ajouter

```prisma
model Deck {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  accentColor String   @default("#6366f1")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards       Card[]
}

model Card {
  id            String    @id @default(cuid())
  deckId        String
  notion        String
  developpement String?
  source        String?
  template      String    @default("minimaliste")
  easeFactor    Float     @default(2.5)
  interval      Int       @default(0)
  repetitions   Int       @default(0)
  nextReviewAt  DateTime  @default(now())
  lastReviewAt  DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deck          Deck      @relation(fields: [deckId], references: [id], onDelete: Cascade)
}
```

Ajouter aussi `decks Deck[]` dans le modèle `User` existant.

### Migration

```bash
npx prisma migrate dev --name add_deck_card
```

Cela met à jour Neon via `DATABASE_URL_UNPOOLED`. Vérifier que la migration s'applique sans erreur.

### Zod schemas — `src/lib/schemas/deck.ts`

```typescript
import { z } from "zod"

export const ACCENT_COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#8b5cf6", "#ef4444",
]

export const CreateDeckSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
})

export const UpdateDeckSchema = CreateDeckSchema.partial()

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
```

### Pattern ownership check (à réutiliser dans toutes les routes deck/card)

```typescript
const deck = await prisma.deck.findUnique({ where: { id: params.id } })
if (!deck) return apiError("Deck introuvable", "DECK_NOT_FOUND", 404)
if (deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)
```

### Pattern GET /api/decks avec compteur de cartes

```typescript
const decks = await prisma.deck.findMany({
  where: { userId: session.user.id },
  include: { _count: { select: { cards: true } } },
  orderBy: { createdAt: "desc" },
})
// Mapper pour exposer cardCount
return Response.json(decks.map(d => ({ ...d, cardCount: d._count.cards })))
```

### Server Actions dans les pages (pattern établi en story 1.3)

```typescript
// Dans new/page.tsx — Server Action inline
async function createDeck(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const data = CreateDeckSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    accentColor: formData.get("accentColor") || "#6366f1",
  })
  await prisma.deck.create({ data: { ...data, userId: session.user.id } })
  redirect("/decks")
}
```

### ColorPicker — pastilles prédéfinies (pas de free input)

```tsx
// Dans DeckForm.tsx
{ACCENT_COLORS.map(color => (
  <button
    key={color}
    type="button"
    name="accentColor"
    value={color}
    className={cn(
      "w-8 h-8 rounded-full border-2 transition-all",
      selectedColor === color ? "border-zinc-900 scale-110" : "border-transparent"
    )}
    style={{ backgroundColor: color }}
    onClick={() => setSelectedColor(color)}
  />
))}
<input type="hidden" name="accentColor" value={selectedColor} />
```

`DeckForm` doit être `"use client"` pour gérer l'état du color picker. La Server Action est passée en prop `action`.

### Pages — Server Components sauf DeckForm

- `decks/page.tsx` : Server Component, fetch Prisma direct, passe les decks à `DeckList`
- `decks/new/page.tsx` : Server Component contenant la Server Action + `<DeckForm>`
- `decks/[id]/page.tsx` : Server Component, fetch deck + cards, affiche lien "Réviser", "Modifier", bouton "Supprimer"
- `decks/[id]/edit/page.tsx` : Server Component contenant Server Action update + `<DeckForm defaultValues={deck}>`

### Suppression deck depuis la page détail

Le bouton Supprimer nécessite une interaction client (confirmation). Créer `DeleteDeckButton.tsx` ("use client") sur le pattern `DeleteAccountButton.tsx` de story 1.4.

### Fichiers existants à NE PAS casser

- `src/lib/auth.ts` — ne pas toucher
- `src/lib/auth.config.ts` — ne pas toucher
- `src/lib/prisma.ts` — ne pas toucher (juste importer le singleton)
- `src/lib/api-error.ts` — déjà créé en story 1.4, à importer
- `src/app/(app)/layout.tsx` — ne pas toucher
- `src/app/(app)/account/` — ne pas toucher

### Références architecture

- Modèles Prisma : [Source: architecture.md#Data Architecture]
- Routes API decks : [Source: architecture.md#API & Communication]
- Structure dossiers : [Source: architecture.md#Structure du projet]
- Mapping FR5-FR8 : [Source: architecture.md#Mapping FR → répertoires]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

### Change Log
