export const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null
