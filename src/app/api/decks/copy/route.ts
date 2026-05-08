import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const shareToken = body?.shareToken
  if (!shareToken || typeof shareToken !== "string") return apiError("Token manquant", "INVALID_INPUT", 400)

  const source = await prisma.deck.findUnique({
    where: { shareToken },
    include: { cards: { orderBy: { createdAt: "asc" } } },
  })
  if (!source) return apiError("Deck introuvable", "NOT_FOUND", 404)

  const newDeck = await prisma.deck.create({
    data: {
      userId: session.user.id,
      name: source.name,
      description: source.description,
      accentColor: source.accentColor,
      cards: {
        create: source.cards.map(card => ({
          notion: card.notion,
          developpement: card.developpement,
          source: card.source,
          template: card.template,
          imageUrl: card.imageUrl,
        })),
      },
    },
  })

  return Response.json({ id: newDeck.id }, { status: 201 })
}
