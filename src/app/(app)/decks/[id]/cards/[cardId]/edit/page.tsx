import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateCardSchema } from "@/lib/schemas/card"
import { fetchUnsplashImage } from "@/lib/unsplash"
import CardEditClient from "@/features/cards/CardEditClient"
import Breadcrumb from "@/components/Breadcrumb"

export default async function EditCardPage({ params, searchParams }: { params: Promise<{ id: string; cardId: string }>; searchParams: Promise<{ returnTo?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: deckId, cardId } = await params
  const { returnTo } = await searchParams
  const safeReturnTo = returnTo?.startsWith("/") ? returnTo : undefined
  const [card, decks] = await Promise.all([
    prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } }),
    prisma.deck.findMany({ where: { userId: session.user.id }, select: { id: true, name: true, accentColor: true }, orderBy: { name: "asc" } }),
  ])
  if (!card || card.deck.userId !== session.user.id || card.deckId !== deckId) notFound()

  async function updateCard(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s?.user?.id) redirect("/login")

    const template = (formData.get("template") as string) || undefined
    const notion = (formData.get("notion") as string) || undefined
    const existingImageUrl = (formData.get("imageUrl") as string) || undefined
    let imageUrl: string | null | undefined = undefined
    if (template === "photo-overlay") {
      if (existingImageUrl) {
        imageUrl = existingImageUrl
      } else if (notion) {
        imageUrl = (await fetchUnsplashImage(notion)) ?? null
      }
    } else if (template && template !== "photo-overlay") {
      imageUrl = null
    }

    const parsed = UpdateCardSchema.safeParse({
      notion,
      developpement: formData.get("developpement") || undefined,
      source: formData.get("source") || undefined,
      template,
      verified: formData.get("verified") === "true",
      ...(imageUrl !== undefined && { imageUrl: imageUrl ?? undefined }),
    })
    if (!parsed.success) return

    const c = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } })
    if (!c || c.deck.userId !== s.user.id) return

    const targetDeckId = formData.get("targetDeckId") as string | null
    let resolvedDeckId = c.deckId
    if (targetDeckId && targetDeckId !== c.deckId) {
      const targetDeck = await prisma.deck.findUnique({ where: { id: targetDeckId } })
      if (targetDeck?.userId === s.user.id) resolvedDeckId = targetDeckId
    }

    await prisma.card.update({
      where: { id: cardId },
      data: {
        ...(imageUrl !== undefined ? { ...parsed.data, imageUrl } : parsed.data),
        ...(resolvedDeckId !== c.deckId && { deckId: resolvedDeckId }),
      },
    })

    const returnToValue = formData.get("returnTo") as string | null
    redirect(returnToValue?.startsWith("/") ? returnToValue : `/decks/${resolvedDeckId}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Mes decks", href: "/decks" }, { label: card.deck.name, href: `/decks/${deckId}` }, { label: "Modifier la carte" }]} />

        <CardEditClient
          deckId={deckId}
          cardId={cardId}
          deckName={card.deck.name}
          accentColor={card.deck.accentColor}
          action={updateCard}
          returnTo={safeReturnTo}
          decks={decks}
          defaultValues={{
            notion: card.notion,
            developpement: card.developpement ?? undefined,
            source: card.source ?? undefined,
            template: card.template,
            imageUrl: card.imageUrl,
            verified: card.verified,
          }}
        />
      </div>
    </main>
  )
}
