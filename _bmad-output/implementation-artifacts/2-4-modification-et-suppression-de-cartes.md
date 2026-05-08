# Story 2.4 : Modification et suppression de cartes

Status: done

## Story

En tant qu'utilisateur,
je veux modifier ou supprimer mes cartes existantes,
afin de corriger des erreurs ou retirer des cartes qui ne me servent plus.

## Acceptance Criteria

1. La page `/decks/[id]/cards/[cardId]/edit` affiche le formulaire CardForm pré-rempli (FR12)
2. `PUT /api/cards/[id]` met à jour notion/developpement/source/template — retourne 403 si la carte n'appartient pas à l'utilisateur
3. `DELETE /api/cards/[id]` supprime la carte — retourne 403 si non propriétaire (FR13)
4. `PUT` ou `DELETE` sans session retourne 401 UNAUTHORIZED
5. Après modification, l'utilisateur est redirigé vers `/decks/[deckId]`
6. Le bouton "Supprimer" sur la page d'édition demande confirmation avant d'appeler DELETE

## Tasks / Subtasks

- [x] Créer `src/app/api/cards/[id]/route.ts`
  - [x] PUT : auth, ownership via deck, UpdateCardSchema, prisma.card.update
  - [x] DELETE : auth, ownership via deck, prisma.card.delete

- [x] Créer `src/features/cards/DeleteCardButton.tsx` ("use client")
  - [x] Bouton qui ouvre une confirmation, puis appelle DELETE /api/cards/[id] et redirige

- [x] Créer `src/app/(app)/decks/[id]/cards/[cardId]/edit/page.tsx`
  - [x] Server Component, fetch carte + deck (ownership), Server Action updateCard
  - [x] CardForm en mode édition + DeleteCardButton

- [x] Mettre à jour sprint-status.yaml (2-4 → done, epic-2 → done)

## Dev Notes

### Ownership check pour les cartes

```typescript
// Pour PUT/DELETE /api/cards/[id]
const card = await prisma.card.findUnique({ where: { id }, include: { deck: true } })
if (!card) return apiError("Carte introuvable", "CARD_NOT_FOUND", 404)
if (card.deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)
```

### DeleteCardButton — pattern DeleteDeckButton (story 2.1)

Même pattern : "use client", confirm(), fetch DELETE, router.push(/decks/[deckId]).

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- DeleteCardButton uses window.confirm + fetch DELETE + router.push (same pattern as DeleteDeckButton)
- Edit page fetches card with its deck to verify ownership chain: card.deck.userId === session.user.id
- UpdateCardSchema allows partial updates (all fields optional)

### File List

- src/app/api/cards/[id]/route.ts
- src/features/cards/DeleteCardButton.tsx
- src/app/(app)/decks/[id]/cards/[cardId]/edit/page.tsx

### Change Log

- Created story 2.4 files (Date: 2026-05-08)
