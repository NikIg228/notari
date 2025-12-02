"use client"

import { CheckboxGroup } from "./CheckboxGroup"
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldError } from "react-hook-form"
import { COUNTRIES } from "@/lib/constants/countries"

interface CountrySelectProps {
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  error?: FieldError
  required?: boolean
}

export function CountrySelect({
  name,
  register,
  watch,
  setValue,
  error,
  required,
}: CountrySelectProps) {
  const options = COUNTRIES.map((country) => ({
    label: country,
    value: country,
  }))

  const selectedCountries = watch(name) || []
  const worldSelected = (selectedCountries as string[]).includes("Весь мир")

  // Если выбран "Весь мир", автоматически выбираем все страны
  if (worldSelected && (selectedCountries as string[]).length < COUNTRIES.length) {
    setValue(name, COUNTRIES)
  }

  return (
    <CheckboxGroup
      label="Выбор стран поездки"
      name={name}
      register={register}
      watch={watch}
      setValue={setValue}
      error={error}
      required={required}
      options={options}
      selectAll={true}
    />
  )
}

