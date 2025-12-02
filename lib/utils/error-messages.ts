import { FieldError } from "react-hook-form"

/**
 * Преобразует ошибку валидации в понятное сообщение на русском языке
 */
export function getErrorMessage(error: FieldError | undefined): string | undefined {
  if (!error) return undefined

  const { message, type } = error

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
      if (error.ref?.min !== undefined) {
        return `Минимальное значение: ${error.ref.min}`
      }
      return "Значение слишком мало"
    
    case "too_big":
      if (error.ref?.max !== undefined) {
        return `Максимальное значение: ${error.ref.max}`
      }
      return "Значение слишком велико"
    
    case "invalid_string":
      if (error.ref?.validation === "email") {
        return "Введите корректный email адрес"
      }
      if (error.ref?.validation === "url") {
        return "Введите корректный URL адрес"
      }
      return "Неверный формат данных"
    
    case "invalid_enum_value":
      return "Выберите один из предложенных вариантов"
    
    case "invalid_date":
      return "Введите корректную дату"
    
    default:
      return message as string || "Произошла ошибка при заполнении поля"
  }
}

/**
 * Форматирует сообщение об ошибке для отображения пользователю
 */
export function formatErrorForUser(error: FieldError | undefined, fieldLabel?: string): string {
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

