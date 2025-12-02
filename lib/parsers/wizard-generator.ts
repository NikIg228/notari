import fs from "fs"
import path from "path"
import { WizardSchema, WizardStep, Field } from "@/lib/types/wizard.types"
import { COUNTRIES } from "@/lib/constants/countries"
import { REGIONS } from "@/lib/constants/regions"

interface FlowchartNode {
  id: string
  type: "start" | "form" | "choice" | "validation" | "generate" | "end"
  title: string
  fields?: string[]
  options?: string[]
  min?: number
  max?: number
}

function parseFlowchart(flowchartText: string): FlowchartNode[] {
  const nodes: FlowchartNode[] = []
  const lines = flowchartText.split("\n")

  for (const line of lines) {
    // START узел
    if (line.includes("START([Старт:")) {
      const match = line.match(/START\(\[Старт:\s*Форма\s+"([^"]+)"\]\)|START\(\[Старт:\s*([^\]]+)\]\)/)
      if (match) {
        nodes.push({
          id: "start",
          type: "start",
          title: match[1] || match[2] || "",
        })
      }
    }

    // Форма (блок с полями)
    if (line.includes("[Форма") || line.includes("[Блок")) {
      const match = line.match(/\[([^\]]+)\]/)
      if (match) {
        const content = match[1]
        const fields: string[] = []
        const fieldLines = content.split("<br/>")
        
        for (const fieldLine of fieldLines) {
          const cleanField = fieldLine.replace(/^-\s*/, "").trim()
          if (cleanField && !cleanField.includes("Форма") && !cleanField.includes("Блок")) {
            fields.push(cleanField)
          }
        }

        nodes.push({
          id: content.substring(0, 20).replace(/\s/g, "_"),
          type: "form",
          title: content.split("<br/>")[0].replace(/Форма\s+|Блок\s+"?/g, ""),
          fields,
        })
      }
    }

    // Выбор (choice)
    if (line.includes("{") && line.includes("}")) {
      const match = line.match(/\{([^}]+)\}/)
      if (match) {
        const content = match[1]
        const options: string[] = []
        
        // Извлекаем опции из следующих строк
        const nextLines = lines.slice(lines.indexOf(line), lines.indexOf(line) + 10)
        for (const nextLine of nextLines) {
          if (nextLine.includes("-->|")) {
            const optionMatch = nextLine.match(/-->\|([^|]+)\|/)
            if (optionMatch) {
              options.push(optionMatch[1].trim())
            }
          }
        }

        nodes.push({
          id: content.substring(0, 20).replace(/\s/g, "_"),
          type: "choice",
          title: content.replace(/<br\/>/g, " "),
          options,
        })
      }
    }
  }

  return nodes
}

function extractFieldsFromText(text: string): Field[] {
  const fields: Field[] = []
  const lines = text.split("<br/>")

  for (const line of lines) {
    const cleanLine = line.replace(/^-\s*/, "").trim()
    if (!cleanLine || cleanLine.includes("Форма") || cleanLine.includes("Блок")) continue

    // ФИО
    if (cleanLine.includes("ФИО")) {
      fields.push({
        name: "fullName",
        type: "text",
        label: "ФИО",
        required: true,
      })
    }

    // ИИН
    if (cleanLine.includes("ИИН")) {
      fields.push({
        name: "iin",
        type: "iin",
        label: cleanLine.includes("если есть") ? "ИИН (если есть)" : "ИИН",
        required: !cleanLine.includes("если есть") && !cleanLine.includes("опц"),
      })
    }

    // БИН
    if (cleanLine.includes("БИН")) {
      fields.push({
        name: "bin",
        type: "iin",
        label: "БИН",
        required: !cleanLine.includes("опц"),
      })
    }

    // Дата рождения
    if (cleanLine.includes("Дата рождения")) {
      fields.push({
        name: "birthDate",
        type: "date",
        label: "Дата рождения",
        required: true,
      })
    }

    // Адрес
    if (cleanLine.includes("Адрес")) {
      fields.push({
        name: "address",
        type: "text",
        label: cleanLine,
        required: !cleanLine.includes("опц"),
      })
    }

    // Телефон
    if (cleanLine.includes("Телефон") || cleanLine.includes("тел")) {
      fields.push({
        name: "phone",
        type: "phone",
        label: "Телефон",
        required: !cleanLine.includes("опц"),
      })
    }

    // Документ
    if (cleanLine.includes("Документ") && !cleanLine.includes("тип")) {
      if (cleanLine.includes("серия") || cleanLine.includes("номер")) {
        fields.push({
          name: "passportNumber",
          type: "text",
          label: "Серия и номер документа",
          required: true,
        })
      }
      if (cleanLine.includes("кем выдан")) {
        fields.push({
          name: "passportIssuedBy",
          type: "text",
          label: "Кем выдан",
          required: true,
        })
      }
      if (cleanLine.includes("дата выдачи")) {
        fields.push({
          name: "passportIssuedDate",
          type: "date",
          label: "Дата выдачи",
          required: true,
        })
      }
    }

    // Тип документа
    if (cleanLine.includes("тип") && cleanLine.includes("документ")) {
      fields.push({
        name: "passportType",
        type: "select",
        label: "Тип документа",
        required: true,
        options: [
          { label: "Паспорт", value: "passport" },
          { label: "Удостоверение личности", value: "id" },
        ],
      })
    }

    // Гражданство
    if (cleanLine.includes("Гражданство")) {
      fields.push({
        name: "citizenship",
        type: "text",
        label: "Гражданство",
        required: !cleanLine.includes("опц"),
      })
    }
  }

  return fields
}

function createWizardSchemaFromFlowchart(
  documentId: string,
  flowchartText: string
): WizardSchema {
  const steps: WizardStep[] = []
  const lines = flowchartText.split("\n")

  // Определяем тип документа по названию
  const isChildDocument = flowchartText.includes("ребен") || flowchartText.includes("дет")
  const isVehicleDocument = flowchartText.includes("ТС") || flowchartText.includes("транспорт")
  const isPropertyDocument = flowchartText.includes("недвижим") || flowchartText.includes("имуществ")
  const isTMC = flowchartText.includes("ТМЦ")

  let currentStepIndex = 0

  // Шаг 1: Выбор количества доверителей (если есть выбор)
  if (flowchartText.includes("Доверитель: кол-во") || flowchartText.includes("Доверитель: количество")) {
    steps.push({
      id: "trustor_choice",
      title: "Доверитель",
      description: "Выберите количество доверителей",
      fields: [
        {
          name: "trustorCount",
          type: "radio",
          label: "Количество доверителей",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
          ],
        },
      ],
    })
    currentStepIndex++
  }

  // Шаг 2: Доверитель 1
  steps.push({
    id: "trustor1",
    title: "Доверитель 1",
    fields: [
      {
        name: "trustor1_fullName",
        type: "text",
        label: "ФИО",
        required: true,
      },
      {
        name: "trustor1_iin",
        type: "iin",
        label: "ИИН",
        required: true,
      },
      {
        name: "trustor1_birthDate",
        type: "date",
        label: "Дата рождения",
        required: true,
      },
      {
        name: "trustor1_address",
        type: "text",
        label: "Адрес",
        required: true,
      },
      {
        name: "trustor1_passportType",
        type: "select",
        label: "Тип документа",
        required: true,
        options: [
          { label: "Паспорт", value: "passport" },
          { label: "Удостоверение личности", value: "id" },
        ],
      },
      {
        name: "trustor1_passportNumber",
        type: "text",
        label: "Серия и номер документа",
        required: true,
      },
      {
        name: "trustor1_passportIssuedBy",
        type: "text",
        label: "Кем выдан",
        required: true,
      },
      {
        name: "trustor1_passportIssuedDate",
        type: "date",
        label: "Дата выдачи",
        required: true,
      },
      {
        name: "trustor1_phone",
        type: "phone",
        label: "Телефон",
        required: false,
      },
    ],
    conditional: flowchartText.includes("Доверитель: кол-во") || flowchartText.includes("Доверитель: количество")
      ? {
          field: "trustorCount",
          value: ["1", "2"],
        }
      : undefined,
  })
  currentStepIndex++

  // Шаг 3: Доверитель 2 (если есть выбор)
  if (flowchartText.includes("Доверитель: кол-во") || flowchartText.includes("Доверитель: количество")) {
    steps.push({
      id: "trustor2",
      title: "Доверитель 2",
      fields: [
        {
          name: "trustor2_fullName",
          type: "text",
          label: "ФИО",
          required: true,
        },
        {
          name: "trustor2_iin",
          type: "iin",
          label: "ИИН",
          required: true,
        },
        {
          name: "trustor2_birthDate",
          type: "date",
          label: "Дата рождения",
          required: true,
        },
        {
          name: "trustor2_address",
          type: "text",
          label: "Адрес",
          required: true,
        },
        {
          name: "trustor2_passportType",
          type: "select",
          label: "Тип документа",
          required: true,
          options: [
            { label: "Паспорт", value: "passport" },
            { label: "Удостоверение личности", value: "id" },
          ],
        },
        {
          name: "trustor2_passportNumber",
          type: "text",
          label: "Серия и номер документа",
          required: true,
        },
        {
          name: "trustor2_passportIssuedBy",
          type: "text",
          label: "Кем выдан",
          required: true,
        },
        {
          name: "trustor2_passportIssuedDate",
          type: "date",
          label: "Дата выдачи",
          required: true,
        },
        {
          name: "trustor2_phone",
          type: "phone",
          label: "Телефон",
          required: false,
        },
      ],
      conditional: {
        field: "trustorCount",
        value: "2",
      },
    })
    currentStepIndex++
  }

  // Шаг: Выбор количества поверенных
  if (flowchartText.includes("Поверенный:") || flowchartText.includes("поверенн")) {
    steps.push({
      id: "agent_choice",
      title: "Поверенный",
      description: "Выберите количество поверенных",
      fields: [
        {
          name: "agentCount",
          type: "radio",
          label: "Количество поверенных",
          required: true,
          options: [
            { label: "1", value: "1" },
            { label: "2", value: "2" },
          ],
        },
      ],
    })
    currentStepIndex++
  }

  // Шаг: Поверенный 1
  steps.push({
    id: "agent1",
    title: "Поверенный 1",
    fields: [
      {
        name: "agent1_fullName",
        type: "text",
        label: "ФИО",
        required: true,
      },
      {
        name: "agent1_iin",
        type: "iin",
        label: "ИИН (если есть)",
        required: false,
      },
      {
        name: "agent1_birthDate",
        type: "date",
        label: "Дата рождения",
        required: true,
      },
      {
        name: "agent1_address",
        type: "text",
        label: "Адрес",
        required: true,
      },
      {
        name: "agent1_citizenship",
        type: "text",
        label: "Гражданство",
        required: false,
      },
      {
        name: "agent1_passportType",
        type: "select",
        label: "Тип документа",
        required: true,
        options: [
          { label: "Удостоверение личности", value: "id" },
          { label: "Паспорт", value: "passport" },
        ],
      },
      {
        name: "agent1_passportNumber",
        type: "text",
        label: "Серия/номер",
        required: true,
      },
      {
        name: "agent1_passportIssuedBy",
        type: "text",
        label: "Кем выдан",
        required: true,
      },
      {
        name: "agent1_passportIssuedDate",
        type: "date",
        label: "Дата выдачи",
        required: true,
      },
      {
        name: "agent1_phone",
        type: "phone",
        label: "Телефон",
        required: false,
      },
    ],
    conditional: flowchartText.includes("Поверенный:") || flowchartText.includes("поверенн")
      ? {
          field: "agentCount",
          value: ["1", "2"],
        }
      : undefined,
  })
  currentStepIndex++

  // Шаг: Поверенный 2 (если есть выбор)
  if (flowchartText.includes("Поверенный:") || flowchartText.includes("поверенн")) {
    steps.push({
      id: "agent2",
      title: "Поверенный 2",
      fields: [
        {
          name: "agent2_fullName",
          type: "text",
          label: "ФИО",
          required: true,
        },
        {
          name: "agent2_iin",
          type: "iin",
          label: "ИИН (если есть)",
          required: false,
        },
        {
          name: "agent2_birthDate",
          type: "date",
          label: "Дата рождения",
          required: true,
        },
        {
          name: "agent2_address",
          type: "text",
          label: "Адрес",
          required: true,
        },
        {
          name: "agent2_citizenship",
          type: "text",
          label: "Гражданство",
          required: false,
        },
        {
          name: "agent2_passportType",
          type: "select",
          label: "Тип документа",
          required: true,
          options: [
            { label: "Удостоверение личности", value: "id" },
            { label: "Паспорт", value: "passport" },
          ],
        },
        {
          name: "agent2_passportNumber",
          type: "text",
          label: "Серия/номер",
          required: true,
        },
        {
          name: "agent2_passportIssuedBy",
          type: "text",
          label: "Кем выдан",
          required: true,
        },
        {
          name: "agent2_passportIssuedDate",
          type: "date",
          label: "Дата выдачи",
          required: true,
        },
        {
          name: "agent2_phone",
          type: "phone",
          label: "Телефон",
          required: false,
        },
      ],
      conditional: {
        field: "agentCount",
        value: "2",
      },
    })
    currentStepIndex++
  }

  // Дети (если есть)
  if (isChildDocument && flowchartText.includes("Дети:") || flowchartText.includes("ребёнк")) {
    steps.push({
      id: "children",
      title: "Дети",
      description: "Добавьте информацию о детях (от 1 до 10)",
      fields: [
        {
          name: "children",
          type: "array",
          label: "Дети",
          required: true,
          min: 1,
          max: 10,
          fields: [
            {
              name: "fullName",
              type: "text",
              label: "ФИО",
              required: true,
            },
            {
              name: "iin",
              type: "iin",
              label: "ИИН",
              required: false,
            },
            {
              name: "birthDate",
              type: "date",
              label: "Дата рождения",
              required: true,
            },
            {
              name: "citizenship",
              type: "text",
              label: "Гражданство",
              required: false,
            },
            {
              name: "documentType",
              type: "select",
              label: "Тип документа",
              required: true,
              options: [
                { label: "Свидетельство о рождении", value: "birth_certificate" },
                { label: "Паспорт", value: "passport" },
              ],
            },
            {
              name: "documentNumber",
              type: "text",
              label: "Номер документа",
              required: true,
            },
            {
              name: "documentIssuedDate",
              type: "date",
              label: "Дата выдачи",
              required: false,
            },
            {
              name: "documentIssuedBy",
              type: "text",
              label: "Кем выдан",
              required: false,
            },
          ],
        },
      ],
    })
    currentStepIndex++
  }

  // Транспортное средство
  if (isVehicleDocument) {
    steps.push({
      id: "vehicle",
      title: "Данные транспортного средства",
      fields: [
        {
          name: "vehicle_type",
          type: "select",
          label: "Тип ТС",
          required: true,
          options: [
            { label: "Легковой", value: "passenger" },
            { label: "Грузовой", value: "truck" },
            { label: "Мотоцикл", value: "motorcycle" },
            { label: "Автобус", value: "bus" },
          ],
        },
        {
          name: "vehicle_brand",
          type: "text",
          label: "Марка",
          required: true,
        },
        {
          name: "vehicle_model",
          type: "text",
          label: "Модель",
          required: true,
        },
        {
          name: "vehicle_registrationNumber",
          type: "text",
          label: "Гос. номер",
          required: true,
        },
        {
          name: "vehicle_vin",
          type: "text",
          label: "VIN / шасси / кузов",
          required: false,
        },
        {
          name: "vehicle_year",
          type: "number",
          label: "Год выпуска",
          required: true,
          min: 1900,
          max: new Date().getFullYear() + 1,
        },
        {
          name: "vehicle_registrationDocumentNumber",
          type: "text",
          label: "Серия/номер документа регистрации",
          required: false,
        },
        {
          name: "vehicle_registrationDocumentIssuedBy",
          type: "text",
          label: "Кем выдан документ регистрации",
          required: false,
        },
        {
          name: "vehicle_registrationDocumentIssuedDate",
          type: "date",
          label: "Дата выдачи документа регистрации",
          required: false,
        },
      ],
    })
    currentStepIndex++
  }

  // ТМЦ
  if (isTMC) {
    steps.push({
      id: "where_pickup",
      title: "Где и у кого забирать",
      fields: [
        {
          name: "pickup_companyName",
          type: "text",
          label: "Наименование компании / организации",
          required: true,
        },
        {
          name: "pickup_bin",
          type: "iin",
          label: "БИН / ИИН",
          required: false,
        },
        {
          name: "pickup_address",
          type: "text",
          label: "Адрес склада / офиса",
          required: true,
        },
        {
          name: "pickup_additionalInfo",
          type: "text",
          label: "Доп. данные (номер договора / накладной)",
          required: false,
        },
      ],
    })
    currentStepIndex++

    steps.push({
      id: "tmc_items",
      title: "Что именно забрать (ТМЦ)",
      description: "Минимум 1 позиция",
      fields: [
        {
          name: "tmc_items",
          type: "array",
          label: "Позиции ТМЦ",
          required: true,
          min: 1,
          fields: [
            {
              name: "name",
              type: "text",
              label: "Наименование ТМЦ",
              required: true,
            },
            {
              name: "brand",
              type: "text",
              label: "Марка / модель",
              required: false,
            },
            {
              name: "quantity",
              type: "number",
              label: "Количество",
              required: true,
              min: 1,
            },
            {
              name: "unit",
              type: "select",
              label: "Единица измерения",
              required: true,
              options: [
                { label: "шт", value: "pcs" },
                { label: "кг", value: "kg" },
                { label: "л", value: "l" },
                { label: "м", value: "m" },
                { label: "м²", value: "m2" },
                { label: "м³", value: "m3" },
              ],
            },
            {
              name: "note",
              type: "text",
              label: "Примечание / описание",
              required: false,
            },
          ],
        },
      ],
    })
    currentStepIndex++
  }

  // Страны (если есть)
  if (flowchartText.includes("стран") || flowchartText.includes("Весь мир")) {
    const countryOptions = COUNTRIES.map((country) => ({
      label: country,
      value: country,
    }))

    steps.push({
      id: "countries",
      title: "Выбор стран поездки",
      fields: [
        {
          name: "countries",
          type: "checkbox",
          label: "Страны",
          required: true,
          options: countryOptions,
        },
      ],
    })
    currentStepIndex++
  }

  // Регионы РК (если есть)
  if (flowchartText.includes("РК") || flowchartText.includes("Республика Казахстан") || flowchartText.includes("городов")) {
    const regionOptions = REGIONS.map((region) => ({
      label: region,
      value: region,
    }))

    steps.push({
      id: "regions",
      title: "Маршрут внутри РК",
      fields: [
        {
          name: "regions",
          type: "checkbox",
          label: "Регионы",
          required: true,
          options: regionOptions,
        },
      ],
    })
    currentStepIndex++
  }

  // Срок
  if (flowchartText.includes("Срок") || flowchartText.includes("срок")) {
    steps.push({
      id: "term",
      title: "Срок доверенности",
      fields: [
        {
          name: "termType",
          type: "radio",
          label: "Тип срока",
          required: true,
          options: [
            { label: "Дни", value: "days" },
            { label: "Месяцы", value: "months" },
          ],
        },
        {
          name: "termDays",
          type: "number",
          label: "Количество дней",
          required: false,
          min: 1,
          max: 31,
          conditional: {
            field: "termType",
            value: "days",
          },
        },
        {
          name: "termMonths",
          type: "number",
          label: "Количество месяцев",
          required: false,
          min: 1,
          max: 36,
          conditional: {
            field: "termType",
            value: "months",
          },
        },
      ],
    })
    currentStepIndex++
  }

  return {
    documentId,
    steps,
  }
}

export function generateAllWizardSchemas(
  documentsPath: string,
  outputDir: string
) {
  const documentsData = JSON.parse(
    fs.readFileSync(documentsPath, "utf-8")
  )

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const generatedSchemas: string[] = []

  for (const document of documentsData.documents) {
    try {
      const schema = createWizardSchemaFromFlowchart(
        document.id,
        document.flowchart || ""
      )

      const outputPath = path.join(outputDir, `${document.id}.json`)
      fs.writeFileSync(
        outputPath,
        JSON.stringify(schema, null, 2),
        "utf-8"
      )

      generatedSchemas.push(document.id)
      console.log(`✓ Создана схема для документа ${document.id}: ${document.title}`)
    } catch (error) {
      console.error(
        `✗ Ошибка при создании схемы для документа ${document.id}:`,
        error
      )
    }
  }

  console.log(`\nВсего создано схем: ${generatedSchemas.length}`)
  return generatedSchemas
}

