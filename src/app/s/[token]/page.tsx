import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import CopyDeckButton from "@/features/decks/CopyDeckButton"

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [deck, session] = await Promise.all([
    prisma.deck.findUnique({
      where: { shareToken: token },
      include: { cards: { orderBy: { createdAt: "asc" } } },
    }),
    auth(),
  ])

  if (!deck) notFound()

  const callbackUrl = `/s/${token}`

  return (
    <div style={{ fontFamily: "var(--font-spectral), serif", minHeight: "100svh", background: "#3f3f46" }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
        style={{ background: "rgba(63,63,70,0.92)", backdropFilter: "blur(12px)" }}
      >
        <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: "#FBF9F4" }}>
          ilovecards
        </Link>
        {!session && (
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-full border transition-colors"
            style={{ color: "#FBF9F4", borderColor: "rgba(251,249,244,0.2)" }}
          >
            Connexion
          </Link>
        )}
      </nav>

      <div className="pt-20 pb-20 px-6 max-w-3xl mx-auto">

        {/* Deck header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deck.accentColor }} />
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FBF9F4" }}>{deck.name}</h1>
        </div>
        <p className="text-sm mb-12 pl-6" style={{ color: "#9B9289" }}>
          {deck.cards.length} carte{deck.cards.length !== 1 ? "s" : ""}
        </p>

        {/* Cards grid */}
        {deck.cards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {deck.cards.map(card => (
              <CardRenderer
                key={card.id}
                card={card}
                size="preview"
                accentColor={deck.accentColor}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center space-y-3">
          <CopyDeckButton
            shareToken={token}
            isLoggedIn={!!session}
            callbackUrl={callbackUrl}
          />
          <p className="text-xs" style={{ color: "#6B6356" }}>
            Copie ce deck pour le mémoriser avec la répétition espacée
          </p>
        </div>
      </div>
    </div>
  )
}
