import { type Slice } from '@tiptap/pm/model'
import { isProseMirrorFragment } from './isProseMirrorFragment.js'

/**
 * Checks if a value is a ProseMirror slice by inspecting it
 * @param value The value to check
 * @returns - A boolean, if true the value is a ProseMirror slice
 * @example ```js
 * isProseMirrorSlice(editor.state.doc.content.slice(0, 10))
 * ```
 */
export function isProseMirrorSlice(value: unknown): value is Slice {
  if (value === null || typeof value !== 'object') {
    return false
  }

  const slice = value as Record<string, unknown>

  const openStartIsNumber = Number.isInteger(slice.openStart) && (slice.openStart as number) >= 0
  const openEndIsNumber = Number.isInteger(slice.openEnd) && (slice.openEnd as number) >= 0
  const sliceHasRequiredProperties =
    typeof slice.size === 'number' &&
    typeof slice.eq === 'function' &&
    typeof slice.toJSON === 'function'

  if (!openStartIsNumber || !openEndIsNumber || !sliceHasRequiredProperties) {
    return false
  }

  const content = slice.content

  if (content === null || typeof content !== 'object') {
    return false
  }

  const fragment = content as Record<string, unknown>

  if (!isProseMirrorFragment(fragment)) {
    return false
  }

  return true
}
