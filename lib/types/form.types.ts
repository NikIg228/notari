import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form"

/**
 * Тип ошибки из react-hook-form, который может быть:
 * - FieldError (простая ошибка)
 * - Merge<FieldError, FieldErrorsImpl<any>> (вложенная/объединенная ошибка)
 * - undefined (нет ошибки)
 */
export type RHFError = FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined

