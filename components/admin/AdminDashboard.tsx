"use client"

import { useQuery } from "@tanstack/react-query"
import { Document } from "@/schemas/document.schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, FileText, CheckCircle2, Clock, BarChart3 } from "lucide-react"
import { adminLogout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch("/data/documents.json")
  if (!response.ok) {
    throw new Error("Failed to fetch documents")
  }
  return response.json()
}

export function AdminDashboard() {
  const router = useRouter()
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: fetchDocuments,
  })

  const handleLogout = () => {
    adminLogout()
    router.push("/")
  }

  const documents = data?.documents || []
  const readySchemas = documents.filter((d) => d.schemaReady).length
  const totalDocuments = documents.length
  const categoriesCount = new Set(documents.map((d) => d.category)).size

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка загрузки данных</CardTitle>
            <CardDescription>Не удалось загрузить документы</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Админ-панель</h1>
              <p className="text-muted-foreground mt-1">
                Управление нотариальными документами
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">На главную</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего документов</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  Всего в системе
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Готовых схем</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{readySchemas}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDocuments > 0 ? Math.round((readySchemas / totalDocuments) * 100) : 0}% готовности
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Категорий</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categoriesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Различных категорий
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Список документов */}
        <Card>
          <CardHeader>
            <CardTitle>Все документы</CardTitle>
            <CardDescription>
              Управление схемами и статусами документов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{document.title}</h3>
                      <Badge variant="secondary">{document.category}</Badge>
                      <Badge variant="outline">{document.type}</Badge>
                      {document.schemaReady ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Готово
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          В разработке
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {document.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/documents/${document.id}`}>
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                    </Link>
                    <Link href={`/wizard/${document.id}`}>
                      <Button size="sm">
                        Открыть wizard
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

