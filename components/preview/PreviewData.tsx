"use client"

interface PreviewDataProps {
  data: Record<string, unknown>
  level?: number
}

export function PreviewData({ data, level = 0 }: PreviewDataProps) {
  const indent = level * 20

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">не указано</span>
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span className="text-muted-foreground italic">пусто</span>
        }
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <div className="font-medium text-sm text-muted-foreground mb-1">
                  Элемент {index + 1}
                </div>
                {typeof item === "object" && item !== null ? (
                  <PreviewData data={item as Record<string, unknown>} level={level + 1} />
                ) : (
                  <div>{String(item)}</div>
                )}
              </div>
            ))}
          </div>
        )
      }
      return <PreviewData data={value as Record<string, unknown>} level={level + 1} />
    }

    if (typeof value === "boolean") {
      return <span>{value ? "Да" : "Нет"}</span>
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b pb-2 last:border-0">
          <div className="font-medium text-sm text-muted-foreground mb-1">
            {formatFieldName(key)}
          </div>
          <div className="text-base">{renderValue(value)}</div>
        </div>
      ))}
    </div>
  )
}

function formatFieldName(name: string): string {
  // Преобразуем snake_case и camelCase в читаемый формат
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

