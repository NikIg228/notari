import { generateAllWizardSchemas } from "@/lib/parsers/wizard-generator"
import path from "path"

const documentsPath = path.join(process.cwd(), "data", "documents.json")
const outputDir = path.join(process.cwd(), "data", "wizard-schemas")

console.log("Генерация wizard схем для всех документов...\n")

generateAllWizardSchemas(documentsPath, outputDir)

console.log("\nГотово!")

