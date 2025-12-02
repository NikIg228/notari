"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WizardNavigationProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
  onSubmit: () => void
}

export function WizardNavigation({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  onSubmit,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>

      {isLastStep ? (
        <Button type="button" onClick={onSubmit} className="gap-2">
          Завершить
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onNext} className="gap-2">
          Далее
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

