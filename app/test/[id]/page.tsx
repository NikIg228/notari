"use client"

import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function TestDocumentPage() {
  const params = useParams()
  const documentId = parseInt(params.id as string)

  const { data, isLoading, error } = useQuery({
    queryKey: ["test-documents"],
    queryFn: fetchTestDocuments,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Загрузка документа...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-6">Не удалось загрузить документ</p>
          <Link href="/test">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    )
  }

  const document = data?.documents.find((doc) => doc.id === documentId)

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Документ не найден</h2>
          <p className="text-muted-foreground mb-6">Документ с ID {documentId} не существует</p>
          <Link href="/test">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/test">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {document.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {document.code} • {document.category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Шаги ({document.parsed.steps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.parsed.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-lg border border-border bg-white"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {index + 1}. {step.id}
                        </h4>
                        {step.title && (
                          <p className="text-sm text-muted-foreground mt-1">{step.title}</p>
                        )}
                        {step.label && (
                          <p className="text-sm text-muted-foreground mt-1">{step.label}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {step.type}
                      </span>
                    </div>
                    
                    {step.fields && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Поля:</p>
                        {step.fields.map((field: any, fieldIndex: number) => (
                          <div key={fieldIndex} className="text-xs text-muted-foreground pl-2">
                            • {field.label} ({field.type}) - {field.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {step.options && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Опции:</p>
                        {step.options.map((option: any, optIndex: number) => (
                          <div key={optIndex} className="text-xs text-muted-foreground pl-2">
                            • {option.label} ({option.value})
                          </div>
                        ))}
                      </div>
                    )}

                    {step.next && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Следующий шаг: {typeof step.next === "string" ? step.next : JSON.stringify(step.next)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Placeholders */}
          <Card>
            <CardHeader>
              <CardTitle>Плейсхолдеры ({document.parsed.placeholders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {document.parsed.placeholders.map((placeholder, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-mono"
                  >
                    {placeholder}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

