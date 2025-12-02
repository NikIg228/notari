"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface AdminLoginFormProps {
  onSuccess: () => void
}

const ADMIN_PASSWORD = "101202"

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Имитация задержки для UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (password === ADMIN_PASSWORD) {
      // Сохраняем состояние авторизации
      localStorage.setItem("isAdminAuthenticated", "true")
      localStorage.setItem("adminAuthTimestamp", Date.now().toString())
      onSuccess()
    } else {
      setError("Неверный пароль. Попробуйте снова.")
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">
            Введите пароль для доступа к административной панели
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium text-foreground">
              Пароль администратора
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Введите пароль"
              className={error ? "border-destructive" : ""}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !password}
          >
            {isLoading ? "Проверка..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  )
}

