import { Extension } from '@tiptap/core'
import type { BlockquoteOptions } from '@tiptap/extension-blockquote'
import { Blockquote } from '@tiptap/extension-blockquote'
import type { BoldOptions } from '@tiptap/extension-bold'
import { Bold } from '@tiptap/extension-bold'
import type { CodeOptions } from '@tiptap/extension-code'
import { Code } from '@tiptap/extension-code'
import type { CodeBlockOptions } from '@tiptap/extension-code-block'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import type { HardBreakOptions } from '@tiptap/extension-hard-break'
import { HardBreak } from '@tiptap/extension-hard-break'
import type { HeadingOptions } from '@tiptap/extension-heading'
import { Heading } from '@tiptap/extension-heading'
import type { HorizontalRuleOptions } from '@tiptap/extension-horizontal-rule'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import type { ItalicOptions } from '@tiptap/extension-italic'
import { Italic } from '@tiptap/extension-italic'
import type { LinkOptions } from '@tiptap/extension-link'
import { Link } from '@tiptap/extension-link'
import type { BulletListOptions, ListItemOptions, ListKeymapOptions, OrderedListOptions } from '@tiptap/extension-list'
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list'
import type { ParagraphOptions } from '@tiptap/extension-paragraph'
import { Paragraph } from '@tiptap/extension-paragraph'
import type { StrikeOptions } from '@tiptap/extension-strike'
import { Strike } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'
import type { UnderlineOptions } from '@tiptap/extension-underline'
import { Underline } from '@tiptap/extension-underline'
import type { DropcursorOptions, TrailingNodeOptions, UndoRedoOptions } from '@tiptap/extensions'
import { Dropcursor, Gapcursor, TrailingNode, UndoRedo } from '@tiptap/extensions'

export interface StarterKitOptions {
  /**
   * If set to false, the blockquote extension will not be registered
   * @example blockquote: false
   */
  blockquote: Partial<BlockquoteOptions> | false

  /**
   * If set to false, the bold extension will not be registered
   * @example bold: false
   */
  bold: Partial<BoldOptions> | false

  /**
   * If set to false, the bulletList extension will not be registered
   * @example bulletList: false
   */
  bulletList: Partial<BulletListOptions> | false

  /**
   * If set to false, the code extension will not be registered
   * @example code: false
   */
  code: Partial<CodeOptions> | false

  /**
   * If set to false, the codeBlock extension will not be registered
   * @example codeBlock: false
   */
  codeBlock: Partial<CodeBlockOptions> | false

  /**
   * If set to false, the document extension will not be registered
   * @example document: false
   */
  document: false

  /**
   * If set to false, the dropcursor extension will not be registered
   * @example dropcursor: false
   */
  dropcursor: Partial<DropcursorOptions> | false

  /**
   * If set to false, the gapcursor extension will not be registered
   * @example gapcursor: false
   */
  gapcursor: false

  /**
   * If set to false, the hardBreak extension will not be registered
   * @example hardBreak: false
   */
  hardBreak: Partial<HardBreakOptions> | false

  /**
   * If set to false, the heading extension will not be registered
   * @example heading: false
   */
  heading: Partial<HeadingOptions> | false

  /**
   * If set to false, the undo-redo extension will not be registered
   * @example undoRedo: false
   */
  undoRedo: Partial<UndoRedoOptions> | false

  /**
   * If set to false, the horizontalRule extension will not be registered
   * @example horizontalRule: false
   */
  horizontalRule: Partial<HorizontalRuleOptions> | false

  /**
   * If set to false, the italic extension will not be registered
   * @example italic: false
   */
  italic: Partial<ItalicOptions> | false

  /**
   * If set to false, the listItem extension will not be registered
   * @example listItem: false
   */
  listItem: Partial<ListItemOptions> | false

  /**
   * If set to false, the listItemKeymap extension will not be registered
   * @example listKeymap: false
   */
  listKeymap: Partial<ListKeymapOptions> | false

  /**
   * If set to false, the link extension will not be registered
   * @example link: false
   */
  link: Partial<LinkOptions> | false

  /**
   * If set to false, the orderedList extension will not be registered
   * @example orderedList: false
   */
  orderedList: Partial<OrderedListOptions> | false

  /**
   * If set to false, the paragraph extension will not be registered
   * @example paragraph: false
   */
  paragraph: Partial<ParagraphOptions> | false

  /**
   * If set to false, the strike extension will not be registered
   * @example strike: false
   */
  strike: Partial<StrikeOptions> | false

  /**
   * If set to false, the text extension will not be registered
   * @example text: false
   */
  text: false

  /**
   * If set to false, the underline extension will not be registered
   * @example underline: false
   */
  underline: Partial<UnderlineOptions> | false

  /**
   * If set to false, the trailingNode extension will not be registered
   * @example trailingNode: false
   */
  trailingNode: Partial<TrailingNodeOptions> | false
}

/**
 * The starter kit is a collection of essential editor extensions.
 *
 * It’s a good starting point for building your own editor.
 */
export const StarterKit = Extension.create<StarterKitOptions>({
  name: 'starterKit',

  addExtensions() {
    const extensions = []

    if (this.options.bold !== false) {
      extensions.push(Bold.configure(this.options.bold))
    }

    if (this.options.blockquote !== false) {
      extensions.push(Blockquote.configure(this.options.blockquote))
    }

    if (this.options.bulletList !== false) {
      extensions.push(BulletList.configure(this.options.bulletList))
    }

    if (this.options.code !== false) {
      extensions.push(Code.configure(this.options.code))
    }

    if (this.options.codeBlock !== false) {
      extensions.push(CodeBlock.configure(this.options.codeBlock))
    }

    if (this.options.document !== false) {
      extensions.push(Document.configure(this.options.document))
    }

    if (this.options.dropcursor !== false) {
      extensions.push(Dropcursor.configure(this.options.dropcursor))
    }

    if (this.options.gapcursor !== false) {
      extensions.push(Gapcursor.configure(this.options.gapcursor))
    }

    if (this.options.hardBreak !== false) {
      extensions.push(HardBreak.configure(this.options.hardBreak))
    }

    if (this.options.heading !== false) {
      extensions.push(Heading.configure(this.options.heading))
    }

    if (this.options.undoRedo !== false) {
      extensions.push(UndoRedo.configure(this.options.undoRedo))
    }

    if (this.options.horizontalRule !== false) {
      extensions.push(HorizontalRule.configure(this.options.horizontalRule))
    }

    if (this.options.italic !== false) {
      extensions.push(Italic.configure(this.options.italic))
    }

    if (this.options.listItem !== false) {
      extensions.push(ListItem.configure(this.options.listItem))
    }

    if (this.options.listKeymap !== false) {
      extensions.push(ListKeymap.configure(this.options?.listKeymap))
    }

    if (this.options.link !== false) {
      extensions.push(Link.configure(this.options?.link))
    }

    if (this.options.orderedList !== false) {
      extensions.push(OrderedList.configure(this.options.orderedList))
    }

    if (this.options.paragraph !== false) {
      extensions.push(Paragraph.configure(this.options.paragraph))
    }

    if (this.options.strike !== false) {
      extensions.push(Strike.configure(this.options.strike))
    }

    if (this.options.text !== false) {
      extensions.push(Text.configure(this.options.text))
    }

    if (this.options.underline !== false) {
      extensions.push(Underline.configure(this.options?.underline))
    }

    if (this.options.trailingNode !== false) {
      extensions.push(TrailingNode.configure(this.options?.trailingNode))
    }

    return extensions
  },
})
