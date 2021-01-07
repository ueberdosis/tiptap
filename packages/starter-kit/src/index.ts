import Dropcursor, { DropcursorOptions } from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import Document from '@tiptap/extension-document'
import Paragraph, { ParagraphOptions } from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History, { HistoryOptions } from '@tiptap/extension-history'
import Bold, { BoldOptions } from '@tiptap/extension-bold'
import Italic, { ItalicOptions } from '@tiptap/extension-italic'
import Code, { CodeOptions } from '@tiptap/extension-code'
import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import Heading, { HeadingOptions } from '@tiptap/extension-heading'
import HardBreak, { HardBreakOptions } from '@tiptap/extension-hard-break'
import Strike, { StrikeOptions } from '@tiptap/extension-strike'
import Blockquote, { BlockquoteOptions } from '@tiptap/extension-blockquote'
import HorizontalRule, { HorizontalRuleOptions } from '@tiptap/extension-horizontal-rule'
import BulletList, { BulletListOptions } from '@tiptap/extension-bullet-list'
import OrderedList, { OrderedListOptions } from '@tiptap/extension-ordered-list'
import ListItem, { ListItemOptions } from '@tiptap/extension-list-item'

export function defaultExtensions(options?: Partial<{
  dropursor: DropcursorOptions,
  paragraph: ParagraphOptions,
  history: HistoryOptions,
  bold: BoldOptions,
  italic: ItalicOptions,
  code: CodeOptions,
  codeBlock: CodeBlockOptions,
  heading: HeadingOptions,
  hardBreak: HardBreakOptions,
  strike: StrikeOptions,
  blockquote: BlockquoteOptions,
  horizontalRule: HorizontalRuleOptions,
  bulletList: BulletListOptions,
  orderedList: OrderedListOptions,
  listItem: ListItemOptions,
}>) {
  return [
    Dropcursor.configure(options?.dropursor),
    Gapcursor,
    Document,
    History.configure(options?.history),
    Paragraph.configure(options?.paragraph),
    Text,
    Bold.configure(options?.bold),
    Italic.configure(options?.italic),
    Code.configure(options?.code),
    CodeBlock.configure(options?.codeBlock),
    Heading.configure(options?.heading),
    HardBreak.configure(options?.hardBreak),
    Strike.configure(options?.strike),
    Blockquote.configure(options?.blockquote),
    HorizontalRule.configure(options?.horizontalRule),
    BulletList.configure(options?.bulletList),
    OrderedList.configure(options?.orderedList),
    ListItem.configure(options?.listItem),
  ]
}
