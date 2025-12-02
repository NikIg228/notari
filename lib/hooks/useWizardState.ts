"use client"

import { useState, useEffect } from "react"

export interface WizardState {
  documentId: string
  currentStep: number
  progress: number
  formData: Record<string, unknown>
}

const STORAGE_KEY_PREFIX = "wizard_draft_"

export function useWizardState(documentId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${documentId}`

  const [state, setState] = useState<WizardState | null>(() => {
    if (typeof window === "undefined") return null
    
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const saveState = (
    currentStep: number,
    progress: number,
    formData: Record<string, unknown>
  ) => {
    const newState: WizardState = {
      documentId,
      currentStep,
      progress,
      formData,
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(newState))
      setState(newState)
    } catch (error) {
      console.error("Failed to save wizard state:", error)
    }
  }

  const clearState = () => {
    try {
      localStorage.removeItem(storageKey)
      setState(null)
    } catch (error) {
      console.error("Failed to clear wizard state:", error)
    }
  }

  const restoreState = (): WizardState | null => {
    return state
  }

  return {
    state,
    saveState,
    clearState,
    restoreState,
    hasDraft: state !== null,
  }
}

