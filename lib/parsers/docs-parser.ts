import fs from "fs"
import path from "path"
import { Document } from "@/schemas/document.schema"

function detectCategory(title: string): Document["category"] {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes("авто") || lowerTitle.includes("тс") || lowerTitle.includes("транспорт")) {
    return "Авто"
  }
  if (lowerTitle.includes("недвижим") || lowerTitle.includes("квартир") || lowerTitle.includes("дом") || lowerTitle.includes("имуществ")) {
    return "Недвижимость"
  }
  if (lowerTitle.includes("суд") || lowerTitle.includes("собрани") || lowerTitle.includes("оси") || lowerTitle.includes("кск")) {
    return "Суд"
  }
  if (lowerTitle.includes("ребен") || lowerTitle.includes("дет") || lowerTitle.includes("алимент") || lowerTitle.includes("брачн")) {
    return "Дети"
  }
  if (lowerTitle.includes("банк") || lowerTitle.includes("займ") || lowerTitle.includes("ипотек") || lowerTitle.includes("залог")) {
    return "Банк"
  }
  if (lowerTitle.includes("наследств") || lowerTitle.includes("завещан")) {
    return "Наследство"
  }
  return "Прочее"
}

function detectType(title: string): Document["type"] {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes("договор") || lowerTitle.includes("соглашен")) {
    return "договор"
  }
  if (lowerTitle.includes("заявлен")) {
    return "заявление"
  }
  return "доверенность"
}

export function parseDocsFile(filePath: string): Document[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const documents: Document[] = []
  
  // Находим все начала flowchart (с номером или без)
  const flowchartStarts: Array<{ id: string; index: number }> = []
  
  // Регулярное выражение для поиска начала flowchart
  const flowchartRegex = /^(\d+)\s+flowchart TD|^flowchart TD/gm
  let match
  
  while ((match = flowchartRegex.exec(content)) !== null) {
    const id = match[1] || String(flowchartStarts.length + 1)
    flowchartStarts.push({ id, index: match.index })
  }
  
  // Извлекаем каждый документ
  for (let i = 0; i < flowchartStarts.length; i++) {
    const start = flowchartStarts[i]
    const end = i + 1 < flowchartStarts.length 
      ? flowchartStarts[i + 1].index 
      : content.length
    
    const flowchartText = content.substring(start.index, end).trim()
    
    // Извлекаем название из START узла
    const startMatch = flowchartText.match(/START\(\[Старт:\s*Форма\s+"([^"]+)"\]\)|START\(\[Старт:\s*([^\]]+)\]\)/)
    
    if (startMatch) {
      const title = startMatch[1] || startMatch[2] || "Неизвестный документ"
      const category = detectCategory(title)
      const type = detectType(title)
      
      documents.push({
        id: start.id,
        title: title.trim(),
        category,
        type,
        description: `Документ ${start.id}: ${title}`,
        flowchart: flowchartText,
        schemaReady: false,
      })
    }
  }
  
  return documents
}

// Функция для генерации documents.json
export function generateDocumentsJson(inputPath: string, outputPath: string) {
  const documents = parseDocsFile(inputPath)
  
  const output = {
    documents: documents,
  }
  
  // Создаем директорию, если её нет
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8")
  console.log(`Создано ${documents.length} документов в ${outputPath}`)
  
  return documents
}

