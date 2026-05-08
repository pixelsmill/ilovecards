import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"
import { CreateCardSchema } from "@/lib/schemas/card"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const parsed = CreateCardSchema.safeParse(body)
  if (!parsed.success) return apiError("Données invalides", "INVALID_INPUT", 400)

  const deck = await prisma.deck.findUnique({ where: { id: parsed.data.deckId } })
  if (!deck) return apiError("Deck introuvable", "DECK_NOT_FOUND", 404)
  if (deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)

  const card = await prisma.card.create({ data: parsed.data })
  return Response.json(card, { status: 201 })
}
