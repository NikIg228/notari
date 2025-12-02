import { z } from "zod"

export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "Авто",
    "Недвижимость",
    "Суд",
    "Дети",
    "Банк",
    "Наследство",
    "Прочее",
  ]),
  type: z.enum(["договор", "доверенность", "заявление"]),
  description: z.string().optional(),
  flowchart: z.string().optional(),
  schemaReady: z.boolean().default(false),
})

export type Document = z.infer<typeof DocumentSchema>

export const DocumentsListSchema = z.object({
  documents: z.array(DocumentSchema),
})

export type DocumentsList = z.infer<typeof DocumentsListSchema>

