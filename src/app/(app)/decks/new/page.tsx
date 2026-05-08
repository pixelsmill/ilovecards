import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateDeckSchema } from "@/lib/schemas/deck"
import DeckForm from "@/features/decks/DeckForm"

export default async function NewDeckPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  async function createDeck(formData: FormData) {
    "use server"
    const s = await auth()
    if (!s?.user?.id) redirect("/login")
    const parsed = CreateDeckSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      accentColor: formData.get("accentColor") || "#6366f1",
    })
    if (!parsed.success) return
    await prisma.deck.create({ data: { ...parsed.data, userId: s.user.id } })
    redirect("/decks")
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Nouveau deck</h1>
          <Link href="/decks" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Retour
          </Link>
        </div>
        <DeckForm action={createDeck} submitLabel="Créer le deck" />
      </div>
    </main>
  )
}
