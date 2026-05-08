import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateCardSchema } from "@/lib/schemas/card"
import CardForm from "@/features/cards/CardForm"

export default async function NewCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id: deckId } = await params
  const deck = await prisma.deck.findUnique({ where: { id: deckId } })
  if (!deck || deck.userId !== session.user.id) notFound()

  async function createCard(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s?.user?.id) redirect("/login")

    const parsed = CreateCardSchema.safeParse({
      deckId: formData.get("deckId"),
      notion: formData.get("notion"),
      developpement: formData.get("developpement") || undefined,
      source: formData.get("source") || undefined,
      template: formData.get("template") || "minimaliste",
    })
    if (!parsed.success) return

    const d = await prisma.deck.findUnique({ where: { id: parsed.data.deckId } })
    if (!d || d.userId !== s.user.id) return

    await prisma.card.create({ data: parsed.data })
    redirect(`/decks/${deckId}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Nouvelle carte</h1>
          <Link href={`/decks/${deckId}`} className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← {deck.name}
          </Link>
        </div>
        <CardForm
          deckId={deckId}
          action={createCard}
          accentColor={deck.accentColor}
        />
      </div>
    </main>
  )
}
