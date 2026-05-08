import { z } from "zod"

export const ACCENT_COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#8b5cf6", "#ef4444",
]

export const CreateDeckSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
})

export const UpdateDeckSchema = CreateDeckSchema.partial()

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>
