import { z } from "zod"
import { Field } from "@/lib/types/wizard.types"
import {
  iinSchema,
  dateSchema,
  phoneSchema,
  createNumberRangeSchema,
  createArrayLengthSchema,
  requiredString,
} from "@/lib/validators/common.validators"

// Создание Zod схемы из конфигурации поля
export function createFieldSchema(field: Field, isConditional = false): z.ZodTypeAny {
  let schema: z.ZodTypeAny

  // Если поле условное, делаем его опциональным
  const isRequired = field.required && !isConditional

  switch (field.type) {
    case "text":
      if (isRequired) {
        schema = z
          .string({
            required_error: `Поле "${field.label}" обязательно для заполнения`,
          })
          .min(1, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .refine((val) => val && val.trim().length > 0, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
      } else {
        schema = z.string().optional().or(z.literal(""))
      }
      break

    case "iin":
      if (isRequired) {
        schema = z
          .string({
            required_error: `Поле "${field.label}" обязательно для заполнения`,
          })
          .min(1, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .refine((val) => val && val.trim().length > 0, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .pipe(iinSchema)
      } else {
        schema = iinSchema.optional().or(z.literal(""))
      }
      break

    case "phone":
      if (isRequired) {
        schema = z
          .string({
            required_error: `Поле "${field.label}" обязательно для заполнения`,
          })
          .min(1, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .refine((val) => val && val.trim().length > 0, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .pipe(phoneSchema)
      } else {
        schema = phoneSchema.optional().or(z.literal(""))
      }
      break

    case "number":
      if (field.min !== undefined || field.max !== undefined) {
        const min = field.min ?? 0
        const max = field.max ?? Infinity
        schema = createNumberRangeSchema(min, max)
      } else {
        schema = z.number({ 
          invalid_type_error: `Поле "${field.label}" должно быть числом`,
          required_error: `Поле "${field.label}" обязательно для заполнения`,
        })
      }
      if (!isRequired) {
        schema = schema.optional().nullable()
      }
      break

    case "date":
      if (isRequired) {
        schema = z
          .string({
            required_error: `Поле "${field.label}" обязательно для заполнения`,
          })
          .min(1, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .refine((val) => val && val.trim().length > 0, {
            message: `Поле "${field.label}" обязательно для заполнения`,
          })
          .pipe(dateSchema)
      } else {
        schema = dateSchema.optional().or(z.literal(""))
      }
      break

    case "select":
    case "radio":
      if (field.options && field.options.length > 0) {
        const values = field.options.map((opt) => opt.value)
        const enumSchema = z.enum(values as [string, ...string[]], {
          errorMap: (issue) => {
            if (issue.code === "invalid_enum_value") {
              return {
                message: `Пожалуйста, выберите один из предложенных вариантов для поля "${field.label}"`,
              }
            }
            if (issue.code === "invalid_type") {
              return {
                message: isRequired 
                  ? `Поле "${field.label}" обязательно для заполнения. Пожалуйста, выберите один из вариантов.`
                  : `Пожалуйста, выберите один из предложенных вариантов для поля "${field.label}"`,
              }
            }
            return {
              message: `Пожалуйста, выберите один из предложенных вариантов для поля "${field.label}"`,
            }
          },
        })
        
        if (isRequired) {
          // Для обязательных полей не допускаем null/undefined/пустую строку
          schema = z
            .string({
              required_error: `Поле "${field.label}" обязательно для заполнения`,
              invalid_type_error: `Поле "${field.label}" обязательно для заполнения`,
            })
            .min(1, {
              message: `Поле "${field.label}" обязательно для заполнения. Пожалуйста, выберите один из вариантов.`,
            })
            .refine((val) => val !== null && val !== undefined && val !== "", {
              message: `Поле "${field.label}" обязательно для заполнения. Пожалуйста, выберите один из вариантов.`,
            })
            .refine((val) => values.includes(val), {
              message: `Пожалуйста, выберите один из предложенных вариантов для поля "${field.label}"`,
            })
        } else {
          // Для необязательных полей разрешаем null/undefined/пустую строку или валидное значение
          schema = z.union([
            enumSchema,
            z.literal(""),
            z.null(),
            z.undefined(),
          ])
        }
      } else {
        schema = z.string({
          required_error: `Поле "${field.label}" обязательно для заполнения`,
        })
        if (!isRequired) {
          schema = schema.optional().nullable()
        }
      }
      break

    case "checkbox":
      schema = z.boolean({
        required_error: `Поле "${field.label}" обязательно для заполнения`,
      })
      if (!isRequired) {
        schema = schema.optional().nullable()
      }
      break

    case "array":
      if (field.fields && field.fields.length > 0) {
        const itemSchema = z.object(
          field.fields.reduce((acc, f) => {
            acc[f.name] = createFieldSchema(f, true) // Вложенные поля всегда условные
            return acc
          }, {} as Record<string, z.ZodTypeAny>)
        )
        let arraySchema: z.ZodArray<any> = z.array(itemSchema, {
          required_error: `Необходимо добавить хотя бы один элемент в "${field.label}"`,
        })
        if (field.min !== undefined || field.max !== undefined) {
          const min = field.min ?? 0
          const max = field.max ?? Infinity
          const lengthSchema = createArrayLengthSchema(min, max)
          arraySchema = lengthSchema as z.ZodArray<any>
        }
        schema = isRequired ? arraySchema : arraySchema.optional().nullable()
      } else {
        schema = z.array(z.unknown())
      }
      break

    case "file":
      schema = isRequired
        ? z.instanceof(File, { message: `Необходимо загрузить файл для поля "${field.label}"` })
        : z.instanceof(File).optional().nullable()
      break

    default:
      schema = z.string().optional()
  }

  return schema
}

// Создание полной Zod схемы из конфигурации шага
export function createStepSchema(fields: Field[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    const isConditional = !!field.conditional
    shape[field.name] = createFieldSchema(field, isConditional)
  }

  return z.object(shape)
}

// Создание полной Zod схемы из всех шагов wizard
export function createWizardSchema(steps: Array<{ fields: Field[]; conditional?: { field: string; value: string | string[] } }>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const step of steps) {
    const stepIsConditional = !!step.conditional
    for (const field of step.fields) {
      const fieldIsConditional = stepIsConditional || !!field.conditional
      shape[field.name] = createFieldSchema(field, fieldIsConditional)
    }
  }

  return z.object(shape).passthrough() // passthrough позволяет пропускать неизвестные поля
}

