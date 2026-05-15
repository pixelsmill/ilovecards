import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import { fetchUnsplashImage } from "@/lib/unsplash"

const FEATURES = [
  {
    icon: "✦",
    title: "3 assistants IA par deck",
    desc: "Ajout rapide, complétion intelligente, import massif depuis texte, PDF ou URL — l'IA s'adapte à ton workflow.",
  },
  {
    icon: "↻",
    title: "Répétition espacée",
    desc: "L'algorithme SRS calcule le bon moment pour réviser chaque carte et ancre les notions en mémoire longue durée.",
  },
  {
    icon: "◈",
    title: "8 formats visuels",
    desc: "Poster, équation, magazine, citation, photo… chaque template est pensé pour un type de notion.",
  },
  {
    icon: "⊕",
    title: "Gratuit pour commencer",
    desc: "30 crédits IA à l'inscription, +1 par jour. Révisions et création manuelle illimitées, sans CB.",
  },
]

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  const [verveineImg, cinemaImg] = await Promise.all([
    fetchUnsplashImage("verbena plant botanical"),
    fetchUnsplashImage("retro cinema neon night street"),
  ])

  const HERO_CARDS = [
    {
      notion: "Once Upon a Time in Hollywood",
      developpement: "9e film de Tarantino (2019). Fresque nostalgique sur le crépuscule de l'âge d'or hollywoodien.",
      template: "photo-overlay",
      imageUrl: cinemaImg ?? null,
      color: "#334155",
    },
    {
      notion: "La neuroplasticité",
      developpement: "Le cerveau adulte conserve la capacité de réorganiser ses connexions synaptiques en réponse à l'apprentissage.",
      template: "magazine",
      color: "#0d9488",
    },
    {
      notion: "E = mc²",
      developpement: "L'énergie d'un corps au repos est égale à sa masse multipliée par le carré de la vitesse de la lumière.",
      template: "equation",
      color: "#ec4899",
    },
  ]

  const TEMPLATE_CARDS = [
    {
      notion: "La Verveine officinale",
      developpement: "Plante herbacée aux propriétés sédatives et digestives, utilisée en phytothérapie depuis l'Antiquité.",
      template: "photo-overlay",
      imageUrl: verveineImg ?? null,
      color: "#22c55e",
    },
    {
      notion: "La mémoire de travail",
      developpement: "Système cognitif de capacité limitée (7 ± 2 éléments) qui maintient l'information à court terme.",
      template: "poster",
      color: "#6366f1",
    },
    {
      notion: "Le rasoir d'Ockham",
      developpement: "À hypothèses égales, la plus simple est préférable.",
      template: "quote",
      color: "#C68A3A",
    },
    {
      notion: "La neuroplasticité",
      developpement: "Capacité du cerveau à modifier ses connexions synaptiques tout au long de la vie.",
      template: "magazine",
      color: "#0d9488",
    },
    {
      notion: "E = mc²",
      developpement: "L'énergie est égale à la masse multipliée par le carré de la vitesse de la lumière.",
      template: "equation",
      color: "#ec4899",
    },
    {
      notion: "La répétition espacée",
      developpement: "Réviser à intervalles croissants optimise la mémorisation à long terme.",
      template: "color-block",
      color: "#22c55e",
    },
    {
      notion: "Le biais de confirmation",
      developpement: "Tendance à favoriser les informations qui confirment nos croyances préexistantes.",
      template: "sature",
      color: "#8b5cf6",
    },
    {
      notion: "Le photon",
      developpement: "Quantum d'énergie électromagnétique sans masse au repos, se déplaçant à c dans le vide.",
      template: "minimaliste",
      color: "#334155",
    },
  ]

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
          Flashcards assistées par IA
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight max-w-2xl mb-6"
          style={{ color: "#FBF9F4" }}
        >
          Crée, enrichis et retiens.
        </h1>
        <p className="text-base sm:text-lg max-w-md mb-10 leading-relaxed" style={{ color: "#9B9289" }}>
          L&apos;IA génère tes cartes, complète tes decks et adapte le rythme de révision à ta mémoire.
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

        {/* Cards fan */}
        <div className="relative mt-16 flex items-end justify-center" style={{ height: 300 }}>
          {HERO_CARDS.map((card, i) => {
            const rotations = [-9, 0, 9]
            const translateY = [14, -8, 14]
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{
                  transform: `rotate(${rotations[i]}deg) translateY(${translateY[i]}px)`,
                  zIndex: i === 0 ? 1 : i === 1 ? 3 : 2,
                  marginLeft: i > 0 ? "-28px" : 0,
                  filter: i !== 0 ? "none" : "brightness(0.65)",
                }}
              >
                <CardRenderer
                  card={{ notion: card.notion, developpement: card.developpement, source: null, template: card.template, imageUrl: "imageUrl" in card ? card.imageUrl : null }}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4" style={{ color: "#1A1814" }}>
            Tout ce qu&apos;il faut pour mémoriser mieux
          </h2>
          <p className="text-center text-sm mb-14" style={{ color: "#9B9289" }}>
            De la création à la révision, l&apos;IA t&apos;accompagne à chaque étape
          </p>
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

      {/* TEMPLATES SHOWCASE */}
      <section className="px-6 py-20 overflow-hidden" style={{ background: "#3f3f46" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4" style={{ color: "#FBF9F4" }}>
            8 formats pour mémoriser autrement
          </h2>
          <p className="text-center text-sm mb-14" style={{ color: "#6B6356" }}>
            L&apos;IA choisit le template adapté à chaque notion
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {TEMPLATE_CARDS.map((card, i) => (
              <div key={i} className="flex-shrink-0">
                <CardRenderer
                  card={{
                    notion: card.notion,
                    developpement: card.developpement,
                    source: null,
                    template: card.template,
                    imageUrl: "imageUrl" in card ? card.imageUrl : null,
                  }}
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
                  "3 assistants IA par deck",
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
