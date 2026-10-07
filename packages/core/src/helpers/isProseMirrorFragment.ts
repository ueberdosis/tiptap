import { type Fragment } from '@tiptap/pm/model'

/**
 * Checks if a value is a ProseMirror fragment by inspecting it
 * @param value The value to check
 * @returns - A boolean, if true the value is a ProseMirror fragment
 * @example ```js
 * isProseMirrorFragment(editor.state.doc.content)
 * ```
 */
export function isProseMirrorFragment(value: unknown): value is Fragment {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const fragment = value as Record<string, unknown>

  if (
    !Array.isArray(fragment.content) ||
    typeof fragment.size !== 'number' ||
    typeof fragment.nodesBetween !== 'function' ||
    typeof fragment.descendants !== 'function' ||
    typeof fragment.textBetween !== 'function' ||
    typeof fragment.append !== 'function' ||
    typeof fragment.cut !== 'function' ||
    typeof fragment.eq !== 'function' ||
    typeof fragment.child !== 'function' ||
    typeof fragment.forEach !== 'function'
  ) {
    return false
  }

  return true
}
