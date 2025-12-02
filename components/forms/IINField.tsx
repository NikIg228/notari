"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormRegister } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface IINFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  error?: RHFError
  required?: boolean
  placeholder?: string
}

export function IINField({
  label,
  name,
  register,
  error,
  required,
  placeholder = "000000000000",
}: IINFieldProps) {
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
        maxLength={12}
        {...register(name, {
          onChange: (e) => {
            e.target.value = e.target.value.replace(/\D/g, "")
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

