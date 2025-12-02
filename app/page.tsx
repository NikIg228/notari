"use client"

import { useState, useEffect } from "react"
import { useDocuments } from "@/lib/hooks/useDocuments"
import { DocumentFilters } from "@/components/DocumentFilters"
import { DocumentGrid } from "@/components/DocumentGrid"
import { LoginForm } from "@/components/auth/LoginForm"
import { isAuthenticated, refreshAuth } from "@/lib/auth"
import { Loader2, FileText } from "lucide-react"
import { motion } from "framer-motion"

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const {
    documents,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useDocuments()

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const authStatus = isAuthenticated()
    setAuthenticated(authStatus)
    setCheckingAuth(false)

    // Обновляем время авторизации при активности пользователя
    if (authStatus) {
      refreshAuth()
    }
  }, [])

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  // Показываем форму входа, если не авторизован
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка документов...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Нотари
            </h1>
            <p className="text-xl text-muted-foreground">
              Быстрое и удобное создание документов через пошаговый мастер
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <DocumentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Документы</h2>
            <span className="px-2 py-1 rounded-full bg-muted text-sm font-medium">
              {documents.length}
            </span>
          </div>
          {(searchQuery || selectedCategory !== "Все") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("Все")
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Сбросить фильтры
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Документы не найдены</h3>
            <p className="text-muted-foreground mb-6">
              Попробуйте изменить параметры поиска или выбрать другую категорию
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("Все")
              }}
              className="text-primary hover:underline"
            >
              Показать все документы
            </button>
          </motion.div>
        ) : (
          <DocumentGrid documents={documents} />
        )}
      </div>
    </main>
  )
}

