"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UseFormRegister, FieldError, UseFormSetValue } from "react-hook-form"
import { FieldOption } from "@/lib/types/wizard.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"

interface SelectFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  error?: FieldError
  required?: boolean
  placeholder?: string
  options: FieldOption[]
}

export function SelectField({
  label,
  name,
  register,
  setValue,
  error,
  required,
  placeholder = "Выберите...",
  options,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        onValueChange={(value) => setValue(name, value)}
        {...register(name)}
      >
        <SelectTrigger
          id={name}
          className={error ? "border-destructive" : ""}
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
            {formatErrorForUser(error, label)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

