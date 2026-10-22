import type { NormalizedPNodeContent } from '../../../types/NormalizedPNodeContent.js'
import * as PModel from 'prosemirror-model'

export const normalizePNodeContent = (pnode: PModel.Node) => {
  const c = pnode.content.content
  const res: NormalizedPNodeContent = []
  for (let i = 0; i < c.length; i++) {
    const n = c[i]
    if (n.isText) {
      // Adjacent ProseMirror text nodes share one Y.XmlText, even with different marks.
      const textNodes = []
      for (let tnode = c[i]; i < c.length && tnode.isText; tnode = c[++i]) {
        textNodes.push(tnode)
      }
      i--
      res.push(textNodes)
    } else {
      res.push(n)
    }
  }
  return res
}
