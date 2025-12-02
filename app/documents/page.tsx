"use client"

import { useQuery } from "@tanstack/react-query"
import { Document } from "@/schemas/document.schema"
import { DocumentFilters } from "@/components/DocumentFilters"
import { useState } from "react"
import { CATEGORIES } from "@/lib/constants/categories"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch("/data/documents.json")
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return response.json()
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Все")

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  })

  const filteredDocuments =
    data?.documents.filter((doc) => {
      if (selectedCategory !== "Все" && doc.category !== selectedCategory) {
        return false
      }
      if (
        searchQuery.trim() &&
        !doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    }) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки документов</h1>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Назад на главную
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Все документы</h1>
        <p className="text-muted-foreground">
          Список всех flowchart-документов с их статусами
        </p>
      </div>

      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Статус схемы</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell className="font-medium">{document.id}</TableCell>
                <TableCell>{document.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{document.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{document.type}</Badge>
                </TableCell>
                <TableCell>
                  {document.schemaReady ? (
                    <Badge className="bg-green-500">Готово</Badge>
                  ) : (
                    <Badge variant="outline">В разработке</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/documents/${document.id}`}>
                    <Button variant="outline" size="sm">
                      Подробнее
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Всего документов: {filteredDocuments.length}
      </div>
    </div>
  )
}

