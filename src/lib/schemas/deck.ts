import { z } from "zod"

export const ACCENT_COLORS = [
  "#ef4444", "#f43f5e", "#ec4899", "#db2777",
  "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#0d9488", "#06b6d4", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#7c3aed",
  "#C68A3A", "#78716c", "#334155", "#1a1814",
]

export const CreateDeckSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
})

export const UpdateDeckSchema = CreateDeckSchema.partial()

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
