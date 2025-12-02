"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"
import { motion } from "framer-motion"

interface LoginFormProps {
  onSuccess: () => void
}

const PASSWORD = "123123"

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Имитация задержки для UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (password === PASSWORD) {
      // Сохраняем состояние авторизации
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("authTimestamp", Date.now().toString())
      onSuccess()
    } else {
      setError("Неверный пароль. Попробуйте снова.")
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Нотари</CardTitle>
              <CardDescription className="mt-2">
                Введите пароль для доступа к системе
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !password}
              >
                {isLoading ? "Проверка..." : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

