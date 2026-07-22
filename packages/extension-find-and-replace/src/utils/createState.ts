import type { Node } from '@tiptap/pm/model'

import type { FindAndReplaceOptions } from '../types.js'
import type { FindAndReplacePluginState } from '../plugin-state.js'
import { searchDocument } from '../search.js'

import { createDecorations } from './createDecorations.js'

export function createState(doc: Node, options: FindAndReplaceOptions): FindAndReplacePluginState {
  const results = searchDocument(doc, options.searchTerm, options)
  const currentIndex = results.length > 0 ? 0 : null

  return {
    searchTerm: options.searchTerm,
    replaceTerm: options.replaceTerm,
    caseSensitive: options.caseSensitive,
    useRegex: options.useRegex,
    wholeWord: options.wholeWord,
    results,
    currentIndex,
    decorations: createDecorations(doc, results, currentIndex),
  }
}
