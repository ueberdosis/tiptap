import type { Decoration } from '@tiptap/pm/view'

/**
 * Extracts the widget key from a decoration spec.
 * @param decoration The decoration to extract the key from.
 * @returns The widget key, or undefined if the decoration has no key.
 */
export function widgetKeyOf(decoration: Decoration): string | undefined {
  const key = (decoration.spec as { key?: unknown } | undefined)?.key
  return typeof key === 'string' ? key : undefined
}
