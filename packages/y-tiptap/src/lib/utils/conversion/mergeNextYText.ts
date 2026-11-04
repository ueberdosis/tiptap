import * as Y from 'yjs'

/** Moves the content of a following text type into this one to avoid duplicated characters. */
export const mergeNextYText = (text: Y.XmlText) => {
  const content = text._item?.right?.content
  const nextText = content instanceof Y.ContentType ? content.type : null

  if (!(nextText instanceof Y.Text)) return

  const nextItem = nextText._item
  const nextDoc = nextText.doc

  // Only the creator merges this text item to avoid competing repairs on peers.
  if (!nextItem || !nextDoc || nextItem.deleted || nextItem.id.client !== nextDoc.clientID) return

  text.applyDelta([{ retain: text.length }, ...nextText.toDelta()])
  nextDoc.transact(transaction => {
    nextItem.delete(transaction)
  })
}
