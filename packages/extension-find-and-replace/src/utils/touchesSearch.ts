import type { FindAndReplaceMeta } from '../plugin/plugin-state.js'

const searchKeys = ['searchTerm', 'caseSensitive', 'useRegex', 'wholeWord'] as const

export function touchesSearch(meta: FindAndReplaceMeta | undefined): boolean {
  return !!meta && searchKeys.some(key => key in meta)
}
