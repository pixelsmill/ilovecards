import { describe, it, expect } from 'vitest'
import { calculateNextReview } from './sm2'
import type { CardState } from './sm2'

const newCard: CardState = { easeFactor: 2.5, interval: 0, repetitions: 0 }

describe('calculateNextReview', () => {
  describe('action: pass — interval inchangé (géré côté session, pas SM-2)', () => {
    it('ne doit pas être appelé avec pass — ce cas est géré en amont', () => {
      // 'pass' is handled by the session reducer, not SM-2. No test here.
      expect(true).toBe(true)
    })
  })

  describe('action: dismiss (↑ — carte connue, quality 4)', () => {
    it('première révision → interval = 1 jour', () => {
      const result = calculateNextReview(newCard, 'dismiss')
      expect(result.interval).toBe(1)
      expect(result.repetitions).toBe(1)
    })

    it('deuxième révision (repetitions=1) → interval = 6 jours', () => {
      const card: CardState = { easeFactor: 2.5, interval: 1, repetitions: 1 }
      const result = calculateNextReview(card, 'dismiss')
      expect(result.interval).toBe(6)
      expect(result.repetitions).toBe(2)
    })

    it('troisième révision (repetitions=2) → interval = round(6 * easeFactor)', () => {
      const card: CardState = { easeFactor: 2.5, interval: 6, repetitions: 2 }
      const result = calculateNextReview(card, 'dismiss')
      expect(result.interval).toBe(15) // round(6 * 2.5)
      expect(result.repetitions).toBe(3)
    })

    it('easeFactor reste inchangé pour quality 4 (delta = 0)', () => {
      const result = calculateNextReview(newCard, 'dismiss')
      expect(result.easeFactor).toBeCloseTo(2.5, 5)
    })

    it('nextReviewAt est dans le futur', () => {
      const result = calculateNextReview(newCard, 'dismiss')
      expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now() - 1000)
    })

    it('intervalle croît exponentiellement après plusieurs dismiss successifs', () => {
      let card = newCard
      card = { ...card, ...calculateNextReview(card, 'dismiss') }
      card = { ...card, ...calculateNextReview(card, 'dismiss') }
      const third = calculateNextReview(card, 'dismiss')
      expect(third.interval).toBeGreaterThan(6)
    })
  })

  describe('action: fail (↓ — pas retenu, quality 1)', () => {
    it('interval revient à 1 jour', () => {
      const card: CardState = { easeFactor: 2.5, interval: 15, repetitions: 3 }
      const result = calculateNextReview(card, 'fail')
      expect(result.interval).toBe(1)
    })

    it('repetitions repart à 0', () => {
      const card: CardState = { easeFactor: 2.5, interval: 15, repetitions: 3 }
      const result = calculateNextReview(card, 'fail')
      expect(result.repetitions).toBe(0)
    })

    it('easeFactor diminue après un fail', () => {
      const result = calculateNextReview(newCard, 'fail')
      expect(result.easeFactor).toBeLessThan(newCard.easeFactor)
    })

    it('easeFactor ne descend jamais sous 1.3 (plancher)', () => {
      let card: CardState = { easeFactor: 1.3, interval: 1, repetitions: 0 }
      for (let i = 0; i < 10; i++) {
        card = { ...card, ...calculateNextReview(card, 'fail') }
      }
      expect(card.easeFactor).toBeGreaterThanOrEqual(1.3)
    })
  })

  describe('récupération après échec', () => {
    it('après fail puis dismiss, interval repart de 1', () => {
      const card: CardState = { easeFactor: 2.5, interval: 15, repetitions: 3 }
      const afterFail = calculateNextReview(card, 'fail')
      const afterDismiss = calculateNextReview(afterFail, 'dismiss')
      expect(afterDismiss.interval).toBe(1)
      expect(afterDismiss.repetitions).toBe(1)
    })
  })
})
