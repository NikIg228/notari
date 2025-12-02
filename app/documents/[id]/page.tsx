"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Document } from "@/schemas/document.schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

export default function DocumentDetailPage() {
  const params = useParams()
  const documentId = params.id as string
  const [showFlowchart, setShowFlowchart] = useState(false)

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDocument(documentId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Документ не найден</h1>
          <Link href="/documents">
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/documents">
          <Button variant="ghost" className="mb-4">
            ← Назад к списку документов
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о документе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">ID:</span>
              <span className="ml-2">{document.id}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Категория:</span>
              <Badge variant="secondary" className="ml-2">{document.category}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Тип:</span>
              <Badge variant="outline" className="ml-2">{document.type}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Статус схемы:</span>
              {document.schemaReady ? (
                <Badge className="ml-2 bg-green-500">Готово</Badge>
              ) : (
                <Badge variant="outline" className="ml-2">В разработке</Badge>
              )}
            </div>
            {document.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Описание:</span>
                <p className="mt-1">{document.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {document.flowchart && (
          <Card>
            <CardHeader>
              <CardTitle>Flowchart</CardTitle>
              <CardDescription>
                RAW текст flowchart из docs.txt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setShowFlowchart(!showFlowchart)}
                className="mb-4"
              >
                {showFlowchart ? "Скрыть" : "Показать"} flowchart
              </Button>
              {showFlowchart && (
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {document.flowchart}
                </pre>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {document.schemaReady ? (
              <Link href={`/wizard/${document.id}`}>
                <Button className="w-full">Создать документ</Button>
              </Link>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Схема wizard для этого документа ещё не создана
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Создать JSON-схему (скоро)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

