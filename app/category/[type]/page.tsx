"use client"

import { useQuery } from "@tanstack/react-query"
import { Document } from "@/schemas/document.schema"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getDocumentTypeCategory, DOCUMENT_TYPE_CATEGORIES } from "@/lib/constants/document-types"

async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch("/data/documents.json")
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return response.json()
}

const categoryLabels: Record<string, string> = {
  доверенность: "Доверенность",
  договор: "Договор",
  согласие: "Согласие",
  заявление: "Заявление",
  "наследственное дело": "Наследственное дело",
}

export default function CategoryPage() {
  const params = useParams()
  const categoryType = decodeURIComponent(params.type as string)

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  })

  // Проверяем, что категория валидна
  if (!DOCUMENT_TYPE_CATEGORIES.includes(categoryType as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Категория не найдена</h2>
          <p className="text-muted-foreground mb-6">Запрошенная категория не существует</p>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  const documents = data?.documents || []
  const filteredDocuments = documents.filter((doc) => {
    const docCategory = getDocumentTypeCategory(doc.type, doc.title)
    return docCategory === categoryType
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
          <p className="text-muted-foreground mb-6">Не удалось загрузить документы</p>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header - минималистичный */}
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
                {categoryLabels[categoryType] || categoryType}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? "документ" : "документов"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List - ChatGPT стиль */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-foreground mb-2">Документы не найдены</h3>
            <p className="text-sm text-muted-foreground mb-6">
              В этой категории пока нет документов
            </p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="px-5 py-5 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      {document.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {document.category}
                      </span>
                    </div>
                  </div>
                  <Link href={`/wizard/${document.id}`}>
                    <Button size="sm" className="shrink-0">
                      Создать
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

