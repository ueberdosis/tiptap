import type { JSONContent } from '@tiptap/core'

// Gives each node the text its mark run wraps, so a delimiter can fit the whole span
export function collectMarkSpanTexts(nodes: JSONContent[]): Map<string, string>[] {
  const spanTexts: Map<string, string>[] = nodes.map(() => new Map())
  const openRuns = new Map<string, { indexes: number[]; text: string }>()

  const flush = (markType: string) => {
    const run = openRuns.get(markType)
    if (!run) {
      return
    }
    // The edge whitespace is written outside the delimiters
    const wrappedText = run.text.trim()
    run.indexes.forEach(index => spanTexts[index].set(markType, wrappedText))
    openRuns.delete(markType)
  }

  nodes.forEach((node, index) => {
    if (node.type !== 'text') {
      Array.from(openRuns.keys()).forEach(flush)
      return
    }

    const markTypes = new Set((node.marks || []).map(mark => mark.type))

    Array.from(openRuns.keys())
      .filter(markType => !markTypes.has(markType))
      .forEach(flush)

    markTypes.forEach(markType => {
      const run = openRuns.get(markType) || { indexes: [], text: '' }
      run.indexes.push(index)
      run.text += node.text || ''
      openRuns.set(markType, run)
    })
  })

  Array.from(openRuns.keys()).forEach(flush)

  return spanTexts
}
