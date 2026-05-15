import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DeckCard from "@/features/dashboard/DeckCard"

const QUOTES = [
  { text: "L'esprit n'est pas un vase à remplir, mais un feu à allumer.", author: "Plutarque" },
  { text: "Enseigner, c'est apprendre deux fois.", author: "Joseph Joubert" },
  { text: "Ce que l'on conçoit bien s'énonce clairement, et les mots pour le dire viennent aisément.", author: "Boileau" },
  { text: "Apprendre sans réfléchir est vain. Réfléchir sans apprendre est dangereux.", author: "Confucius" },
  { text: "La mémoire est le trésor et le gardien de toutes choses.", author: "Cicéron" },
  { text: "La répétition est la mère de toutes les sciences.", author: "Proverbe" },
  { text: "On ne sait bien que ce qu'on a pris la peine d'apprendre.", author: "Voltaire" },
  { text: "Le secret de l'avance, c'est de commencer.", author: "Mark Twain" },
  { text: "Toute connaissance est souvenir.", author: "Platon" },
  { text: "Ce qu'on apprend en faisant, on le retient en refaisant.", author: "Aristote" },
]

const ROTATIONS = [
  "-rotate-[1.5deg]",
  "rotate-[2deg]",
  "-rotate-[2deg]",
  "rotate-[1.5deg]",
  "-rotate-[1deg]",
  "rotate-[2.5deg]",
  "-rotate-[2.5deg]",
  "rotate-[1deg]",
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, accentColor: true, _count: { select: { cards: true } } },
    orderBy: { createdAt: "asc" },
  })

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-12">

      {/* Intro */}
      <header className="text-center mb-12 space-y-4 max-w-xs">
        <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">ilovecards</h1>
        <blockquote
          className="text-sm text-zinc-500 italic leading-relaxed"
          style={{ fontFamily: "var(--font-spectral), serif" }}
        >
          « {quote.text} »
          <cite className="not-italic block mt-2 text-[11px] text-zinc-400 tracking-widest uppercase">
            {quote.author}
          </cite>
        </blockquote>
      </header>

      {/* Floating deck grid */}
      <div className="flex flex-wrap gap-3 justify-center max-w-[480px]">

        {/* Rainbow CTA card */}
        <div
          className="-rotate-[1.5deg] hover:rotate-0 hover:scale-105 transition-all duration-300 hover:shadow-2xl w-36 aspect-[3/4] rounded-[18px] flex-shrink-0"
          style={{ background: "linear-gradient(145deg,#f43f5e 0%,#f97316 22%,#eab308 44%,#22c55e 62%,#3b82f6 80%,#8b5cf6 100%)" }}
        >
          <div className="h-full flex flex-col items-center justify-between p-4 py-6">
            <span
              className="text-white font-semibold text-sm text-center leading-snug"
              style={{ fontFamily: "var(--font-spectral), serif" }}
            >
              Tous les decks
            </span>
            <div className="flex flex-col gap-2 w-full">
              <Link
                href="/review?mode=browse"
                className="block text-center rounded-[9px] bg-white text-zinc-900 py-2 text-[11px] font-semibold hover:bg-zinc-100 transition-colors"
              >
                Voir les cartes
              </Link>
              <Link
                href="/review?mode=learn"
                className="block text-center rounded-[9px] py-2 text-[11px] font-semibold text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                Mémoriser
              </Link>
            </div>
          </div>
        </div>

        {/* Deck cards */}
        {decks.map((deck, i) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            name={deck.name}
            accentColor={deck.accentColor}
            cardCount={deck._count.cards}
            rotation={ROTATIONS[i % ROTATIONS.length]}
          />
        ))}

        {/* New deck */}
        <Link
          href="/decks/new"
          className="w-36 aspect-[3/4] rounded-[18px] flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rotate-[1deg] hover:rotate-0 hover:scale-105 transition-all duration-300 hover:border-zinc-400 hover:text-zinc-500"
          style={{ border: "2px dashed #d4d4d8" }}
        >
          <span className="text-3xl text-zinc-400 leading-none">+</span>
          <span className="text-[11px] text-zinc-400">Nouveau deck</span>
        </Link>

      </div>

    </main>
  )
}
