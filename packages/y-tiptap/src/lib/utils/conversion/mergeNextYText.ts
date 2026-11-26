import * as Y from 'yjs'

/**
 * Sibling text types stay as they are. Copying the next sibling into this
 * one and deleting it races with concurrent typing and saves characters twice.
 */
export const mergeNextYText = (_text: Y.XmlText) => {}
