"use client"

import { Progress } from "@/components/ui/progress"
import { Check } from "lucide-react"

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  progress: number
}

export function WizardProgress({
  currentStep,
  totalSteps,
  progress,
}: WizardProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Шаг {currentStep} из {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded ${
              index < currentStep
                ? "bg-primary"
                : index === currentStep - 1
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

