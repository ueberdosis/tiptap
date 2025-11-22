import type { Node as ProsemirrorNode } from '@tiptap/pm/model'

import type { SearchResult } from './types.js'

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const findMatches = (doc: ProsemirrorNode, searchTerm: string, caseSensitive: boolean): SearchResult[] => {
  if (!searchTerm) {
    return []
  }

  const results: SearchResult[] = []
  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(escapeRegExp(searchTerm), flags)

  doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text
      if (!text) {
        return
      }

      let match: RegExpExecArray | null = regex.exec(text)
      while (match) {
        results.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        })
        match = regex.exec(text)
      }
    }
  })

  return results
}

export default {
  debounce,
  escapeRegExp,
  findMatches,
}
