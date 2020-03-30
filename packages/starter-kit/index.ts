import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

export default function extensions() {
  return [
    new Document(),
    new History(),
    new Paragraph(),
    new Text(),
  ]
}