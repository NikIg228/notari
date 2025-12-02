export const DOCUMENT_TYPE_CATEGORIES = [
  "доверенность",
  "договор",
  "согласие",
  "заявление",
  "наследственное дело",
] as const

export type DocumentTypeCategory = (typeof DOCUMENT_TYPE_CATEGORIES)[number]

/**
 * Маппинг типов документов на категории
 */
export function getDocumentTypeCategory(type: string, title: string): DocumentTypeCategory {
  const titleLower = title.toLowerCase()
  
  // Наследственное дело - по названию (приоритет)
  if (titleLower.includes("наследств")) {
    return "наследственное дело"
  }

  // Согласие - по названию (приоритет над типом)
  if (titleLower.includes("согласие")) {
    return "согласие"
  }

  // Доверенность - по названию (приоритет над типом)
  if (titleLower.startsWith("доверенность")) {
    return "доверенность"
  }

  // Остальные по типу
  if (type === "доверенность") {
    return "доверенность"
  }
  if (type === "договор") {
    return "договор"
  }
  if (type === "заявление") {
    return "заявление"
  }

  // По умолчанию
  return "доверенность"
}

