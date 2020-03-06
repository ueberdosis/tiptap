import Document from '@tiptap/document-extension'
import History from '@tiptap/history-extension'
import Paragraph from '@tiptap/paragraph-extension'
import Text from '@tiptap/text-extension'

export default function extensions() {
  return [
    new Document(),
    new History(),
    new Paragraph(),
    new Text(),
  ]
}