"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UseFormRegister, FieldError, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FieldOption } from "@/lib/types/wizard.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"

interface CheckboxGroupProps {
  label: string
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  error?: FieldError
  required?: boolean
  options: FieldOption[]
  selectAll?: boolean
}

export function CheckboxGroup({
  label,
  name,
  register,
  watch,
  setValue,
  error,
  required,
  options,
  selectAll = false,
}: CheckboxGroupProps) {
  const selectedValues = watch(name) || []

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const current = selectedValues as string[]
    if (checked) {
      setValue(name, [...current, value])
    } else {
      setValue(name, current.filter((v) => v !== value))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setValue(name, options.map((opt) => opt.value))
    } else {
      setValue(name, [])
    }
  }

  const allSelected = selectedValues.length === options.length

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {selectAll && (
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id={`${name}-all`}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor={`${name}-all`} className="font-normal cursor-pointer">
            Выбрать всё
          </Label>
        </div>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = (selectedValues as string[]).includes(option.value)
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${name}-${option.value}`}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(option.value, checked === true)
                }
                {...register(name)}
              />
              <Label
                htmlFor={`${name}-${option.value}`}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          )
        })}
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

