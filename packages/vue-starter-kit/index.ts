export * from '@tiptap/vue'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-codeblock'
import Heading from '@tiptap/extension-heading'
import Hardbreak from '@tiptap/extension-hardbreak'
import Strike from '@tiptap/extension-strike'
import Underline from '@tiptap/extension-underline'

export function defaultExtensions() {
  return [
    Document(),
    History(),
    Paragraph(),
    Text(),
    Bold(),
    Italic(),
    Code(),
    CodeBlock(),
    Heading(),
    Hardbreak(),
    Strike(),
    Underline(),
  ]
}