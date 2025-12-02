"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormRegister } from "react-hook-form"
import { Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface FileFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  error?: RHFError
  required?: boolean
  accept?: string
}

export function FileField({
  label,
  name,
  register,
  error,
  required,
  accept,
}: FileFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type="file"
          accept={accept}
          {...register(name)}
          className={error ? "border-destructive" : ""}
        />
        <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
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

