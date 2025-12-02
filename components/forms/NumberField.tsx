"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormRegister, FieldError, UseFormSetValue } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"

interface NumberFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  error?: FieldError
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
}

export function NumberField({
  label,
  name,
  register,
  setValue,
  error,
  required,
  placeholder,
  min,
  max,
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        {...register(name, {
          valueAsNumber: true,
          onChange: (e) => {
            const value = e.target.value
            if (value === "") {
              setValue(name, undefined)
            } else {
              const numValue = Number(value)
              if (!isNaN(numValue)) {
                setValue(name, numValue)
              }
            }
          },
        })}
        className={error ? "border-destructive" : ""}
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

