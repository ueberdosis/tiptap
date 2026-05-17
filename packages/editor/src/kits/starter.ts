/**
 * StarterKit composition for `@tiptap/editor`.
 *
 * Imports each member directly from its leaf module — never from the public
 * root barrel — to preserve tree-shaking. Document, Paragraph, and Text are
 * intentionally omitted: they are built-in defaults on the `@tiptap/editor`
 * Editor and would be duplicated if included here.
 */

import { Extension } from '@tiptap/core'

import { type DropcursorOptions, Dropcursor } from '../extensions/dropcursor.js'
import { Gapcursor } from '../extensions/gapcursor.js'
import { type UndoRedoOptions, UndoRedo } from '../extensions/history.js'
import { type BoldOptions, Bold } from '../marks/bold.js'
import { type CodeOptions, Code } from '../marks/code.js'
import { type ItalicOptions, Italic } from '../marks/italic.js'
import { type LinkOptions, Link } from '../marks/link.js'
import { type StrikeOptions, Strike } from '../marks/strike.js'
import { type BlockquoteOptions, Blockquote } from '../nodes/blockquote.js'
import { type BulletListOptions, BulletList } from '../nodes/bullet-list.js'
import { type CodeBlockOptions, CodeBlock } from '../nodes/code-block.js'
import { type HeadingOptions, Heading } from '../nodes/heading.js'
import { type ListItemOptions, ListItem } from '../nodes/list-item.js'
import { type OrderedListOptions, OrderedList } from '../nodes/ordered-list.js'

export interface StarterKitOptions {
  /** Pass options to the Blockquote node, or `false` to disable it. */
  blockquote: Partial<BlockquoteOptions> | false
  /** Pass options to the Bold mark, or `false` to disable it. */
  bold: Partial<BoldOptions> | false
  /** Pass options to the BulletList node, or `false` to disable it. */
  bulletList: Partial<BulletListOptions> | false
  /** Pass options to the Code mark, or `false` to disable it. */
  code: Partial<CodeOptions> | false
  /** Pass options to the CodeBlock node, or `false` to disable it. */
  codeBlock: Partial<CodeBlockOptions> | false
  /** Pass options to the Dropcursor extension, or `false` to disable it. */
  dropcursor: Partial<DropcursorOptions> | false
  /** `false` to disable the Gapcursor extension. */
  gapcursor: false
  /** Pass options to the Heading node, or `false` to disable it. */
  heading: Partial<HeadingOptions> | false
  /** Pass options to the Italic mark, or `false` to disable it. */
  italic: Partial<ItalicOptions> | false
  /** Pass options to the Link mark, or `false` to disable it. */
  link: Partial<LinkOptions> | false
  /** Pass options to the ListItem node, or `false` to disable it. */
  listItem: Partial<ListItemOptions> | false
  /** Pass options to the OrderedList node, or `false` to disable it. */
  orderedList: Partial<OrderedListOptions> | false
  /** Pass options to the Strike mark, or `false` to disable it. */
  strike: Partial<StrikeOptions> | false
  /** Pass options to the UndoRedo (history) extension, or `false` to disable it. */
  undoRedo: Partial<UndoRedoOptions> | false
}

/**
 * A curated collection of common editing primitives.
 *
 * StarterKit does NOT include Document, Paragraph, or Text — those are
 * built-in defaults on the `@tiptap/editor` Editor. StarterKit covers the
 * next layer of common functionality: structured blocks (heading,
 * blockquote, code block, lists), basic marks (bold, italic, strike, code,
 * link), and editor UX (gap/drop cursors, undo/redo history).
 *
 * @example
 * ```ts
 * import { Editor } from '@tiptap/editor'
 * import { StarterKit } from '@tiptap/editor/kits/starter'
 *
 * const editor = new Editor({
 *   extensions: [StarterKit],
 *   content: '<h1>Hello</h1><p>World</p>',
 * })
 * ```
 *
 * @example Disabling a member
 * ```ts
 * StarterKit.configure({ heading: false, link: { openOnClick: false } })
 * ```
 */
export const StarterKit = Extension.create<StarterKitOptions>({
  name: 'starterKit',

  addExtensions() {
    const extensions = []

    if (this.options.blockquote !== false) {
      extensions.push(Blockquote.configure(this.options.blockquote))
    }
    if (this.options.bold !== false) {
      extensions.push(Bold.configure(this.options.bold))
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
    if (this.options.dropcursor !== false) {
      extensions.push(Dropcursor.configure(this.options.dropcursor))
    }
    if (this.options.gapcursor !== false) {
      extensions.push(Gapcursor)
    }
    if (this.options.heading !== false) {
      extensions.push(Heading.configure(this.options.heading))
    }
    if (this.options.italic !== false) {
      extensions.push(Italic.configure(this.options.italic))
    }
    if (this.options.link !== false) {
      extensions.push(Link.configure(this.options.link))
    }
    if (this.options.listItem !== false) {
      extensions.push(ListItem.configure(this.options.listItem))
    }
    if (this.options.orderedList !== false) {
      extensions.push(OrderedList.configure(this.options.orderedList))
    }
    if (this.options.strike !== false) {
      extensions.push(Strike.configure(this.options.strike))
    }
    if (this.options.undoRedo !== false) {
      extensions.push(UndoRedo.configure(this.options.undoRedo))
    }

    return extensions
  },
})
