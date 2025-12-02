import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "test-documents.json")
    const fileContents = fs.readFileSync(filePath, "utf-8")
    const documents = JSON.parse(fileContents)
    
    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error reading test documents:", error)
    return NextResponse.json(
      { error: "Failed to load test documents" },
      { status: 500 }
    )
  }
}

