"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UseFormRegister, UseFormSetValue, Controller, Control } from "react-hook-form"
import { FieldOption } from "@/lib/types/wizard.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface SelectFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  control?: Control<any>
  error?: RHFError
  required?: boolean
  placeholder?: string
  options: FieldOption[]
}

export function SelectField({
  label,
  name,
  register,
  setValue,
  control,
  error,
  required,
  placeholder = "Выберите...",
  options,
}: SelectFieldProps) {
  const errorMessage = formatErrorForUser(error, label)

  // Если есть control, используем Controller для правильной интеграции с react-hook-form
  if (control) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Controller
          name={name}
          control={control}
          rules={{ required: required ? `Поле "${label}" обязательно для заполнения` : false }}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value)
                setValue(name, value, { shouldValidate: true })
              }}
            >
              <SelectTrigger
                id={name}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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

  // Fallback для случая без control
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        onValueChange={(value) => {
          setValue(name, value, { shouldValidate: true })
        }}
      >
        <SelectTrigger
          id={name}
          className={error ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

