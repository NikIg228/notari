"use client"

import { useFormContext } from "react-hook-form"
import { WizardStep as WizardStepType } from "@/lib/types/wizard.types"
import { FieldRenderer } from "@/components/forms/FieldRenderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WizardStepProps {
  step: WizardStepType
}

export function WizardStep({ step }: WizardStepProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.title}</CardTitle>
        {step.description && (
          <CardDescription>{step.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {step.fields.map((field) => {
          return (
            <FieldRenderer
              key={field.name}
              field={field}
              name={field.name}
              register={register}
              watch={watch}
              setValue={setValue}
              error={errors[field.name]}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}

