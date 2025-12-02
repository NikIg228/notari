import { RHFError } from "@/lib/types/form.types"

/**
 * Преобразует ошибку валидации в понятное сообщение на русском языке
 */
export function getErrorMessage(error: RHFError): string | undefined {
  if (!error) return undefined

  // Проверяем, является ли ошибка объектом с полями message и type
  if (typeof error !== "object" || !("message" in error) || !("type" in error)) {
    return undefined
  }

  const { message, type, ref } = error as { message?: unknown; type?: string; ref?: unknown }

  // Если уже есть понятное сообщение на русском
  if (typeof message === "string" && message.length > 0) {
    return message
  }

  // Преобразуем типы ошибок в понятные сообщения
  switch (type) {
    case "required":
      return "Это поле обязательно для заполнения"
    
    case "invalid_type_error":
      if (message) return message as string
      return "Неверный тип данных"
    
    case "too_small":
      if (ref && typeof ref === "object" && "min" in ref) {
        return `Минимальное значение: ${(ref as { min: number }).min}`
      }
      return "Значение слишком мало"
    
    case "too_big":
      if (ref && typeof ref === "object" && "max" in ref) {
        return `Максимальное значение: ${(ref as { max: number }).max}`
      }
      return "Значение слишком велико"
    
    case "invalid_string":
      if (ref && typeof ref === "object" && "validation" in ref) {
        const validation = (ref as { validation?: string }).validation
        if (validation === "email") {
          return "Введите корректный email адрес"
        }
        if (validation === "url") {
          return "Введите корректный URL адрес"
        }
      }
      return "Неверный формат данных"
    
    case "invalid_enum_value":
      return "Выберите один из предложенных вариантов"
    
    case "invalid_date":
      return "Введите корректную дату"
    
    default:
      return (typeof message === "string" ? message : undefined) || "Произошла ошибка при заполнении поля"
  }
}

/**
 * Форматирует сообщение об ошибке для отображения пользователю
 */
export function formatErrorForUser(error: RHFError, fieldLabel?: string): string {
  const message = getErrorMessage(error)
  
  if (!message) return ""
  
  // Если сообщение уже содержит название поля, возвращаем как есть
  if (fieldLabel && message.includes(fieldLabel)) {
    return message
  }
  
  // Иначе добавляем название поля в начало
  if (fieldLabel) {
    return `${fieldLabel}: ${message}`
  }
  
  return message
}

