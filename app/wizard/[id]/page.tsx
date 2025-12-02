"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { WizardEngine } from "@/components/wizard/WizardEngine"
import { DraftRestoreModal } from "@/components/wizard/DraftRestoreModal"
import { useWizardState } from "@/lib/hooks/useWizardState"
import { WizardSchema } from "@/lib/types/wizard.types"
import { Document } from "@/schemas/document.schema"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function fetchDocument(id: string): Promise<Document> {
  const response = await fetch("/data/documents.json")
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  const data = await response.json()
  const document = data.documents.find((doc: Document) => doc.id === id)
  if (!document) {
    throw new Error("Document not found")
  }
  return document
}

async function fetchWizardSchema(id: string): Promise<WizardSchema | null> {
  try {
    const response = await fetch(`/data/wizard-schemas/${id}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`Failed to fetch wizard schema for ${id}:`, response.status, errorData)
      throw new Error(`Failed to load schema: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching wizard schema for ${id}:`, error)
    throw error
  }
}

export default function WizardPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const { state, saveState, clearState, restoreState, hasDraft } =
    useWizardState(documentId)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [useDraft, setUseDraft] = useState(false)

  const {
    data: document,
    isLoading: documentLoading,
    error: documentError,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocument(documentId),
  })

  const {
    data: wizardSchema,
    isLoading: schemaLoading,
    error: schemaError,
  } = useQuery({
    queryKey: ["wizard-schema", documentId],
    queryFn: () => fetchWizardSchema(documentId),
    enabled: !!documentId,
  })

  useEffect(() => {
    if (hasDraft && !useDraft) {
      setShowRestoreModal(true)
    }
  }, [hasDraft, useDraft])

  const handleRestore = () => {
    setUseDraft(true)
    setShowRestoreModal(false)
  }

  const handleStartNew = () => {
    clearState()
    setUseDraft(false)
    setShowRestoreModal(false)
  }

  const handleComplete = (data: Record<string, unknown>) => {
    // Сохраняем финальное состояние
    saveState(0, 100, data)
    // Переходим на страницу предпросмотра
    router.push(`/wizard/${documentId}/preview`)
  }

  if (documentLoading || schemaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (documentError || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Документ не найден</h1>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!wizardSchema) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
          <p className="text-muted-foreground mb-4">
            {schemaError 
              ? `Ошибка загрузки схемы: ${schemaError instanceof Error ? schemaError.message : 'Неизвестная ошибка'}`
              : schemaLoading 
                ? "Загрузка схемы..."
                : "Схема wizard для этого документа ещё не создана"}
          </p>
          {schemaError && (
            <p className="text-sm text-destructive mb-4">
              Попробуйте обновить страницу или проверьте консоль браузера
            </p>
          )}
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  const initialData = useDraft && state ? state.formData : undefined

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Назад к списку документов
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        {document.description && (
          <p className="text-muted-foreground">{document.description}</p>
        )}
      </div>

      <DraftRestoreModal
        open={showRestoreModal}
        onOpenChange={setShowRestoreModal}
        onRestore={handleRestore}
        onStartNew={handleStartNew}
        draftState={state}
      />

      <WizardEngine
        schema={wizardSchema}
        initialData={initialData}
        onComplete={handleComplete}
      />
    </div>
  )
}

