import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/lib/auth"
import { apiError } from "@/lib/api-error"
import { z } from "zod"
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompts/extract-from-document"

const ExtractSchema = z.object({
  deckId: z.string().cuid(),
  text: z.string().min(1).max(50000),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return apiError("Non authentifié", "UNAUTHORIZED", 401)

  const body = await req.json().catch(() => null)
  const parsed = ExtractSchema.safeParse(body)
  if (!parsed.success) {
    const tooLarge = parsed.error.issues.some(i => i.path.includes("text") && i.code === "too_big")
    if (tooLarge) return apiError("Document trop volumineux (max 50 000 caractères)", "DOCUMENT_TOO_LARGE", 400)
    return apiError("Données invalides", "INVALID_INPUT", 400)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return apiError("Clé API manquante", "INTERNAL_ERROR", 500)

  const anthropic = new Anthropic({ apiKey })
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          stream: true,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage(parsed.data.text) }],
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
              } catch { }
            }
          }
        }
        if (buffer.trim().startsWith("{")) {
          try {
            const card = JSON.parse(buffer.trim())
            if (card.notion) controller.enqueue(encoder.encode(JSON.stringify(card) + "\n"))
          } catch { }
        }
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
