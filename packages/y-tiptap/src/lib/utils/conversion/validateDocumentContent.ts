import type { Fragment, Schema } from 'prosemirror-model'

export const validateDocumentContent = (content: Fragment, schema: Schema) => {
  // Empty shared fragments use the editor's placeholder document.
  if (content.childCount > 0 && !schema.topNodeType.validContent(content)) {
    throw new RangeError('Shared content does not fit the document schema')
  }
}
