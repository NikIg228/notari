"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FieldOption } from "@/lib/types/wizard.types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"
import { RHFError } from "@/lib/types/form.types"

interface CheckboxGroupProps {
  label: string
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  error?: RHFError
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
    if (value === "all") {
      // Если выбрали "all", выбираем все остальные опции
      if (checked) {
        const optionsWithoutAll = options.filter((opt) => opt.value !== "all")
        setValue(name, optionsWithoutAll.map((opt) => opt.value))
      } else {
        // Если сняли "all", снимаем все
        setValue(name, [])
      }
    } else {
      // Обычная логика для других опций
      if (checked) {
        setValue(name, [...current, value])
      } else {
        setValue(name, current.filter((v) => v !== value))
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Если есть опция "all", выбираем все кроме неё, иначе выбираем все
      const optionsToSelect = options.filter((opt) => opt.value !== "all")
      setValue(name, optionsToSelect.map((opt) => opt.value))
    } else {
      setValue(name, [])
    }
  }

  // Проверяем, выбраны ли все опции (кроме "all")
  const optionsWithoutAll = options.filter((opt) => opt.value !== "all")
  const allSelected = optionsWithoutAll.length > 0 && 
    optionsWithoutAll.every((opt) => (selectedValues as string[]).includes(opt.value))

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
      {options.some((opt) => opt.value === "all") && (
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id={`${name}-all-option`}
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor={`${name}-all-option`} className="font-normal cursor-pointer">
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

