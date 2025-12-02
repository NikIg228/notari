"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useWizardState } from "@/lib/hooks/useWizardState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PreviewData } from "@/components/preview/PreviewData"

interface TestDocument {
  id: number
  code: string
  title: string
  category: string
}

async function fetchTestDocument(id: string): Promise<TestDocument | null> {
  const response = await fetch("/data/test-documents")
  if (!response.ok) {
    throw new Error("Failed to fetch test documents")
  }
  const data = await response.json()
  return data.documents.find((doc: TestDocument) => doc.id === parseInt(id)) || null
}

export default function TestPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const { state, clearState } = useWizardState(`test-${documentId}`)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["test-document", documentId],
    queryFn: () => fetchTestDocument(documentId),
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
    const link = window.document.createElement("a")
    link.href = url
    link.download = `document-${documentId}-${Date.now()}.json`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !document) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/wizard-test/${documentId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться к редактированию
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        <p className="text-muted-foreground">
          {document.code} • {document.category}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Предпросмотр данных</CardTitle>
        </CardHeader>
        <CardContent>
          <PreviewData data={formData} />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Экспорт в JSON
        </Button>
        <Link href="/test">
          <Button variant="outline">Вернуться к списку</Button>
        </Link>
      </div>
    </div>
  )
}

