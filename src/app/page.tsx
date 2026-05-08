import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import CardRenderer from "@/components/card-renderer/CardRenderer"

const DEMO_CARDS = [
  { notion: "Le rasoir d'Ockham", developpement: "À hypothèses égales, la plus simple est la meilleure.", template: "quote", color: "#6366f1" },
  { notion: "La loi des grands nombres", developpement: "Plus l'échantillon est grand, plus la moyenne empirique se rapproche de l'espérance théorique.", template: "equation", color: "#ec4899" },
  { notion: "L'effet de halo", developpement: "Un trait positif d'une personne influence positivement la perception de ses autres traits.", template: "magazine", color: "#f97316" },
  { notion: "La mémoire de travail", developpement: "Système cognitif de capacité limitée qui maintient et manipule l'information à court terme.", template: "poster", color: "#06b6d4" },
  { notion: "La répétition espacée", developpement: "Réviser à intervalles croissants optimise la mémorisation à long terme.", template: "color-block", color: "#22c55e" },
  { notion: "Le biais de confirmation", developpement: "Tendance à favoriser les informations qui confirment ses croyances préexistantes.", template: "sature", color: "#8b5cf6" },
]

const FEATURES = [
  { icon: "✦", title: "Import intelligent", desc: "Texte, PDF ou URL — l'IA extrait les concepts clés et génère tes cartes en quelques secondes." },
  { icon: "↻", title: "Répétition espacée", desc: "L'algorithme SRS adapte le rythme de révision à ta mémoire pour retenir plus longtemps." },
  { icon: "◈", title: "8 formats de cartes", desc: "Poster, équation, magazine, citation… chaque template est pensé pour un type de notion." },
  { icon: "⊕", title: "30 cartes offertes", desc: "Commence sans CB. 30 crédits IA à l'inscription, +1 carte générée par jour ensuite." },
]

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div style={{ fontFamily: "var(--font-spectral), serif" }}>

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
        style={{ background: "rgba(63,63,70,0.92)", backdropFilter: "blur(12px)" }}
      >
        <span className="text-lg font-bold tracking-tight" style={{ color: "#FBF9F4" }}>ilovecards</span>
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-1.5 rounded-full border transition-colors"
          style={{ color: "#FBF9F4", borderColor: "rgba(251,249,244,0.2)" }}
        >
          Connexion
        </Link>
      </nav>

      {/* HERO */}
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 pt-14 pb-20 text-center"
        style={{ background: "#3f3f46" }}
      >
        <p
          className="text-xs font-medium uppercase tracking-widest mb-6"
          style={{ color: "#C68A3A", fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Mémorisation IA
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight max-w-2xl mb-6"
          style={{ color: "#FBF9F4" }}
        >
          Transforme tout en flashcards.
        </h1>
        <p className="text-base sm:text-lg max-w-md mb-10 leading-relaxed" style={{ color: "#9B9289" }}>
          Colle un texte, une URL ou un PDF. L&apos;IA génère des cartes, toi tu révises avec la répétition espacée.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <Link
            href="/login"
            className="rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#FBF9F4", color: "#1A1814" }}
          >
            Commencer — c&apos;est gratuit
          </Link>
        </div>
        <p className="text-xs" style={{ color: "#6B6356" }}>30 cartes offertes · Sans carte bancaire</p>

        {/* Cards preview */}
        <div className="relative mt-16 flex items-end justify-center gap-0" style={{ height: 300 }}>
          {DEMO_CARDS.slice(0, 3).map((card, i) => {
            const rotations = [-8, 0, 8]
            const translateY = [10, -10, 10]
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{
                  transform: `rotate(${rotations[i]}deg) translateY(${translateY[i]}px)`,
                  zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
                  marginLeft: i > 0 ? "-24px" : 0,
                  filter: i !== 1 ? "brightness(0.7)" : "none",
                }}
              >
                <CardRenderer
                  card={{ notion: card.notion, developpement: card.developpement, source: null, template: card.template }}
                  size="preview"
                  accentColor={card.color}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20" style={{ background: "#FBF9F4" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14" style={{ color: "#1A1814" }}>
            Tout ce qu&apos;il faut pour mémoriser mieux
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg"
                    style={{ color: "#C68A3A", fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    {f.icon}
                  </span>
                  <h3 className="font-bold text-base" style={{ color: "#1A1814" }}>{f.title}</h3>
                </div>
                <p className="text-sm leading-relaxed pl-8" style={{ color: "#6B6356" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARDS SHOWCASE */}
      <section className="px-6 py-20 overflow-hidden" style={{ background: "#3f3f46" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4" style={{ color: "#FBF9F4" }}>
            8 formats pour mémoriser autrement
          </h2>
          <p className="text-center text-sm mb-14" style={{ color: "#6B6356" }}>
            L&apos;IA choisit le template adapté à chaque notion
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {DEMO_CARDS.map((card, i) => (
              <div key={i} className="flex-shrink-0">
                <CardRenderer
                  card={{ notion: card.notion, developpement: card.developpement, source: null, template: card.template }}
                  size="preview"
                  accentColor={card.color}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20" style={{ background: "#FBF9F4" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "#1A1814" }}>
            Simple et gratuit pour commencer
          </h2>
          <p className="text-sm mb-12" style={{ color: "#6B6356" }}>
            Pas de CB, pas d&apos;engagement. Commence maintenant.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {/* Free */}
            <div
              className="flex-1 max-w-xs rounded-2xl p-8 text-left space-y-4 border"
              style={{ background: "#fff", borderColor: "rgba(26,24,20,0.1)" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#C68A3A", fontFamily: "var(--font-jetbrains-mono), monospace" }}>Gratuit</p>
                <p className="text-4xl font-bold" style={{ color: "#1A1814" }}>0 €</p>
                <p className="text-xs mt-1" style={{ color: "#9B9289" }}>pour toujours</p>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: "#1A1814" }}>
                {[
                  "30 cartes IA à l'inscription",
                  "+1 carte générée par jour",
                  "Révisions illimitées",
                  "8 templates de cartes",
                  "Import texte, PDF, URL",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#22c55e" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block text-center rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 mt-4"
                style={{ background: "#3f3f46", color: "#FBF9F4" }}
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div
              className="flex-1 max-w-xs rounded-2xl p-8 text-left space-y-4 border"
              style={{ background: "#3f3f46", borderColor: "transparent" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#C68A3A", fontFamily: "var(--font-jetbrains-mono), monospace" }}>Pro</p>
                <p className="text-4xl font-bold" style={{ color: "#FBF9F4" }}>Bientôt</p>
                <p className="text-xs mt-1" style={{ color: "#6B6356" }}>en préparation</p>
              </div>
              <ul className="space-y-2 text-sm" style={{ color: "#9B9289" }}>
                {[
                  "Génération IA illimitée",
                  "Partage de decks",
                  "Export Anki / CSV",
                  "Statistiques avancées",
                  "Support prioritaire",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#6B6356" }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full rounded-xl py-2.5 text-sm font-semibold opacity-40 cursor-not-allowed mt-4"
                style={{ background: "#FBF9F4", color: "#1A1814" }}
              >
                Bientôt disponible
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 flex items-center justify-between text-xs" style={{ background: "#3f3f46", color: "#6B6356" }}>
        <span className="font-bold" style={{ color: "#FBF9F4" }}>ilovecards</span>
        <span>© 2025 — Fait avec ♥</span>
      </footer>
    </div>
  )
}
