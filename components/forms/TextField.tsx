"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormRegister } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface TextFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  error?: RHFError
  required?: boolean
  placeholder?: string
  type?: "text" | "email" | "password"
}

export function TextField({
  label,
  name,
  register,
  error,
  required,
  placeholder,
  type = "text",
}: TextFieldProps) {
  const errorMessage = formatErrorForUser(error, label)

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
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

