import { z } from "zod"

// Валидация ИИН (12 цифр)
export const iinSchema = z
  .string()
  .length(12, "ИИН должен содержать 12 цифр")
  .regex(/^\d+$/, "ИИН должен содержать только цифры")

// Валидация БИН (12 цифр)
export const binSchema = z
  .string()
  .length(12, "БИН должен содержать 12 цифр")
  .regex(/^\d+$/, "БИН должен содержать только цифры")

// Валидация даты (формат ДД.ММ.ГГГГ)
export const dateSchema = z
  .string()
  .regex(
    /^(\d{2})\.(\d{2})\.(\d{4})$/,
    "Дата должна быть в формате ДД.ММ.ГГГГ"
  )
  .refine(
    (date) => {
      const [day, month, year] = date.split(".").map(Number)
      const d = new Date(year, month - 1, day)
      return (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
      )
    },
    {
      message: "Некорректная дата",
    }
  )

// Валидация телефона (казахстанский формат)
export const phoneSchema = z
  .string()
  .regex(
    /^(\+7|8)?[\s-]?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/,
    "Некорректный формат телефона"
  )

// Валидация паспортных данных
export const passportSchema = z.object({
  type: z.string().min(1, "Тип документа обязателен"),
  series: z.string().optional(),
  number: z.string().min(1, "Номер документа обязателен"),
  issuedBy: z.string().min(1, "Орган выдачи обязателен"),
  issuedDate: dateSchema,
})

// Валидация диапазона чисел
export function createNumberRangeSchema(min: number, max: number) {
  return z
    .number()
    .min(min, `Значение должно быть не менее ${min}`)
    .max(max, `Значение должно быть не более ${max}`)
}

// Валидация диапазона строк (для количества элементов в массиве)
export function createArrayLengthSchema(min: number, max: number) {
  return z
    .array(z.unknown())
    .min(min, `Минимум ${min} элемент(ов)`)
    .max(max, `Максимум ${max} элементов`)
}

// Валидация обязательного поля
export function requiredString(message = "Поле обязательно для заполнения") {
  return z.string().min(1, message)
}

// Валидация опционального поля
export function optionalString() {
  return z.string().optional()
}

