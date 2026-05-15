import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateDeckSchema } from "@/lib/schemas/deck"
import DeckForm from "@/features/decks/DeckForm"
import Breadcrumb from "@/components/Breadcrumb"

export default async function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params
  const deck = await prisma.deck.findUnique({ where: { id } })
  if (!deck || deck.userId !== session.user.id) notFound()

  async function updateDeck(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s?.user?.id) redirect("/login")
    const parsed = UpdateDeckSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      accentColor: formData.get("accentColor") || undefined,
    })
    if (!parsed.success) return
    await prisma.deck.update({ where: { id }, data: parsed.data })
    redirect(`/decks/${id}`)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Accueil", href: "/dashboard" }, { label: deck.name, href: `/decks/${id}` }, { label: "Modifier" }]} />
        <h1 className="text-xl font-bold tracking-tight">Modifier le deck</h1>
        <DeckForm
          action={updateDeck}
          defaultValues={{ name: deck.name, description: deck.description ?? undefined, accentColor: deck.accentColor }}
          submitLabel="Enregistrer"
        />
      </div>
    </main>
  )
}
