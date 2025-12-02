"use client"

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldError } from "react-hook-form"
import { Field } from "@/lib/types/wizard.types"
import { TextField } from "./TextField"
import { NumberField } from "./NumberField"
import { DateField } from "./DateField"
import { SelectField } from "./SelectField"
import { RadioGroup } from "./RadioGroup"
import { CheckboxGroup } from "./CheckboxGroup"
import { IINField } from "./IINField"
import { FileField } from "./FileField"
import { ArrayField } from "./ArrayField"
import { CountrySelect } from "./CountrySelect"
import { RegionSelect } from "./RegionSelect"

interface FieldRendererProps {
  field: Field
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  error?: FieldError
}

export function FieldRenderer({
  field,
  name,
  register,
  watch,
  setValue,
  error,
}: FieldRendererProps) {
  // Проверка условного отображения
  if (field.conditional) {
    const conditionalValue = watch(field.conditional.field)
    const expectedValues = Array.isArray(field.conditional.value)
      ? field.conditional.value
      : [field.conditional.value]
    
    if (!expectedValues.includes(conditionalValue)) {
      return null
    }
  }

  switch (field.type) {
    case "text":
      return (
        <TextField
          label={field.label}
          name={name}
          register={register}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
        />
      )

    case "number":
      return (
        <NumberField
          label={field.label}
          name={name}
          register={register}
          setValue={setValue}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
        />
      )

    case "date":
      return (
        <DateField
          label={field.label}
          name={name}
          register={register}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
        />
      )

    case "select":
      return (
        <SelectField
          label={field.label}
          name={name}
          register={register}
          setValue={setValue}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          options={field.options || []}
        />
      )

    case "radio":
      return (
        <RadioGroup
          label={field.label}
          name={name}
          register={register}
          setValue={setValue}
          error={error}
          required={field.required}
          options={field.options || []}
        />
      )

    case "checkbox":
      // Для группы чекбоксов используем CheckboxGroup
      if (field.options && field.options.length > 0) {
        return (
          <CheckboxGroup
            label={field.label}
            name={name}
            register={register}
            watch={watch}
            setValue={setValue}
            error={error}
            required={field.required}
            options={field.options}
            selectAll={field.label.toLowerCase().includes("страны") || field.label.toLowerCase().includes("регион")}
          />
        )
      }
      // Простой чекбокс без опций
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register(name)}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )

    case "iin":
      return (
        <IINField
          label={field.label}
          name={name}
          register={register}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
        />
      )

    case "file":
      return (
        <FileField
          label={field.label}
          name={name}
          register={register}
          error={error}
          required={field.required}
        />
      )

    case "array":
      return (
        <ArrayField
          label={field.label}
          name={name}
          register={register}
          watch={watch}
          setValue={setValue}
          errors={error as any}
          field={field}
          min={field.min}
          max={field.max}
        />
      )

    default:
      return (
        <TextField
          label={field.label}
          name={name}
          register={register}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
        />
      )
  }
}

