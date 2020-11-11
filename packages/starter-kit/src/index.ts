import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History, { HistoryOptions } from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Code from '@tiptap/extension-code'
import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import Heading, { HeadingOptions } from '@tiptap/extension-heading'
import HardBreak from '@tiptap/extension-hard-break'
import Strike from '@tiptap/extension-strike'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'

export function defaultExtensions(options: {
  history: HistoryOptions,
  codeBlock: CodeBlockOptions,
  heading: HeadingOptions,
}) {
  return [
    Dropcursor(),
    Gapcursor(),
    Document(),
    History(options?.history),
    Paragraph(),
    Text(),
    Bold(),
    Italic(),
    Code(),
    CodeBlock(options?.codeBlock),
    Heading(options?.heading),
    HardBreak(),
    Strike(),
    Blockquote(),
    HorizontalRule(),
    BulletList(),
    OrderedList(),
    ListItem(),
  ]
}
