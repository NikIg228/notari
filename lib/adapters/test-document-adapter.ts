import { WizardSchema, WizardStep, Field, FieldOption } from "@/lib/types/wizard.types"
import { COUNTRIES } from "@/lib/constants/countries"
import { REGIONS } from "@/lib/constants/regions"

interface TestDocumentStep {
  id: string
  type: string
  label?: string
  title?: string
  options?: Array<{ value: number | string; label: string }>
  fields?: Array<{
    name: string
    type: string
    label: string
    min?: number
    max?: number
    required?: boolean
  }>
  min?: number
  max?: number
  item_label?: string
  modes?: Array<{ value: string; label: string }>
  countries?: string
  cities_list?: string
  next?: string | Record<string, string>
}

interface TestDocument {
  id: number
  code: string
  title: string
  category: string
  parsed: {
    steps: TestDocumentStep[]
    placeholders: string[]
  }
}

/**
 * Преобразует поле из test-document формата в Field формат
 */
function convertField(field: NonNullable<TestDocumentStep["fields"]>[0], stepId: string): Field {
  const baseField: Field = {
    name: field.name,
    label: field.label,
    type: mapFieldType(field.type),
    required: field.required !== false && !field.label.includes("опц."),
  }

  // Добавляем специфичные свойства в зависимости от типа
  if (field.min !== undefined) baseField.min = field.min
  if (field.max !== undefined) baseField.max = field.max

  return baseField
}

/**
 * Маппинг типов полей из test-document в FieldType
 */
function mapFieldType(type: string): Field["type"] {
  const typeMap: Record<string, Field["type"]> = {
    text: "text",
    number: "number",
    date: "date",
    file: "file",
    radio: "radio",
    checkbox: "checkbox",
    "select-multimode": "select",
    "checkbox-group": "checkbox",
    "radio-group": "radio",
  }
  return typeMap[type] || "text"
}

/**
 * Создает опции для radio/select из modes или options
 */
function createOptions(step: TestDocumentStep): FieldOption[] {
  if (step.modes) {
    return step.modes.map((mode) => ({
      value: String(mode.value),
      label: mode.label,
    }))
  }
  if (step.options) {
    return step.options.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
    }))
  }
  return []
}

/**
 * Создает опции для стран или регионов
 */
function createLocationOptions(step: TestDocumentStep): FieldOption[] {
  if (step.countries === "COUNTRY_LIST_35" || step.countries) {
    return COUNTRIES.map((country) => ({
      value: country,
      label: country,
    }))
  }
  if (step.cities_list === "ALL_CITIES_RK" || step.cities_list) {
    return REGIONS.map((region) => ({
      value: region,
      label: region,
    }))
  }
  return []
}

/**
 * Преобразует шаг из test-document формата в WizardStep
 */
function convertStep(step: TestDocumentStep, allSteps: TestDocumentStep[]): WizardStep {
  const wizardStep: WizardStep = {
    id: step.id,
    title: step.title || step.label || step.id,
    fields: [],
  }

  // Обработка разных типов шагов
  switch (step.type) {
    case "radio":
    case "radio-group": {
      const options = createOptions(step)
      wizardStep.fields.push({
        name: step.id,
        label: step.label || "",
        type: "radio",
        required: true,
        options,
      })
      break
    }

    case "checkbox-group": {
      const options = createOptions(step)
      wizardStep.fields.push({
        name: step.id,
        label: step.label || "",
        type: "checkbox",
        required: true,
        options,
      })
      break
    }

    case "select-multimode": {
      // Создаем поле для выбора режима
      const modeOptions = step.modes?.map((m) => ({
        value: String(m.value),
        label: m.label,
      })) || []
      
      wizardStep.fields.push({
        name: `${step.id}_mode`,
        label: step.label || "",
        type: "radio",
        required: true,
        options: modeOptions,
      })

      // Создаем поле для выбора стран/регионов (условное)
      const locationOptions = createLocationOptions(step)
      if (locationOptions.length > 0) {
        wizardStep.fields.push({
          name: `${step.id}_list`,
          label: step.modes?.find((m) => m.value === "countries" || m.value === "cities")?.label || "Выберите",
          type: "checkbox",
          required: false,
          options: locationOptions,
          conditional: {
            field: `${step.id}_mode`,
            value: step.modes?.find((m) => m.value === "countries" || m.value === "cities")?.value ? 
              [String(step.modes.find((m) => m.value === "countries" || m.value === "cities")?.value)] : [],
          },
        })
      }
      break
    }

    case "form": {
      if (step.fields && step.fields.length > 0) {
        wizardStep.fields = step.fields.map((field) => convertField(field, step.id))
      }
      break
    }

    case "array": {
      if (step.fields && step.fields.length > 0) {
        wizardStep.fields.push({
          name: step.id,
          label: step.item_label || step.title || step.label || "",
          type: "array",
          required: true,
          min: step.min,
          max: step.max,
          fields: step.fields.map((field) => convertField(field, step.id)),
        })
      }
      break
    }

    case "validation":
    case "final": {
      // Эти шаги не требуют полей
      break
    }
  }

  // Добавляем условную логику на основе поля next
  if (step.next && typeof step.next === "object") {
    // Если next - объект, значит есть условные переходы
    // Это будет обрабатываться в WizardEngine
  }

  return wizardStep
}

/**
 * Преобразует test-document в WizardSchema
 */
export function convertTestDocumentToWizardSchema(document: TestDocument): WizardSchema {
  const steps: WizardStep[] = []
  const stepMap = new Map<string, number>() // Маппинг step.id -> index

  // Первый проход: создаем все шаги
  document.parsed.steps.forEach((step, index) => {
    if (step.type !== "validation" && step.type !== "final") {
      const wizardStep = convertStep(step, document.parsed.steps)
      stepMap.set(step.id, steps.length)
      steps.push(wizardStep)
    }
  })

  // Второй проход: добавляем условную логику
  document.parsed.steps.forEach((step, originalIndex) => {
    if (step.next && typeof step.next === "object") {
      const stepIndex = stepMap.get(step.id)
      if (stepIndex !== undefined) {
        // Находим поле radio/select в этом шаге
        const radioField = steps[stepIndex].fields.find((f) => f.type === "radio")
        if (radioField) {
          // Добавляем условную логику для следующих шагов
          // Это будет обрабатываться динамически в WizardEngine
        }
      }
    }
  })

  return {
    documentId: String(document.id),
    steps,
  }
}

/**
 * Получает следующий шаг на основе текущего шага и значения поля
 */
export function getNextStepId(
  currentStep: TestDocumentStep,
  fieldValue: string | number
): string | null {
  if (!currentStep.next) return null

  if (typeof currentStep.next === "string") {
    return currentStep.next
  }

  if (typeof currentStep.next === "object") {
    const valueStr = String(fieldValue)
    return currentStep.next[valueStr] || null
  }

  return null
}

/**
 * Находит индекс шага по ID
 */
export function findStepIndexById(steps: TestDocumentStep[], stepId: string): number {
  return steps.findIndex((s) => s.id === stepId)
}

