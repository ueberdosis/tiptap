import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-codeblock'

export default function extensions() {
  return [
    new Document(),
    new History(),
    new Paragraph(),
    new Text(),
    new Bold(),
    new Italic(),
    new Code(),
    new CodeBlock(),
  ]
}