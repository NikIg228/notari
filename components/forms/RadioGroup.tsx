"use client"

import { RadioGroup as UIRadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UseFormRegister, UseFormSetValue } from "react-hook-form"
import { FieldOption } from "@/lib/types/wizard.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface RadioGroupProps {
  label: string
  name: string
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  error?: RHFError
  required?: boolean
  options: FieldOption[]
}

export function RadioGroup({
  label,
  name,
  register,
  setValue,
  error,
  required,
  options,
}: RadioGroupProps) {
  const errorMessage = formatErrorForUser(error, label)

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <UIRadioGroup
        onValueChange={(value) => {
          setValue(name, value, { shouldValidate: true, shouldDirty: true })
        }}
        {...register(name, {
          required: required ? `Пожалуйста, выберите один из вариантов для поля "${label}"` : false,
          validate: (value) => {
            if (required && (!value || value === null || value === undefined || value === "")) {
              return `Пожалуйста, выберите один из вариантов для поля "${label}"`
            }
            return true
          },
        })}
        className={error ? "border-destructive" : ""}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label
              htmlFor={`${name}-${option.value}`}
              className="font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </UIRadioGroup>
      {error && (
        <Alert variant="destructive" id={`${name}-error`} className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

