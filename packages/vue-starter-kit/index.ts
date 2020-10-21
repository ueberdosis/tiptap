// import originalDefaultExtensions from '@tiptap/starter-kit'

import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'

export * from '@tiptap/vue'

export function defaultExtensions() {
  return [
    Document(),
    Text(),
    Paragraph(),
  ]
  // return originalDefaultExtensions()
}
