export interface TextDelta {
  insert: string
  attributes?: Record<string, Record<string, unknown>>
}
