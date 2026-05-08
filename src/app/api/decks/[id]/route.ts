import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"
import { UpdateDeckSchema } from "@/lib/schemas/deck"

async function getDeckOwned(id: string, userId: string) {
  const deck = await prisma.deck.findUnique({ where: { id } })
  if (!deck) return { error: apiError("Deck introuvable", "DECK_NOT_FOUND", 404) }
  if (deck.userId !== userId) return { error: apiError("Accès refusé", "FORBIDDEN", 403) }
  return { deck }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const { deck, error } = await getDeckOwned(id, session.user.id)
  if (error) return error

  const deckWithCards = await prisma.deck.findUnique({
    where: { id },
    include: { cards: { orderBy: { createdAt: "desc" } } },
  })

  return Response.json(deckWithCards)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const { error } = await getDeckOwned(id, session.user.id)
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = UpdateDeckSchema.safeParse(body)
  if (!parsed.success) return apiError("Données invalides", "INVALID_INPUT", 400)

  const updated = await prisma.deck.update({ where: { id }, data: parsed.data })
  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const { error } = await getDeckOwned(id, session.user.id)
  if (error) return error

  await prisma.deck.delete({ where: { id } })
  return Response.json({ success: true })
}
