import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "documents.json")
    const fileContents = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(fileContents)
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    )
  }
}

