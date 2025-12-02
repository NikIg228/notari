"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { isAuthenticated, refreshAuth } from "@/lib/auth"
import { Loader2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { DOCUMENT_TYPE_CATEGORIES } from "@/lib/constants/document-types"

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  const categoryLabels: Record<string, string> = {
    доверенность: "Доверенность",
    договор: "Договор",
    согласие: "Согласие",
    заявление: "Заявление",
    "наследственное дело": "Наследственное дело",
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header - минималистичный */}
      <div className="border-b border-border bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Нотари
          </h1>
          <p className="text-base text-muted-foreground">
            Выберите категорию документов для создания
          </p>
        </div>
      </div>

      {/* Categories List - ChatGPT стиль */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ul className="space-y-2">
          {DOCUMENT_TYPE_CATEGORIES.map((category, index) => (
            <li key={category}>
              <Link
                href={`/category/${encodeURIComponent(category)}`}
                className="group flex items-center justify-between px-4 py-4 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150"
              >
                <span className="text-base font-medium text-foreground">
                  {categoryLabels[category] || category}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
