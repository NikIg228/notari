"use client"

import { FieldErrors } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { Field } from "@/lib/types/wizard.types"

interface WizardErrorsProps {
  errors: FieldErrors
  fields: Field[]
}

export function WizardErrors({ errors, fields }: WizardErrorsProps) {
  const errorEntries = Object.entries(errors)

  if (errorEntries.length === 0) {
    return null
  }

  // Находим названия полей для отображения
  const getFieldLabel = (fieldName: string): string => {
    const field = fields.find((f) => f.name === fieldName)
    return field?.label || fieldName
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибки заполнения формы</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1">
          {errorEntries.map(([fieldName, error]) => {
            const label = getFieldLabel(fieldName)
            const message = formatErrorForUser(error as any, label)
            return (
              <li key={fieldName} className="text-sm">
                {message}
              </li>
            )
          })}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

