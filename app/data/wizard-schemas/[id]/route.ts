import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    const filePath = path.join(
      process.cwd(),
      "data",
      "wizard-schemas",
      `${id}.json`
    )

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Schema not found" },
        { status: 404 }
      )
    }

    const fileContents = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error loading wizard schema:", error)
    return NextResponse.json(
      { error: "Failed to load schema" },
      { status: 500 }
    )
  }
}

