const CARD_FORMAT = `
Pour chaque concept, génère exactement un objet JSON sur une ligne (NDJSON) :
{"notion":"[Concept clé ≤80 chars — déjà une notion à mémoriser, pas un titre]","developpement":"[Explication 1-3 phrases]","template":"[template]"}

Templates : minimaliste, poster, quote, magazine, color-block, photo-overlay, equation, sature
- equation : formules, algorithmes, relations logiques
- quote : citations, principes, maximes
- poster : définitions courtes et percutantes
- magazine : concepts avec contexte riche
- minimaliste : par défaut

Règles : génère 5 à 15 flashcards. Réponds UNIQUEMENT avec des objets JSON, un par ligne, aucun autre texte.`

export const SYSTEM_PROMPT_EXTRACT = `Tu es un expert en création de flashcards pour la mémorisation.
Analyse le contenu fourni et extrais les concepts clés sous forme de flashcards.
Les cartes ne sont pas des Q&R classiques — la notion est déjà le contenu à mémoriser.
${CARD_FORMAT}`

export const SYSTEM_PROMPT_GENERATE = `Tu es un expert en création de flashcards pour la mémorisation.
À partir du sujet demandé, génère des flashcards couvrant les concepts essentiels.
Les cartes ne sont pas des Q&R classiques — la notion est déjà le contenu à mémoriser.
${CARD_FORMAT}`

export function buildUserMessage({
  content,
  prompt,
  sourceLabel,
}: {
  content?: string
  prompt?: string
  sourceLabel?: string
}) {
  const parts: string[] = []

  if (content) {
    const label = sourceLabel ?? "Document"
    parts.push(`${label} :\n\n${content}`)
  }

  if (prompt) {
    parts.push(content ? `Instructions : ${prompt}` : `Sujet : ${prompt}`)
  }

  return parts.join("\n\n---\n\n")
}
