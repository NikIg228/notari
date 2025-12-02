"use client"

import { useFieldArray, UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/lib/types/wizard.types"
import { Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { FieldRenderer } from "./FieldRenderer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatErrorForUser } from "@/lib/utils/error-messages"

interface ArrayFieldProps {
  label: string
  name: string
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  errors?: FieldErrors
  field: Field
  min?: number
  max?: number
}

export function ArrayField({
  label,
  name,
  register,
  watch,
  setValue,
  errors,
  field,
  min = 0,
  max,
}: ArrayFieldProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    name,
    control,
  })

  const values = watch(name) || []
  const fieldErrors = errors?.[name] as FieldErrors | undefined

  const handleAdd = () => {
    if (max && values.length >= max) return
    
    const newItem: Record<string, unknown> = {}
    if (field.fields) {
      field.fields.forEach((f) => {
        newItem[f.name] = f.type === "checkbox" ? false : ""
      })
    }
    append(newItem)
  }

  const handleRemove = (index: number) => {
    if (values.length <= min) return
    remove(index)
  }

  const canAdd = !max || values.length < max
  const canRemove = values.length > min

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
        {canAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      {fieldErrors && typeof fieldErrors === "object" && "message" in fieldErrors && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {formatErrorForUser(fieldErrors as any, label)}
          </AlertDescription>
        </Alert>
      )}

      <AnimatePresence>
        {values.map((_: unknown, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {label} {index + 1}
                  </CardTitle>
                  {canRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {field.fields?.map((subField) => (
                  <FieldRenderer
                    key={subField.name}
                    field={subField}
                    name={`${name}.${index}.${subField.name}`}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    error={fieldErrors?.[index]?.[subField.name]}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {values.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <p>Нет элементов</p>
          {canAdd && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
              className="mt-4"
            >
              Добавить первый элемент
            </Button>
          )}
        </div>
      )}

      {min > 0 && values.length < min && (
        <p className="text-sm text-destructive">
          Минимум {min} элемент(ов) требуется
        </p>
      )}
      {max && values.length >= max && (
        <p className="text-sm text-muted-foreground">
          Максимум {max} элементов
        </p>
      )}
    </div>
  )
}

