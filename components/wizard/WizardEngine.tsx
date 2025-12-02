"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { WizardSchema } from "@/lib/types/wizard.types"
import { createWizardSchema } from "@/lib/utils/validation"
import { WizardStep } from "./WizardStep"
import { WizardNavigation } from "./WizardNavigation"
import { WizardProgress } from "./WizardProgress"
import { motion, AnimatePresence } from "framer-motion"
import { useWizardState } from "@/lib/hooks/useWizardState"

interface WizardEngineProps {
  schema: WizardSchema
  initialData?: Record<string, unknown>
  onComplete?: (data: Record<string, unknown>) => void
}

export function WizardEngine({
  schema,
  initialData,
  onComplete,
}: WizardEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const validationSchema = createWizardSchema(schema.steps)
  const { saveState } = useWizardState(schema.documentId)

  // Подготавливаем значения по умолчанию
  const prepareDefaultValues = (): Record<string, unknown> => {
    const defaults: Record<string, unknown> = initialData ? { ...initialData } : {}
    
    // Для всех radio и checkbox полей устанавливаем значения по умолчанию, если они не заданы
    schema.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (!(field.name in defaults)) {
          if (field.type === "radio") {
            defaults[field.name] = ""
          } else if (field.type === "checkbox") {
            defaults[field.name] = []
          } else if (field.type === "array") {
            defaults[field.name] = []
          }
        }
      })
    })
    
    return defaults
  }

  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: prepareDefaultValues(),
    mode: "onChange",
  })

  const { handleSubmit, trigger, watch, formState: { errors } } = methods
  const currentStep = schema.steps[currentStepIndex]
  const totalSteps = schema.steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100
  
  // Проверка видимости текущего шага
  const isStepVisible = !currentStep.conditional || (() => {
    const conditionalValue = watch(currentStep.conditional.field) as string
    const expectedValues = Array.isArray(currentStep.conditional.value)
      ? currentStep.conditional.value
      : [currentStep.conditional.value]
    return expectedValues.includes(conditionalValue)
  })()
  
  // Если шаг не виден, переходим к следующему
  useEffect(() => {
    if (!isStepVisible && currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }, [isStepVisible, currentStepIndex, totalSteps])

  // Автосохранение при изменении данных
  useEffect(() => {
    const subscription = methods.watch((data) => {
      const progress = ((currentStepIndex + 1) / totalSteps) * 100
      saveState(currentStepIndex, progress, data as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, [methods, currentStepIndex, totalSteps, saveState])

  const handleNext = async () => {
    // Получаем все видимые поля текущего шага
    const visibleFields = currentStep.fields.filter((f) => {
      // Пропускаем условные поля, если условие не выполнено
      if (f.conditional) {
        const conditionalValue = watch(f.conditional.field) as string
        const expectedValues = Array.isArray(f.conditional.value)
          ? f.conditional.value
          : [f.conditional.value]
        return expectedValues.includes(conditionalValue)
      }
      return true
    })

    // Получаем имена полей для валидации
    const stepFieldNames = visibleFields.map((f) => f.name)

    // Валидируем все видимые поля
    const isValid = await trigger(stepFieldNames as any)

    // Дополнительная проверка обязательных полей
    if (isValid) {
      const formValues = methods.getValues()
      let hasErrors = false

      // Проверяем каждое видимое обязательное поле
      for (const field of visibleFields) {
        if (field.required) {
          const value = formValues[field.name]

          // Проверка для разных типов полей
          if (field.type === "radio" || field.type === "select") {
            if (!value || value === "" || value === null || value === undefined) {
              methods.setError(field.name, {
                type: "required",
                message: `Поле "${field.label}" обязательно для заполнения`,
              })
              hasErrors = true
            }
          } else if (field.type === "text" || field.type === "date" || field.type === "iin") {
            if (!value || (typeof value === "string" && value.trim() === "")) {
              methods.setError(field.name, {
                type: "required",
                message: `Поле "${field.label}" обязательно для заполнения`,
              })
              hasErrors = true
            }
          } else if (field.type === "number") {
            if (value === null || value === undefined || value === "") {
              methods.setError(field.name, {
                type: "required",
                message: `Поле "${field.label}" обязательно для заполнения`,
              })
              hasErrors = true
            }
          } else if (field.type === "array") {
            const arrayValue = Array.isArray(value) ? value : []
            const min = field.min ?? 0
            if (arrayValue.length < min) {
              methods.setError(field.name, {
                type: "required",
                message: `Необходимо добавить хотя бы ${min} элемент(ов) в "${field.label}"`,
              })
              hasErrors = true
            }
          } else if (field.type === "checkbox") {
            if (field.options && field.options.length > 0) {
              // Группа чекбоксов
              const checkedValues = Array.isArray(value) ? value : []
              if (checkedValues.length === 0) {
                methods.setError(field.name, {
                  type: "required",
                  message: `Поле "${field.label}" обязательно для заполнения`,
                })
                hasErrors = true
              }
            } else {
              // Одиночный чекбокс
              if (!value) {
                methods.setError(field.name, {
                  type: "required",
                  message: `Поле "${field.label}" обязательно для заполнения`,
                })
                hasErrors = true
              }
            }
          }
        }
      }

      if (hasErrors) {
        // Прокручиваем к первой ошибке
        const firstErrorField = visibleFields.find((f) => methods.formState.errors[f.name])
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField.name}"]`) || 
                         document.querySelector(`[id="${firstErrorField.name}-error"]`) ||
                         document.querySelector(`#${firstErrorField.name}-error`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
            ;(element as HTMLElement).focus()
          }
        }
        return
      }
    }

    // Если валидация прошла успешно, переходим к следующему шагу
    if (isValid && currentStepIndex < totalSteps - 1) {
      const newStepIndex = currentStepIndex + 1
      setCurrentStepIndex(newStepIndex)
      // Сохраняем состояние после перехода
      const formData = methods.getValues()
      const progress = ((newStepIndex + 1) / totalSteps) * 100
      saveState(newStepIndex, progress, formData as Record<string, unknown>)
    } else if (!isValid) {
      // Прокручиваем к первой ошибке
      const firstErrorField = visibleFields.find((f) => methods.formState.errors[f.name])
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField.name}"]`) || 
                       document.querySelector(`[id="${firstErrorField.name}-error"]`) ||
                       document.querySelector(`#${firstErrorField.name}-error`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          ;(element as HTMLElement).focus()
        }
      }
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    // Валидация всех шагов перед отправкой
    const allFieldNames: string[] = []
    
    schema.steps.forEach((step) => {
      step.fields.forEach((field) => {
        // Проверяем видимость поля
        let isVisible = true
        if (field.conditional) {
          const conditionalValue = watch(field.conditional.field) as string
          const expectedValues = Array.isArray(field.conditional.value)
            ? field.conditional.value
            : [field.conditional.value]
          isVisible = expectedValues.includes(conditionalValue)
        }

        // Проверяем видимость шага
        if (step.conditional) {
          const stepConditionalValue = watch(step.conditional.field) as string
          const stepExpectedValues = Array.isArray(step.conditional.value)
            ? step.conditional.value
            : [step.conditional.value]
          isVisible = isVisible && stepExpectedValues.includes(stepConditionalValue)
        }
        
        if (isVisible) {
          allFieldNames.push(field.name)
        }
      })
    })

    // Валидируем все поля
    const isValid = await trigger(allFieldNames as any)
    
    if (!isValid) {
      // Прокручиваем к первой ошибке
      const firstError = Object.keys(methods.formState.errors)[0]
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) || 
                       document.querySelector(`[id="${firstError}-error"]`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          ;(element as HTMLElement).focus()
        }
      }
      return
    }

    // Сохраняем финальное состояние
    const progress = 100
    saveState(totalSteps - 1, progress, data)
    if (onComplete) {
      onComplete(data)
    }
  }

  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <WizardProgress
          currentStep={currentStepIndex + 1}
          totalSteps={totalSteps}
          progress={progress}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WizardStep step={currentStep} />
          </motion.div>
        </AnimatePresence>

        <WizardNavigation
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstStep={currentStepIndex === 0}
          isLastStep={isLastStep}
          onSubmit={handleSubmit(onSubmit)}
        />
      </form>
    </FormProvider>
  )
}

