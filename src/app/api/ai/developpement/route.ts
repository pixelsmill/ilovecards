import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const notion = (body?.notion as string | undefined)?.trim()
  const deckName = (body?.deckName as string | undefined)?.trim() || ""
  if (!notion) return apiError("Notion manquante", "INVALID_INPUT", 400)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return apiError("Clé API manquante", "INTERNAL_ERROR", 500)

  const anthropic = new Anthropic({ apiKey })

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: `Tu rédiges le champ "développement" d'une flashcard de mémorisation.${deckName ? `\nDeck : ${deckName}` : ""}
Notion : ${notion}

Rédige 2 à 4 phrases claires et mémorables qui expliquent ou illustrent cette notion. Réponds uniquement avec le texte, sans titre ni mise en forme.`,
    }],
  })

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
  return Response.json({ developpement: text })
}
