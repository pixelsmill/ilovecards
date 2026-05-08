import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"
import { calculateNextReview } from "@/lib/sm2"
import { z } from "zod"

const ReviewSchema = z.object({
  cardId: z.string().cuid(),
  action: z.enum(["dismiss", "fail"]),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) return apiError("Données invalides", "INVALID_INPUT", 400)

  const { cardId, action } = parsed.data

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { deck: true },
  })
  if (!card) return apiError("Carte introuvable", "CARD_NOT_FOUND", 404)
  if (card.deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)

  const result = calculateNextReview(
    { easeFactor: card.easeFactor, interval: card.interval, repetitions: card.repetitions },
    action,
  )

  const [updated] = await prisma.$transaction([
    prisma.card.update({
      where: { id: cardId },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        lastReviewAt: new Date(),
      },
    }),
    prisma.review.create({
      data: {
        cardId,
        deckId: card.deckId,
        userId: session.user.id,
        action,
      },
    }),
  ])

  return Response.json(updated)
}
