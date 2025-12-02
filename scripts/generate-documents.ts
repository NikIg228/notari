import { generateDocumentsJson } from "@/lib/parsers/docs-parser"
import path from "path"

const docsPath = path.join(process.cwd(), "docs.txt")
const outputPath = path.join(process.cwd(), "data", "documents.json")

generateDocumentsJson(docsPath, outputPath)

