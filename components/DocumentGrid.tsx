import { Document } from "@/schemas/document.schema"
import { DocumentCard } from "@/components/DocumentCard"

interface DocumentGridProps {
  documents: Document[]
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {documents.map((document, index) => (
        <DocumentCard key={document.id} document={document} index={index} />
      ))}
    </div>
  )
}

