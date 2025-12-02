"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { WizardSchema } from "@/lib/types/wizard.types"
import { createWizardSchema } from "@/lib/utils/validation"
import { WizardStep } from "@/components/wizard/WizardStep"
import { WizardNavigation } from "@/components/wizard/WizardNavigation"
import { WizardProgress } from "@/components/wizard/WizardProgress"
import { motion, AnimatePresence } from "framer-motion"
import { useWizardState } from "@/lib/hooks/useWizardState"
import { getNextStepId } from "./test-document-adapter"

interface TestDocumentStep {
  id: string
  type: string
  label?: string
  title?: string
  options?: Array<{ value: number | string; label: string }>
  fields?: Array<{
    name: string
    type: string
    label: string
    min?: number
    max?: number
    required?: boolean
  }>
  min?: number
  max?: number
  item_label?: string
  modes?: Array<{ value: string; label: string }>
  countries?: string
  cities_list?: string
  next?: string | Record<string, string>
}

interface DynamicWizardEngineProps {
  wizardSchema: WizardSchema
  originalSteps: TestDocumentStep[]
  initialData?: Record<string, unknown>
  onComplete?: (data: Record<string, unknown>) => void
  skipValidation?: boolean // Пропустить валидацию для просмотра UI
}

/**
 * Расширенный WizardEngine с поддержкой динамических переходов
 */
export function DynamicWizardEngine({
  wizardSchema,
  originalSteps,
  initialData,
  onComplete,
  skipValidation = false,
}: DynamicWizardEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepHistory, setStepHistory] = useState<number[]>([0])
  const validationSchema = createWizardSchema(wizardSchema.steps)
  const { saveState } = useWizardState(wizardSchema.documentId)

  // Подготавливаем значения по умолчанию
  const prepareDefaultValues = (): Record<string, unknown> => {
    const defaults: Record<string, unknown> = initialData ? { ...initialData } : {}
    
    wizardSchema.steps.forEach((step) => {
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
  
  // Получаем текущий шаг из wizardSchema и оригинальный шаг для логики переходов
  const currentStep = wizardSchema.steps[currentStepIndex]
  const currentOriginalStep = originalSteps.find((s) => s.id === currentStep?.id) || originalSteps[currentStepIndex] || originalSteps[0]
  const totalSteps = wizardSchema.steps.length
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
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      setStepHistory([...stepHistory, nextIndex])
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

  /**
   * Находит индекс шага в wizardSchema по ID из originalSteps
   */
  const findStepIndexByOriginalId = (stepId: string): number => {
    return wizardSchema.steps.findIndex((s) => s.id === stepId)
  }

  /**
   * Получает следующий шаг на основе логики из originalSteps
   */
  const getNextStepIndex = (): number | null => {
    if (!currentOriginalStep?.next) {
      // Если нет поля next, переходим к следующему шагу по порядку
      return currentStepIndex < totalSteps - 1 ? currentStepIndex + 1 : null
    }

    // Если next - строка, переходим к этому шагу
    if (typeof currentOriginalStep.next === "string") {
      const nextIndex = findStepIndexByOriginalId(currentOriginalStep.next)
      return nextIndex >= 0 ? nextIndex : null
    }

    // Если next - объект, выбираем на основе значения поля
    if (typeof currentOriginalStep.next === "object") {
      // Находим поле radio/select в текущем шаге
      const radioField = currentStep.fields.find((f) => f.type === "radio")
      if (radioField) {
        const fieldValue = watch(radioField.name)
        if (fieldValue) {
          const nextStepId = getNextStepId(currentOriginalStep, fieldValue)
          if (nextStepId) {
            const nextIndex = findStepIndexByOriginalId(nextStepId)
            return nextIndex >= 0 ? nextIndex : null
          }
        }
      }
    }

    // По умолчанию - следующий шаг по порядку
    return currentStepIndex < totalSteps - 1 ? currentStepIndex + 1 : null
  }

  const handleNext = async () => {
    // Если валидация отключена, просто переходим к следующему шагу
    if (skipValidation) {
      const nextIndex = getNextStepIndex()
      if (nextIndex !== null && nextIndex !== currentStepIndex) {
        setCurrentStepIndex(nextIndex)
        setStepHistory([...stepHistory, nextIndex])
        const formData = methods.getValues()
        const progress = ((nextIndex + 1) / totalSteps) * 100
        saveState(nextIndex, progress, formData as Record<string, unknown>)
      } else if (nextIndex === null) {
        handleSubmit(onSubmit)()
      }
      return
    }

    // Получаем все видимые поля текущего шага
    const visibleFields = currentStep.fields.filter((f) => {
      if (f.conditional) {
        const conditionalValue = watch(f.conditional.field) as string
        const expectedValues = Array.isArray(f.conditional.value)
          ? f.conditional.value
          : [f.conditional.value]
        return expectedValues.includes(conditionalValue)
      }
      return true
    })

    // Если нет полей, сразу переходим к следующему шагу
    if (visibleFields.length === 0) {
      const nextIndex = getNextStepIndex()
      if (nextIndex !== null && nextIndex !== currentStepIndex) {
        setCurrentStepIndex(nextIndex)
        setStepHistory([...stepHistory, nextIndex])
        const formData = methods.getValues()
        const progress = ((nextIndex + 1) / totalSteps) * 100
        saveState(nextIndex, progress, formData as Record<string, unknown>)
      } else if (nextIndex === null) {
        handleSubmit(onSubmit)()
      }
      return
    }

    // Получаем имена полей для валидации
    const stepFieldNames = visibleFields.map((f) => f.name)

    // Валидируем все видимые поля
    const isValid = await trigger(stepFieldNames as any)
    
    // Получаем текущие значения формы
    const formValues = methods.getValues()

    // Дополнительная проверка обязательных полей
    let hasErrors = false
    
    for (const field of visibleFields) {
      if (field.required) {
        const value = formValues[field.name]

        if (field.type === "radio" || field.type === "select") {
          if (!value || value === "" || value === null || value === undefined) {
            methods.setError(field.name, {
              type: "required",
              message: `Поле "${field.label}" обязательно для заполнения`,
            })
            hasErrors = true
          }
        } else if (field.type === "text" || field.type === "date" || field.type === "iin" || field.type === "phone") {
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
            const checkedValues = Array.isArray(value) ? value : []
            if (checkedValues.length === 0) {
              methods.setError(field.name, {
                type: "required",
                message: `Поле "${field.label}" обязательно для заполнения`,
              })
              hasErrors = true
            }
          } else {
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

    if (hasErrors || !isValid) {
      // Принудительно триггерим валидацию всех полей для показа ошибок
      trigger(stepFieldNames as any).then(() => {
        // Прокручиваем к первой ошибке после валидации
        const firstErrorField = visibleFields.find((f) => methods.formState.errors[f.name])
        if (firstErrorField) {
          // Небольшая задержка для рендеринга ошибок
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField.name}"]`) || 
                           document.querySelector(`[id="${firstErrorField.name}-error"]`) ||
                           document.querySelector(`#${firstErrorField.name}-error`)
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" })
              ;(element as HTMLElement).focus()
            }
          }, 100)
        }
      })
      return
    }

    // Если валидация прошла успешно, определяем следующий шаг
    if (isValid && !hasErrors) {
      const nextIndex = getNextStepIndex()
      
      if (nextIndex !== null && nextIndex !== currentStepIndex) {
        setCurrentStepIndex(nextIndex)
        setStepHistory([...stepHistory, nextIndex])
        const formData = methods.getValues()
        const progress = ((nextIndex + 1) / totalSteps) * 100
        saveState(nextIndex, progress, formData as Record<string, unknown>)
      } else if (nextIndex === null) {
        // Достигли конца, вызываем onSubmit
        handleSubmit(onSubmit)()
      }
    } else if (!isValid || hasErrors) {
      // Показываем ошибки валидации
      const firstErrorField = visibleFields.find((f) => methods.formState.errors[f.name])
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField.name}"]`) || 
                       document.querySelector(`[id="${firstErrorField.name}-error"]`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          ;(element as HTMLElement).focus()
        }
      }
    }
  }

  const handlePrevious = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory]
      newHistory.pop() // Удаляем текущий шаг
      const previousIndex = newHistory[newHistory.length - 1]
      setCurrentStepIndex(previousIndex)
      setStepHistory(newHistory)
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      setStepHistory([currentStepIndex - 1])
    }
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    const allFieldNames: string[] = []
    
    wizardSchema.steps.forEach((step) => {
      step.fields.forEach((field) => {
        let isVisible = true
        if (field.conditional) {
          const conditionalValue = watch(field.conditional.field) as string
          const expectedValues = Array.isArray(field.conditional.value)
            ? field.conditional.value
            : [field.conditional.value]
          isVisible = expectedValues.includes(conditionalValue)
        }

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

    const isValid = await trigger(allFieldNames as any)
    
    if (!isValid) {
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

