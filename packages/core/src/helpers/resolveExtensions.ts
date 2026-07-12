import type { Extensions } from '../types.js'
import { flattenExtensions } from './flattenExtensions.js'
import { sortExtensions } from './sortExtensions.js'

/**
 * Removes duplicate extensions by name while keeping the last defined extension.
 * This matches Tiptap's last-defined precedence for conflicting extension behavior.
 */
function deduplicateExtensions(extensions: Extensions): Extensions {
  const seen = new Set<string>()
  const deduplicated: Extensions = []

  for (let index = extensions.length - 1; index >= 0; index -= 1) {
    const extension = extensions[index]
    const { name } = extension

    if (name && seen.has(name)) {
      continue
    }

    if (name) {
      seen.add(name)
    }

    deduplicated.push(extension)
  }

  deduplicated.reverse()

  return deduplicated
}

/**
 * Returns a flattened, sorted, and de-duplicated extension list.
 * Duplicate named extensions are resolved using last-defined precedence.
 * @param extensions An array of Tiptap extensions
 * @returns A flattened, sorted, and de-duplicated array of Tiptap extensions
 */
export function resolveExtensions(extensions: Extensions): Extensions {
  const flattenedExtensions = flattenExtensions(extensions)

  return sortExtensions(deduplicateExtensions(flattenedExtensions))
}
