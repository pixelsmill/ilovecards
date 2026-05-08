export interface CardState {
  easeFactor: number   // default 2.5
  interval: number     // days since last review, default 0
  repetitions: number  // number of successful reviews in a row, default 0
}

export type ReviewAction = 'dismiss' | 'fail'

export interface ReviewResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

const MIN_EASE_FACTOR = 1.3

// SM-2 quality mapping:
//   dismiss (↑ haut — carte connue) → quality 4
//   fail    (↓ bas  — pas retenu)   → quality 1
function smEaseFactor(current: number, quality: number): number {
  const next = current + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  return Math.max(next, MIN_EASE_FACTOR)
}

export function calculateNextReview(card: CardState, action: ReviewAction): ReviewResult {
  let { easeFactor, interval, repetitions } = card

  if (action === 'dismiss') {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
    easeFactor = smEaseFactor(easeFactor, 4)
  } else {
    interval = 1
    repetitions = 0
    easeFactor = smEaseFactor(easeFactor, 1)
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)
  nextReviewAt.setHours(0, 0, 0, 0)

  return { easeFactor, interval, repetitions, nextReviewAt }
}
