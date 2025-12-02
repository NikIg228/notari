"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Document } from "@/schemas/document.schema"
import { useWizardState } from "@/lib/hooks/useWizardState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PreviewData } from "@/components/preview/PreviewData"

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

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const { state, clearState } = useWizardState(documentId)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocument(documentId),
  })

  useEffect(() => {
    if (state?.formData) {
      setFormData(state.formData)
    }
  }, [state])

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `document-${documentId}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleBackToEdit = () => {
    router.push(`/wizard/${documentId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !document) {
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

  if (!formData || Object.keys(formData).length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Нет данных для предпросмотра</h1>
          <Button onClick={handleBackToEdit}>Вернуться к редактированию</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку документов
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
          <p className="text-muted-foreground">Предпросмотр введённых данных</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Введённые данные</CardTitle>
        </CardHeader>
        <CardContent>
          <PreviewData data={formData} />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleBackToEdit} variant="outline">
          Вернуться к редактированию
        </Button>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Экспорт в JSON
        </Button>
      </div>
    </div>
  )
}

