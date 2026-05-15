import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import CardRenderer from "@/components/card-renderer/CardRenderer"
import { fetchUnsplashImage } from "@/lib/unsplash"
import { ACCENT_COLORS } from "@/lib/schemas/deck"

const FEATURES = [
  {
    icon: "✦",
    title: "3 assistants IA par deck",
    desc: "Ajoute une idée en deux secondes, laisse l'IA compléter ton deck ou importe un texte entier — selon ton humeur du moment.",
  },
  {
    icon: "↻",
    title: "Mémorisation sans effort",
    desc: "L'algorithme apprend ta mémoire et te présente chaque carte au bon moment — ni trop tôt, ni trop tard.",
  },
  {
    icon: "◈",
    title: "8 formats visuels",
    desc: "Poster, citation, magazine, photo… chaque format met en valeur ce que tu veux retenir.",
  },
  {
    icon: "⊕",
    title: "Gratuit pour commencer",
    desc: "30 crédits IA à l'inscription, +1 par jour. Sessions illimitées et création manuelle sans restriction.",
  },
]

export default async function HomePage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  const [verveineImg, cinemaImg, aframeImg] = await Promise.all([
    fetchUnsplashImage("verbena plant botanical"),
    fetchUnsplashImage("spain melodrama fashion red dramatic"),
    fetchUnsplashImage("a-frame cabin forest architecture wood"),
  ])

  const HERO_CARDS = [
    {
      notion: "Les pions sont l'âme des échecs",
      developpement: "Ils définissent la structure de toute la partie. Une chaîne solide contrôle le centre et dicte le plan stratégique.",
      template: "poster",
      color: "#f43f5e",
    },
    {
      notion: "La Verveine officinale",
      developpement: "Plante aux propriétés apaisantes et digestives. Infusée, elle calme le stress et favorise le sommeil.",
      template: "photo-overlay",
      imageUrl: verveineImg ?? null,
      color: "#22c55e",
    },
    {
      notion: "Tacones Lejanos",
      developpement: "Film de Pedro Almodóvar (1991). Drame maternel et mélodrame flamboyant sur fond de passion et de trahison.",
      template: "photo-overlay",
      imageUrl: cinemaImg ?? null,
      color: "#f43f5e",
    },
    {
      notion: "L'autoconstruction",
      developpement: "Construire soi-même sa maison réduit les coûts de 30 à 50 %. L'A-frame, simple et solide, reste l'une des structures les plus accessibles.",
      template: "photo-overlay",
      imageUrl: aframeImg ?? null,
      color: "#C68A3A",
    },
    {
      notion: "Les émotions délivrent un message en 5 étapes",
      developpement: "Déclenchement, montée, pic, plateau, déclin. Traverser le cycle sans l'interrompre est la voie la plus courte vers la résolution.",
      template: "magazine",
      color: "#6366f1",
    },
  ]

  const TEMPLATE_CARDS = [
    {
      notion: "La Verveine officinale",
      developpement: "Plante aux propriétés apaisantes et digestives. Infusée, elle calme le stress et favorise le sommeil.",
      template: "photo-overlay",
      imageUrl: verveineImg ?? null,
      color: "#06b6d4",
    },
    {
      notion: "4 heures de concentration profonde valent une journée ordinaire",
      developpement: "Le Deep Work, c'est travailler sans interruption sur ce qui compte vraiment. Cal Newport en a fait une discipline.",
      template: "poster",
      color: "#06b6d4",
    },
    {
      notion: "La perfection est l'ennemie du bien.",
      developpement: "Voltaire. Attendre d'être prêt, c'est souvent ne jamais commencer.",
      template: "quote",
      color: "#06b6d4",
    },
    {
      notion: "70 % des gens se croient imposteurs au moins une fois",
      developpement: "Le syndrome de l'imposteur frappe surtout les plus compétents. Le reconnaître suffit souvent à le désamorcer.",
      template: "magazine",
      color: "#06b6d4",
    },
    {
      notion: "1 % mieux chaque jour",
      developpement: "S'améliorer de 1 % par jour produit une progression de 37× en un an. La régularité bat l'intensité.",
      template: "equation",
      color: "#06b6d4",
    },
    {
      notion: "La règle du 80/20",
      developpement: "20 % des actions produisent 80 % des résultats. Identifier ces leviers change tout.",
      template: "color-block",
      color: "#06b6d4",
    },
    {
      notion: "On ne procrastine pas par paresse, mais par peur",
      developpement: "La peur de l'échec ou du regard des autres bloque plus que la fatigue. Identifier la peur, c'est déjà commencer.",
      template: "sature",
      color: "#06b6d4",
    },
    {
      notion: "Le flow commence là où défi et compétence se rejoignent",
      developpement: "Ni trop facile, ni trop difficile. Csikszentmihalyi a découvert que cet équilibre produit un état de concentration absolue.",
      template: "minimaliste",
      color: "#06b6d4",
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
          Crée, enrichis et mémorise.
        </h1>
        <p className="text-base sm:text-lg max-w-md mb-10 leading-relaxed" style={{ color: "#9B9289" }}>
          L&apos;IA génère tes cartes, complète tes decks et s&apos;adapte à ta façon d&apos;apprendre.
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

        {/* Cards fan — 5 cartes, cinéma au centre */}
        <div className="relative mt-16 flex items-end justify-center" style={{ height: 320 }}>
          {HERO_CARDS.map((card, i) => {
            const rotations = [-16, -8, 0, 8, 16]
            const translateY = [22, 10, -8, 10, 22]
            const zIndexes = [1, 3, 5, 4, 2]
            const brightness = [0.55, 0.75, 1, 0.75, 0.55]
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{
                  transform: `rotate(${rotations[i]}deg) translateY(${translateY[i]}px)`,
                  zIndex: zIndexes[i],
                  marginLeft: i > 0 ? "-36px" : 0,
                  filter: `brightness(${brightness[i]})`,
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
            De la première idée à la maîtrise, l&apos;IA t&apos;accompagne à chaque étape
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

          <div className="mt-14 space-y-3">
            <p className="text-center text-xs uppercase tracking-widest" style={{ color: "#6B6356", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
              20 couleurs disponibles
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {ACCENT_COLORS.map(color => (
                <div
                  key={color}
                  className="w-7 h-7 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
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
                  "Sessions de mémorisation illimitées",
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
