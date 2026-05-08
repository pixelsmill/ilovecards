import { z } from "zod"

export const TEMPLATES = ['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature'] as const
export type TemplateType = typeof TEMPLATES[number]

export const CreateCardSchema = z.object({
  deckId: z.string().cuid(),
  notion: z.string().min(1, "La notion est requise").max(500),
  developpement: z.string().max(2000).optional(),
  source: z.string().max(200).optional(),
  template: z.enum(['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature']).default('minimaliste'),
  imageUrl: z.string().url().optional(),
})

export const UpdateCardSchema = z.object({
  notion: z.string().min(1).max(500).optional(),
  developpement: z.string().max(2000).optional(),
  source: z.string().max(200).optional(),
  template: z.enum(['poster', 'quote', 'magazine', 'color-block', 'photo-overlay', 'minimaliste', 'equation', 'sature']).optional(),
  imageUrl: z.string().url().optional(),
})

export type CreateCardInput = z.infer<typeof CreateCardSchema>
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>
