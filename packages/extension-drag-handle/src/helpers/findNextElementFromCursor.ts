import type { Editor } from '@tiptap/core'

export type FindElementNextToCoords = {
  x: number
  y: number
  direction?: 'left' | 'right'
  editor: Editor
  bandHeight?: number
}

export const findElementNextToCoords = (options: FindElementNextToCoords) => {
  const { x, y, direction = 'right', editor, bandHeight = 5 } = options

  const rect = {
    top: y - bandHeight,
    bottom: y + bandHeight,
    left: direction === 'right' ? x : 0,
    right: direction === 'right' ? window.innerWidth - x : x,
  }

  const root = editor.view.dom as HTMLElement

  // Get potential candidates from prosemirror child elements and filter
  // by removing decorations and non prosemirror-elements
  const candidates = [...root.querySelectorAll<HTMLElement>('*')]
    .filter(candidate => {
      return editor.view.posAtDOM(candidate, 0) >= 0
    })
    .filter(candidate => {
      const candidateRect = candidate.getBoundingClientRect()
      return !(
        candidateRect.bottom < rect.top ||
        candidateRect.top > rect.bottom ||
        candidateRect.right < rect.left ||
        candidateRect.left > rect.right
      )
    })

  if (!candidates || candidates.length === 0) {
    return { resultElement: null, resultNode: null, pos: null }
  }

  const finalCandidate = candidates[0]
  const candidatePos = editor.view.posAtDOM(finalCandidate, 0)
  if (candidatePos === -1) {
    return { resultElement: finalCandidate, resultNode: null, pos: null }
  }

  const $pos = editor.state.doc.resolve(candidatePos)

  if ($pos.nodeAfter) {
    const nodeAfterDom = editor.view.nodeDOM($pos.pos)

    if (nodeAfterDom && nodeAfterDom === finalCandidate) {
      return {
        resultElement: finalCandidate,
        resultNode: $pos.nodeAfter,
        pos: candidatePos,
      }
    }
  }

  const candidateNode = editor.state.doc.nodeAt(candidatePos - 1)

  return { resultElement: finalCandidate, resultNode: candidateNode, pos: candidatePos }
}
