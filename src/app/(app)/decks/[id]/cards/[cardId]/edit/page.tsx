import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateCardSchema } from "@/lib/schemas/card"
import { fetchUnsplashImage } from "@/lib/unsplash"
import CardForm from "@/features/cards/CardForm"
import DeleteCardButton from "@/features/cards/DeleteCardButton"

export default async function EditCardPage({ params }: { params: Promise<{ id: string; cardId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: deckId, cardId } = await params
  const card = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } })
  if (!card || card.deck.userId !== session.user.id || card.deckId !== deckId) notFound()

  async function updateCard(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s?.user?.id) redirect("/login")

    const template = (formData.get("template") as string) || undefined
    const notion = (formData.get("notion") as string) || undefined
    let imageUrl: string | null | undefined = undefined
    if (template === "photo-overlay" && notion) {
      imageUrl = (await fetchUnsplashImage(notion)) ?? null
    } else if (template && template !== "photo-overlay") {
      imageUrl = null
    }

    const parsed = UpdateCardSchema.safeParse({
      notion,
      developpement: formData.get("developpement") || undefined,
      source: formData.get("source") || undefined,
      template,
      ...(imageUrl !== undefined && { imageUrl: imageUrl ?? undefined }),
    })
    if (!parsed.success) return

    const c = await prisma.card.findUnique({ where: { id: cardId }, include: { deck: true } })
    if (!c || c.deck.userId !== s.user.id) return

    await prisma.card.update({
      where: { id: cardId },
      data: imageUrl !== undefined ? { ...parsed.data, imageUrl } : parsed.data,
    })
    redirect(`/decks/${deckId}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Modifier la carte</h1>
          <Link href={`/decks/${deckId}`} className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← {card.deck.name}
          </Link>
        </div>

        <CardForm
          deckId={deckId}
          action={updateCard}
          accentColor={card.deck.accentColor}
          defaultValues={{
            notion: card.notion,
            developpement: card.developpement ?? undefined,
            source: card.source ?? undefined,
            template: card.template,
          }}
          submitLabel="Enregistrer"
        />

        <div className="pt-2">
          <DeleteCardButton cardId={cardId} deckId={deckId} />
        </div>
      </div>
    </main>
  )
}
