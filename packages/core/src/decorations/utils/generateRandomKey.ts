/**
 * Generates a random key for decorations
 * @returns A random key string
 */
export function generateRandomKey(): string {
  return `decoration--${Math.random().toString(36).substring(2, 15)}`
}
