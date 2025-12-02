import { z } from "zod"
import {
  iinSchema,
  dateSchema,
  phoneSchema,
  passportSchema,
  createNumberRangeSchema,
  createArrayLengthSchema,
  requiredString,
} from "./common.validators"

// Валидация доверителя
export const trustorSchema = z.object({
  fullName: requiredString("ФИО обязательно"),
  iin: iinSchema,
  birthDate: dateSchema,
  address: requiredString("Адрес обязателен"),
  passport: passportSchema,
  phone: phoneSchema.optional(),
})

// Валидация поверенного
export const agentSchema = z.object({
  fullName: requiredString("ФИО обязательно"),
  iin: iinSchema.optional(),
  birthDate: dateSchema.optional(),
  address: requiredString("Адрес обязателен"),
  passport: passportSchema,
  phone: phoneSchema.optional(),
  citizenship: z.string().optional(),
})

// Валидация ребёнка
export const childSchema = z.object({
  fullName: requiredString("ФИО обязательно"),
  iin: iinSchema.optional(),
  birthDate: dateSchema,
  citizenship: z.string().optional(),
  documentType: z.enum(["birth_certificate", "passport"]),
  documentNumber: requiredString("Номер документа обязателен"),
  documentIssuedDate: dateSchema.optional(),
  documentIssuedBy: z.string().optional(),
})

// Валидация транспортного средства
export const vehicleSchema = z.object({
  type: requiredString("Тип ТС обязателен"),
  brand: requiredString("Марка обязательна"),
  model: requiredString("Модель обязательна"),
  registrationNumber: requiredString("Гос. номер обязателен"),
  vin: z.string().optional(),
  year: createNumberRangeSchema(1900, new Date().getFullYear() + 1),
  registrationDocument: passportSchema.optional(),
})

// Валидация недвижимости
export const propertySchema = z.object({
  type: requiredString("Тип недвижимости обязателен"),
  address: requiredString("Адрес обязателен"),
  area: z.number().positive("Площадь должна быть положительным числом"),
  cadastralNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationDate: dateSchema.optional(),
})

// Валидация адреса
export const addressSchema = z.object({
  region: requiredString("Регион обязателен"),
  city: requiredString("Город обязателен"),
  street: requiredString("Улица обязательна"),
  house: requiredString("Дом обязателен"),
  apartment: z.string().optional(),
  postalCode: z.string().optional(),
})

// Валидация суммы
export const amountSchema = z.object({
  value: z.number().positive("Сумма должна быть положительным числом"),
  currency: z.enum(["KZT", "USD", "EUR", "RUB"]).default("KZT"),
})

// Валидация срока (дни)
export const termDaysSchema = createNumberRangeSchema(1, 31)

// Валидация срока (месяцы)
export const termMonthsSchema = createNumberRangeSchema(1, 36)

// Валидация массива детей (1-10)
export const childrenArraySchema = createArrayLengthSchema(1, 10)

// Валидация массива доверителей (1-2)
export const trustorsArraySchema = createArrayLengthSchema(1, 2)

// Валидация массива поверенных (1-2)
export const agentsArraySchema = createArrayLengthSchema(1, 2)

// Валидация массива авто (1-5)
export const vehiclesArraySchema = createArrayLengthSchema(1, 5)

