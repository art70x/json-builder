export type PropertyType = 'string' | 'number' | 'boolean' | 'array'

export interface Property {
  id: string
  key: string
  value: string
  type: PropertyType
}

export interface JsonObject {
  id: string
  properties: Property[]
}

export type JsonBuilderState = JsonObject[]

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function coerceValue(
  value: string,
  type: PropertyType,
): string | number | boolean | unknown[] | null {
  switch (type) {
    case 'string': {
      return value
    }
    case 'number': {
      const n = Number.parseFloat(value)
      return Number.isNaN(n) ? 0 : n
    }
    case 'boolean': {
      return value === 'true'
    }
    case 'array': {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => {
          const n = Number.parseFloat(item)
          if (!Number.isNaN(n) && item.trim() !== '') return n
          if (item === 'true') return true
          if (item === 'false') return false
          return item
        })
    }
    default: {
      return value
    }
  }
}

export function buildJsonOutput(state: JsonBuilderState): Record<string, unknown>[] {
  return state.map((object) => {
    const result: Record<string, unknown> = {}
    for (const property of object.properties) {
      if (property.key.trim()) {
        result[property.key] = coerceValue(property.value, property.type)
      }
    }
    return result
  })
}

export function detectType(value: unknown): PropertyType {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'array'
  return 'string'
}

export function serializeArrayValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join(', ')
  }
  return String(value)
}
const processObject = (object: Record<string, unknown>): JsonObject => ({
  id: generateId(),
  properties: Object.entries(object).map(([key, value_]) => {
    const type = detectType(value_)
    let value: string
    if (type === 'array') {
      value = serializeArrayValue(value_)
    } else {
      value = value_ === null || value_ === undefined ? '' : String(value_)
    }
    return { id: generateId(), key, value, type }
  }),
})

export function importFromJson(json: unknown): JsonBuilderState {
  if (Array.isArray(json)) {
    return json
      .filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
      .map((item) => processObject(item as Record<string, unknown>))
  }

  if (json !== null && typeof json === 'object' && !Array.isArray(json)) {
    return [processObject(json as Record<string, unknown>)]
  }

  return []
}

export const SAMPLE_STATE: JsonBuilderState = [
  {
    id: 'sample-1',
    properties: [
      { id: 'p1', key: 'id', value: '1', type: 'number' },
      { id: 'p2', key: 'name', value: 'Alice Chen', type: 'string' },
      { id: 'p3', key: 'email', value: 'alice@example.com', type: 'string' },
      { id: 'p4', key: 'age', value: '28', type: 'number' },
      { id: 'p5', key: 'active', value: 'true', type: 'boolean' },
    ],
  },
  {
    id: 'sample-2',
    properties: [
      { id: 'p6', key: 'id', value: '2', type: 'number' },
      { id: 'p7', key: 'name', value: 'Marcus Webb', type: 'string' },
      { id: 'p8', key: 'email', value: 'marcus@example.com', type: 'string' },
      { id: 'p9', key: 'age', value: '34', type: 'number' },
      { id: 'p10', key: 'active', value: 'false', type: 'boolean' },
    ],
  },
]
