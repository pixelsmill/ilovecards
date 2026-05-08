# Story 2.3 : Création d'une carte avec sélecteur de template

Status: done

## Story

En tant qu'utilisateur,
je veux créer une carte manuellement et choisir son template parmi des aperçus visuels,
afin de concevoir l'expérience visuelle de chaque carte dès la création.

## Acceptance Criteria

1. La page `/decks/[id]/cards/new` affiche un formulaire avec notion (requis), développement et source (optionnels) (FR9)
2. Le TemplatePicker affiche les 8 templates via `<CardRenderer size="thumb">` (FR11)
3. `POST /api/cards` avec session + `{ deckId, notion, template }` crée la carte et retourne 201 (FR9, FR10)
4. `POST /api/cards` avec template hors enum retourne 400 INVALID_INPUT
5. `POST /api/cards` sans session retourne 401 UNAUTHORIZED
6. `POST /api/cards` sur un deck n'appartenant pas à l'utilisateur retourne 403 FORBIDDEN
7. Après création, l'utilisateur est redirigé vers `/decks/[id]` et voit la nouvelle carte

## Tasks / Subtasks

- [x] Créer `src/lib/schemas/card.ts`
  - [x] TEMPLATES const array + TemplateType
  - [x] CreateCardSchema : deckId (cuid), notion (1-500), developpement (max 2000, optional), source (max 200, optional), template (enum)
  - [x] UpdateCardSchema : notion/developpement/source/template tous optionnels

- [x] Créer `src/app/api/cards/route.ts`
  - [x] POST : auth, Zod, ownership check deck, prisma.card.create, 201

- [x] Créer `src/features/cards/TemplatePicker.tsx` ("use client")
  - [x] Grid 4 colonnes, 8 templates via CardRenderer size="thumb"
  - [x] Outline dynamique sur le template sélectionné

- [x] Créer `src/features/cards/CardForm.tsx` ("use client")
  - [x] Champs notion (requis), developpement, source
  - [x] TemplatePicker intégré, hidden input template
  - [x] Action prop + deckId hidden input

- [x] Créer `src/app/(app)/decks/[id]/cards/new/page.tsx`
  - [x] Server Component, fetch deck (ownership), Server Action createCard
  - [x] Redirige vers /decks/[id] après création

- [x] Mettre à jour sprint-status.yaml (2-3 → done)

## Dev Notes

### Card schema (src/lib/schemas/card.ts)

```typescript
export const TEMPLATES = ['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature'] as const
export type TemplateType = typeof TEMPLATES[number]

export const CreateCardSchema = z.object({
  deckId: z.string().cuid(),
  notion: z.string().min(1).max(500),
  developpement: z.string().max(2000).optional(),
  source: z.string().max(200).optional(),
  template: z.enum(['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature']).default('minimaliste'),
})
```

### API POST /api/cards

Ownership check: lookup deck by deckId, compare deck.userId with session.user.id.

### TemplatePicker

Uses CardRenderer size="thumb" with sample card `{ notion: "Concept clé", template }`.
Outline highlight: `outline: 2px solid accentColor` on selected, same pattern as DeckForm colorPicker.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- CreateCardSchema validates template against the 8-value enum
- Server Action in page.tsx re-validates Zod + ownership before creating card
- TemplatePicker passes accentColor from deck to CardRenderer for accurate preview

### File List

- src/lib/schemas/card.ts
- src/app/api/cards/route.ts
- src/features/cards/TemplatePicker.tsx
- src/features/cards/CardForm.tsx
- src/app/(app)/decks/[id]/cards/new/page.tsx

### Change Log

- Created story 2.3 files (Date: 2026-05-08)
