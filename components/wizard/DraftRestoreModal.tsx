"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WizardState } from "@/lib/hooks/useWizardState"

interface DraftRestoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestore: () => void
  onStartNew: () => void
  draftState: WizardState | null
}

export function DraftRestoreModal({
  open,
  onOpenChange,
  onRestore,
  onStartNew,
  draftState,
}: DraftRestoreModalProps) {
  if (!draftState) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Восстановить черновик?</DialogTitle>
          <DialogDescription>
            Найден сохранённый черновик для этого документа. Вы были на шаге{" "}
            {draftState.currentStep} из {Math.round(draftState.progress / 10)}.
            Хотите восстановить его или начать заново?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onStartNew}>
            Начать заново
          </Button>
          <Button onClick={onRestore}>Восстановить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

