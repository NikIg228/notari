export const CATEGORIES = [
  "Авто",
  "Недвижимость",
  "Суд",
  "Дети",
  "Банк",
  "Наследство",
  "Прочее",
] as const

export type Category = (typeof CATEGORIES)[number]

export const DOCUMENT_TYPES = [
  "договор",
  "доверенность",
  "заявление",
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

