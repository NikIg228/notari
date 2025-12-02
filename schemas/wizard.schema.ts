import { z } from "zod"

const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const FieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum([
      "text",
      "number",
      "date",
      "select",
      "radio",
      "checkbox",
      "file",
      "array",
      "iin",
      "phone",
      "address",
    ]),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
    options: z.array(FieldOptionSchema).optional(),
    validation: z.union([z.string(), z.record(z.unknown())]).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    fields: z.array(FieldSchema).optional(),
    conditional: z
      .object({
        field: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      })
      .optional(),
  })
)

const WizardStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FieldSchema),
  conditional: z
    .object({
      field: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
    })
    .optional(),
})

export const WizardSchema = z.object({
  documentId: z.string(),
  steps: z.array(WizardStepSchema),
})

export type WizardSchemaType = z.infer<typeof WizardSchema>

