import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Document } from "@/schemas/document.schema"
import { 
  FileText, 
  Car, 
  Home, 
  Scale, 
  Baby, 
  Banknote, 
  Landmark,
  ArrowRight,
  FileCheck
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DocumentCardProps {
  document: Document
  index?: number
}

const categoryIcons: Record<string, React.ReactNode> = {
  Авто: <Car className="h-5 w-5" />,
  Недвижимость: <Home className="h-5 w-5" />,
  Суд: <Scale className="h-5 w-5" />,
  Дети: <Baby className="h-5 w-5" />,
  Банк: <Banknote className="h-5 w-5" />,
  Наследство: <Landmark className="h-5 w-5" />,
  Прочее: <FileText className="h-5 w-5" />,
}

const categoryColors: Record<string, string> = {
  Авто: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Недвижимость: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Суд: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Дети: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Банк: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Наследство: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Прочее: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

export function DocumentCard({ document, index = 0 }: DocumentCardProps) {
  const categoryIcon = categoryIcons[document.category] || <FileText className="h-5 w-5" />
  const categoryColor = categoryColors[document.category] || categoryColors.Прочее

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="flex flex-col h-full group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className={cn("p-2 rounded-lg w-fit", categoryColor)}>
            {categoryIcon}
          </div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {document.title}
          </CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-medium">
              {document.category}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {document.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {document.description}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <Link href={`/wizard/${document.id}`} className="w-full">
            <Button 
              className="w-full group/btn" 
              disabled={!document.schemaReady}
            >
              {document.schemaReady ? (
                <>
                  Создать документ
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  В разработке
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

