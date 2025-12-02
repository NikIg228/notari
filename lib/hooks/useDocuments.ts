"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Document, DocumentsList } from "@/schemas/document.schema"
import { Category } from "@/lib/constants/categories"

async function fetchDocuments(): Promise<DocumentsList> {
  const response = await fetch("/data/documents.json")
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return response.json()
}

export function useDocuments() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "Все">("Все")

  const { data, isLoading, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  })

  const filteredDocuments = useMemo(() => {
    if (!data?.documents) return []

    let filtered = data.documents

    // Фильтр по категории
    if (selectedCategory !== "Все") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory)
    }

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [data, selectedCategory, searchQuery])

  return {
    documents: filteredDocuments,
    allDocuments: data?.documents || [],
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  }
}

