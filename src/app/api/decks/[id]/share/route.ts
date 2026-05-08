import crypto from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError } from "@/lib/api-error"

async function getOwnedDeck(id: string, userId: string) {
  const deck = await prisma.deck.findUnique({ where: { id } })
  if (!deck) return { error: apiError("Deck introuvable", "NOT_FOUND", 404) }
  if (deck.userId !== userId) return { error: apiError("Accès refusé", "FORBIDDEN", 403) }
  return { deck }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const { deck, error } = await getOwnedDeck(id, session.user.id)
  if (error) return error

  const shareToken = deck!.shareToken ?? crypto.randomBytes(12).toString("base64url")
  await prisma.deck.update({ where: { id }, data: { shareToken } })
  return Response.json({ shareToken })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const { id } = await params
  const { error } = await getOwnedDeck(id, session.user.id)
  if (error) return error

  await prisma.deck.update({ where: { id }, data: { shareToken: null } })
  return new Response(null, { status: 204 })
}
