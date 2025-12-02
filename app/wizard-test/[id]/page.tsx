"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { DynamicWizardEngine } from "@/lib/adapters/dynamic-wizard-engine"
import { convertTestDocumentToWizardSchema } from "@/lib/adapters/test-document-adapter"
import { DraftRestoreModal } from "@/components/wizard/DraftRestoreModal"
import { useWizardState } from "@/lib/hooks/useWizardState"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TestDocument {
  id: number
  code: string
  title: string
  category: string
  parsed: {
    steps: any[]
    placeholders: string[]
  }
}

async function fetchTestDocuments(): Promise<{ documents: TestDocument[] }> {
  const response = await fetch("/data/test-documents")
  if (!response.ok) {
    throw new Error("Failed to fetch test documents")
  }
  return response.json()
}

export default function TestWizardPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const { state, saveState, clearState, restoreState, hasDraft } =
    useWizardState(`test-${documentId}`)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [useDraft, setUseDraft] = useState(false)

  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
  } = useQuery({
    queryKey: ["test-documents"],
    queryFn: fetchTestDocuments,
  })

  const document = documentsData?.documents.find(
    (doc) => doc.id === parseInt(documentId)
  )

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
    router.push(`/wizard-test/${documentId}/preview`)
  }

  if (documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (documentsError || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Документ не найден</h1>
          <Link href="/test">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Преобразуем test-document в WizardSchema
  const wizardSchema = convertTestDocumentToWizardSchema(document)
  const originalSteps = document.parsed.steps

  const initialData = useDraft && state ? state.formData : undefined

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/test">
          <Button variant="ghost" className="mb-4">
            ← Назад к списку документов
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        <p className="text-muted-foreground">
          {document.code} • {document.category}
        </p>
      </div>

      <DraftRestoreModal
        open={showRestoreModal}
        onOpenChange={setShowRestoreModal}
        onRestore={handleRestore}
        onStartNew={handleStartNew}
        draftState={state}
      />

      <DynamicWizardEngine
        wizardSchema={wizardSchema}
        originalSteps={originalSteps}
        initialData={initialData}
        onComplete={handleComplete}
        skipValidation={true}
      />
    </div>
  )
}

