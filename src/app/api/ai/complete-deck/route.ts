import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)
  const userId = session.user.id

  const body = await req.json().catch(() => null)
  const deckId = (body?.deckId as string | undefined)?.trim()
  if (!deckId) return apiError("deckId manquant", "INVALID_INPUT", 400)

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { cards: { select: { notion: true }, orderBy: { createdAt: "desc" }, take: 50 } },
  })
  if (!deck || deck.userId !== userId) return apiError("Deck introuvable", "NOT_FOUND", 404)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return apiError("Clé API manquante", "INTERNAL_ERROR", 500)

  const anthropic = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const existingNotions = deck.cards.map(c => `- ${c.notion}`).join("\n")

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          stream: true,
          system: `Tu es un expert en création de flashcards. Tu proposes des cartes complémentaires pour enrichir un deck existant.
Format : un objet JSON par ligne (NDJSON) :
{"notion":"[Concept ≤80 chars]","developpement":"[2-3 phrases]","template":"[minimaliste|poster|quote|magazine|equation]"}
Génère exactement 5 cartes. Réponds UNIQUEMENT avec des objets JSON, un par ligne, aucun autre texte.`,
          messages: [{
            role: "user",
            content: `Deck : "${deck.name}"\n\nNotions déjà présentes :\n${existingNotions || "(aucune)"}\n\nPropose 5 nouvelles notions complémentaires, sans répéter ce qui existe.`,
          }],
        })

        let buffer = ""
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            buffer += event.delta.text
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith("{")) continue
              try {
                const card = JSON.parse(trimmed)
                if (card.notion && typeof card.notion === "string") {
                  controller.enqueue(encoder.encode(JSON.stringify(card) + "\n"))
                }
              } catch {}
            }
          }
        }
        if (buffer.trim().startsWith("{")) {
          try {
            const card = JSON.parse(buffer.trim())
            if (card.notion) controller.enqueue(encoder.encode(JSON.stringify(card) + "\n"))
          } catch {}
        }
        controller.enqueue(encoder.encode(JSON.stringify({ _done: true }) + "\n"))
      } catch {
        controller.enqueue(encoder.encode(JSON.stringify({ _error: true }) + "\n"))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}
