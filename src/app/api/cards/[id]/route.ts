import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"
import { UpdateCardSchema } from "@/lib/schemas/card"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const card = await prisma.card.findUnique({ where: { id }, include: { deck: true } })
  if (!card) return apiError("Carte introuvable", "CARD_NOT_FOUND", 404)
  if (card.deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)

  const body = await req.json().catch(() => null)
  const parsed = UpdateCardSchema.safeParse(body)
  if (!parsed.success) return apiError("Données invalides", "INVALID_INPUT", 400)

  const updated = await prisma.card.update({ where: { id }, data: parsed.data })
  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const card = await prisma.card.findUnique({ where: { id }, include: { deck: true } })
  if (!card) return apiError("Carte introuvable", "CARD_NOT_FOUND", 404)
  if (card.deck.userId !== session.user.id) return apiError("Accès refusé", "FORBIDDEN", 403)

  await prisma.card.delete({ where: { id } })
  return Response.json({ success: true })
}
