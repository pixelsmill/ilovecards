import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateCardSchema } from "@/lib/schemas/card"
import { fetchUnsplashImage } from "@/lib/unsplash"
import CardEditClient from "@/features/cards/CardEditClient"
import Breadcrumb from "@/components/Breadcrumb"

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

    const template = (formData.get("template") as string) || "minimaliste"
    const notion = (formData.get("notion") as string) || ""
    const existingImageUrl = (formData.get("imageUrl") as string) || undefined
    let imageUrl: string | undefined = undefined
    if (template === "photo-overlay") {
      if (existingImageUrl) {
        imageUrl = existingImageUrl
      } else if (notion) {
        imageUrl = (await fetchUnsplashImage(notion)) ?? undefined
      }
    }

    const parsed = CreateCardSchema.safeParse({
      deckId: formData.get("deckId"),
      notion,
      developpement: formData.get("developpement") || undefined,
      source: formData.get("source") || undefined,
      template,
      verified: formData.get("verified") === "true",
      ...(imageUrl !== undefined && { imageUrl }),
    })
    if (!parsed.success) return

    const d = await prisma.deck.findUnique({ where: { id: parsed.data.deckId } })
    if (!d || d.userId !== s.user.id) return

    await prisma.card.create({ data: parsed.data })
    redirect(`/decks/${deckId}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: "Mes decks", href: "/decks" }, { label: deck.name, href: `/decks/${deckId}` }, { label: "Nouvelle carte" }]} />
        <CardEditClient
          deckId={deckId}
          deckName={deck.name}
          accentColor={deck.accentColor}
          action={createCard}
          submitLabel="Créer la carte"
          defaultValues={{
            notion: "",
            template: "minimaliste",
            verified: true,
          }}
        />
      </div>
    </main>
  )
}
