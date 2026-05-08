# Story 3.1 : Moteur SM-2 — fonction pure & tests

Status: done

## Story

En tant que développeur,
je veux une implémentation SM-2 pure et testée,
afin que tous les calculs d'intervalles soient corrects et isolés de l'interface.

## Acceptance Criteria

1. `src/lib/sm2.ts` exporte `calculateNextReview(card: CardState, action: 'dismiss' | 'fail'): ReviewResult`
2. action `'dismiss'` → qualité SM-2 = 4, interval croît (1 → 6 → round(prev * ef))
3. action `'fail'` → interval = 1, repetitions = 0, easeFactor diminue
4. easeFactor ne descend jamais sous 1.3
5. 12 tests passent (vitest run)

## File List

- src/lib/sm2.ts
- src/lib/sm2.test.ts

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

- Quality mapping: dismiss → 4 (easeFactor inchangé), fail → 1 (easeFactor -0.54)
- 12 tests passent dont : première révision, 2e/3e révisions, plancher easeFactor, récupération après fail

### Change Log

- Created SM-2 implementation and tests (Date: 2026-05-08)
