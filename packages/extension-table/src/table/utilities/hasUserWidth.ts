import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * Whether a `style` attribute on the table node sets a width.
 * The table extension defines no such attribute, but another extension may add one.
 */
export function hasUserWidth(node: PMNode): boolean {
  const { style } = node.attrs

  return typeof style === 'string' && /\bwidth\s*:/i.test(style)
}
