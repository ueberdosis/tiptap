import type { Node as PMNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import type { SearchResult } from '../search/search.js'

import { createDecoration } from './createDecoration.js'

export function createDecorations(
  doc: PMNode,
  results: SearchResult[],
  currentIndex: number | null,
): DecorationSet {
  const decorations = results.map((result, index) => createDecoration(result, currentIndex, index))

  return DecorationSet.create(doc, decorations)
}
