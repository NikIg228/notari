"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormRegister, UseFormSetValue } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"
import { useFormContext } from "react-hook-form"

interface DateFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  error?: RHFError
  required?: boolean
  placeholder?: string
}

function formatDateInput(value: string): string {
  // Удаляем все символы кроме цифр
  const digits = value.replace(/\D/g, "")
  
  // Ограничиваем до 8 цифр (ДДММГГГГ)
  const limitedDigits = digits.slice(0, 8)
  
  // Форматируем: ДД.ММ.ГГГГ
  if (limitedDigits.length <= 2) {
    return limitedDigits
  } else if (limitedDigits.length <= 4) {
    return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2)}`
  } else {
    return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 4)}.${limitedDigits.slice(4)}`
  }
}

export function DateField({
  label,
  name,
  register,
  error,
  required,
  placeholder = "ДД.ММ.ГГГГ",
}: DateFieldProps) {
  const { setValue } = useFormContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value)
    setValue(name, formatted, { shouldValidate: true })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="text"
        placeholder={placeholder}
        {...register(name)}
        onChange={(e) => {
          handleChange(e)
          register(name).onChange(e)
        }}
        className={error ? "border-destructive" : ""}
        maxLength={10}
      />
      {error && (
        <Alert variant="destructive" id={`${name}-error`} className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {formatErrorForUser(error, label)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

