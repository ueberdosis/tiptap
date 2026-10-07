import type { DecorationSet } from '@tiptap/pm/view'

import { widgetKeyOf } from './widgetKeyOf.js'

export interface DuplicateWidgetKey {
  key: string
  extensions: Set<string>
}

/**
 * Finds widget keys which are still duplicated in the final decoration set.
 * @param decorationSet The merged decoration set to inspect.
 * @returns The duplicate keys and their producing extensions.
 */
export function findDuplicateWidgetKeys(decorationSet: DecorationSet): DuplicateWidgetKey[] {
  const extensionsByKey = new Map<string, Set<string>>()
  const counts = new Map<string, number>()

  for (const decoration of decorationSet.find()) {
    const key = widgetKeyOf(decoration)

    if (!key) {
      continue
    }

    const extension = (decoration.spec as { extensionName?: string }).extensionName ?? 'unknown'
    const extensions = extensionsByKey.get(key) ?? new Set<string>()

    extensions.add(extension)
    extensionsByKey.set(key, extensions)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Array.from(extensionsByKey, ([key, extensions]) => ({ key, extensions })).filter(
    ({ key }) => (counts.get(key) ?? 0) > 1,
  )
}
