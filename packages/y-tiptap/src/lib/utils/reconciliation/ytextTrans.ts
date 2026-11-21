import * as Y from 'yjs'

export const ytextTrans = (ytext: Y.Text) => {
  let str = ''
  let n: Y.Item | null = ytext._start
  // Explicit nulls let the next delta clear marks that no longer exist in ProseMirror.
  const nAttrs: Record<string, null> = {}
  while (n !== null) {
    if (!n.deleted) {
      if (n.countable && n.content instanceof Y.ContentString) {
        str += n.content.str
      } else if (n.content instanceof Y.ContentFormat) {
        nAttrs[n.content.key] = null
      }
    }
    n = n.right
  }
  return {
    str,
    nAttrs,
  }
}
