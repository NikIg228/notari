"use client"

import { CheckboxGroup } from "./CheckboxGroup"
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { REGIONS } from "@/lib/constants/regions"
import { RHFError } from "@/lib/types/form.types"

interface RegionSelectProps {
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  error?: RHFError
  required?: boolean
}

export function RegionSelect({
  name,
  register,
  watch,
  setValue,
  error,
  required,
}: RegionSelectProps) {
  const options = REGIONS.map((region) => ({
    label: region,
    value: region,
  }))

  const selectedRegions = watch(name) || []
  const allKZSelected = (selectedRegions as string[]).includes("Вся Республика Казахстан")

  // Если выбрана "Вся РК", автоматически выбираем все регионы
  if (allKZSelected && (selectedRegions as string[]).length < REGIONS.length) {
    setValue(name, REGIONS)
  }

  return (
    <CheckboxGroup
      label="Маршрут внутри РК"
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

