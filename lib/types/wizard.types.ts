export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "array"
  | "iin"
  | "phone"
  | "address"

export interface FieldOption {
  label: string
  value: string
}

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  validation?: string | Record<string, unknown>
  min?: number
  max?: number
  fields?: Field[] // для array типа
  conditional?: {
    field: string
    value: string | string[]
  }
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  fields: Field[]
  conditional?: {
    field: string
    value: string | string[]
  }
}

export interface WizardSchema {
  documentId: string
  steps: WizardStep[]
}

export interface WizardFormData {
  [key: string]: unknown
}

