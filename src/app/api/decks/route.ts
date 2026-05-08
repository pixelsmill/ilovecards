import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"
import { CreateDeckSchema } from "@/lib/schemas/deck"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(decks.map(d => ({ ...d, cardCount: d._count.cards, _count: undefined })))
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const parsed = CreateDeckSchema.safeParse(body)
  if (!parsed.success) return apiError("Données invalides", "INVALID_INPUT", 400)

  const deck = await prisma.deck.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return Response.json(deck, { status: 201 })
}
