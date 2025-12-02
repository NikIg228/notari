"use client"

import { useFormContext } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { WizardStep } from "@/lib/types/wizard.types"

interface WizardValidationErrorsProps {
  step: WizardStep
}

export function WizardValidationErrors({ step }: WizardValidationErrorsProps) {
  const { watch, formState: { errors } } = useFormContext()

  // Получаем все видимые поля текущего шага
  const visibleFields = step.fields.filter((f) => {
    if (f.conditional) {
      const conditionalValue = watch(f.conditional.field) as string
      const expectedValues = Array.isArray(f.conditional.value)
        ? f.conditional.value
        : [f.conditional.value]
      return expectedValues.includes(conditionalValue)
    }
    return true
  })

  // Собираем все ошибки для видимых полей
  const stepErrors = visibleFields
    .map((field) => {
      const error = errors[field.name]
      if (error) {
        return {
          fieldName: field.name,
          fieldLabel: field.label,
          error: error,
        }
      }
      return null
    })
    .filter((e) => e !== null)

  if (stepErrors.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибки заполнения</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {stepErrors.map((error) => {
            const errorMessage = error?.error?.message || 
              (typeof error?.error === "string" ? error.error : "Поле обязательно для заполнения")
            return (
              <li key={error?.fieldName}>
                <strong>{error?.fieldLabel}:</strong> {errorMessage}
              </li>
            )
          })}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

