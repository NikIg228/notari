"use client"

import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

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

export default function TestPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test-documents"],
    queryFn: fetchTestDocuments,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Загрузка документов...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Ошибка загрузки</h2>
          <p className="text-muted-foreground mb-6">Не удалось загрузить тестовые документы</p>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  const documents = data?.documents || []

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Тестовые документы
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Корректная структура первых 5 документов
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-6">
          {documents.map((document) => (
            <div
              key={document.id}
              className="px-5 py-5 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {document.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {document.category}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    {document.title}
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Шагов: {document.parsed.steps.length}</p>
                    <p>Плейсхолдеров: {document.parsed.placeholders.length}</p>
                  </div>
                </div>
                <Link href={`/wizard-test/${document.id}`}>
                  <Button size="sm" className="shrink-0">
                    Создать
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

