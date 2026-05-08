import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"
import { prisma } from "@/lib/prisma"
import { SYSTEM_PROMPT_EXTRACT, SYSTEM_PROMPT_GENERATE, buildUserMessage } from "@/lib/prompts/generate-cards"

const MAX_TEXT = 50000
const MAX_CREDITS = 30
const MS_PER_DAY = 86_400_000

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)
  const userId = session.user.id

  const formData = await req.formData().catch(() => null)
  if (!formData) return apiError("Données invalides", "INVALID_INPUT", 400)

  const prompt = (formData.get("prompt") as string | null)?.trim() || undefined
  const textRaw = (formData.get("text") as string | null)?.trim() || undefined
  const urlRaw = (formData.get("url") as string | null)?.trim() || undefined
  const file = formData.get("file") as File | null

  if (!prompt && !textRaw && !urlRaw && !file) return apiError("Aucune entrée fournie", "INVALID_INPUT", 400)

  // Credit check + daily refill
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiCredits: true, lastCreditAt: true },
  })
  if (!user) return apiError("Utilisateur introuvable", "UNAUTHORIZED", 401)

  const daysSince = Math.floor((Date.now() - user.lastCreditAt.getTime()) / MS_PER_DAY)
  const refilled = Math.min(MAX_CREDITS, user.aiCredits + daysSince)
  if (daysSince > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiCredits: refilled, lastCreditAt: new Date() },
    })
  }
  const currentCredits = daysSince > 0 ? refilled : user.aiCredits

  if (currentCredits <= 0) {
    return apiError("Tu as utilisé tous tes crédits — reviens demain pour +1 carte !", "NO_CREDITS", 402)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return apiError("Clé API manquante", "INTERNAL_ERROR", 500)

  const anthropic = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  // Resolve content
  let content: string | undefined = textRaw
  let sourceLabel: string | undefined
  let pdfBase64: string | undefined

  if (urlRaw && !content && !file) {
    try {
      const urlRes = await fetch(urlRaw, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ilovecards/1.0)" },
        signal: AbortSignal.timeout(10000),
      })
      const html = await urlRes.text()
      content = stripHtml(html)
      sourceLabel = `Page web (${new URL(urlRaw).hostname})`
    } catch {
      return apiError("Impossible de récupérer l'URL", "URL_FETCH_ERROR", 400)
    }
  }

  if (file && !content) {
    const bytes = await file.arrayBuffer()
    pdfBase64 = Buffer.from(bytes).toString("base64")
    sourceLabel = file.name
  }

  const hasSource = !!(content || pdfBase64)
  const systemPrompt = hasSource ? SYSTEM_PROMPT_EXTRACT : SYSTEM_PROMPT_GENERATE

  type ContentBlock =
    | { type: "text"; text: string }
    | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } }

  const messageContent: ContentBlock[] = []
  if (pdfBase64) {
    messageContent.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } })
    if (prompt) messageContent.push({ type: "text", text: `Instructions : ${prompt}` })
  } else {
    messageContent.push({ type: "text", text: buildUserMessage({ content, prompt, sourceLabel }) })
  }

  const stream = new ReadableStream({
    async start(controller) {
      let cardCount = 0
      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: messageContent }],
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
                  cardCount++
                  controller.enqueue(encoder.encode(JSON.stringify(card) + "\n"))
                }
              } catch {}
            }
          }
        }
        if (buffer.trim().startsWith("{")) {
          try {
            const card = JSON.parse(buffer.trim())
            if (card.notion) { cardCount++; controller.enqueue(encoder.encode(JSON.stringify(card) + "\n")) }
          } catch {}
        }

        // Deduct credits and send usage info
        const creditsLeft = Math.max(0, currentCredits - cardCount)
        await prisma.user.update({
          where: { id: userId },
          data: { aiCredits: { decrement: cardCount } },
        })
        controller.enqueue(encoder.encode(JSON.stringify({ _usage: { cardsGenerated: cardCount, creditsLeft } }) + "\n"))
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
