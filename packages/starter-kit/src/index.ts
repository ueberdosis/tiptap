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
  dropursor: Partial<DropcursorOptions>,
  paragraph: Partial<ParagraphOptions>,
  history: Partial<HistoryOptions>,
  bold: Partial<BoldOptions>,
  italic: Partial<ItalicOptions>,
  code: Partial<CodeOptions>,
  codeBlock: Partial<CodeBlockOptions>,
  heading: Partial<HeadingOptions>,
  hardBreak: Partial<HardBreakOptions>,
  strike: Partial<StrikeOptions>,
  blockquote: Partial<BlockquoteOptions>,
  horizontalRule: Partial<HorizontalRuleOptions>,
  bulletList: Partial<BulletListOptions>,
  orderedList: Partial<OrderedListOptions>,
  listItem: Partial<ListItemOptions>,
}>) {
  return [
    Document,
    Paragraph.configure(options?.paragraph),
    Text,
    Bold.configure(options?.bold),
    Italic.configure(options?.italic),
    Code.configure(options?.code),
    Strike.configure(options?.strike),
    HardBreak.configure(options?.hardBreak),
    Heading.configure(options?.heading),
    Blockquote.configure(options?.blockquote),
    BulletList.configure(options?.bulletList),
    OrderedList.configure(options?.orderedList),
    ListItem.configure(options?.listItem),
    HorizontalRule.configure(options?.horizontalRule),
    CodeBlock.configure(options?.codeBlock),
    History.configure(options?.history),
    Dropcursor.configure(options?.dropursor),
    Gapcursor,
  ]
}
