/**
 * StarterKit composition for `@tiptap/editor`.
 *
 * Imports each member directly from its leaf module — never from the public
 * root barrel — to preserve tree-shaking. StarterKit includes Document,
 * Paragraph, and Text so it works with `@tiptap/core`'s `getSchema()` and
 * other utilities that don't go through `@tiptap/editor`'s Editor. When
 * paired with `new Editor()` from `@tiptap/editor`, the built-in defaults
 * dedupe with these by name — no duplicate-node errors.
 */

import { Extension } from '@tiptap/core'

import { type CharacterCountOptions, CharacterCount } from '../extensions/character-count.js'
import { type DropcursorOptions, Dropcursor } from '../extensions/dropcursor.js'
import { Gapcursor } from '../extensions/gapcursor.js'
import { type UndoRedoOptions, UndoRedo } from '../extensions/history.js'
import { type ListKeymapOptions, ListKeymap } from '../extensions/list-keymap/index.js'
import { type TrailingNodeOptions, TrailingNode } from '../extensions/trailing-node.js'
import { type BoldOptions, Bold } from '../marks/bold.js'
import { type CodeOptions, Code } from '../marks/code.js'
import { type ItalicOptions, Italic } from '../marks/italic.js'
import { type LinkOptions, Link } from '../marks/link/index.js'
import { type StrikeOptions, Strike } from '../marks/strike.js'
import { type UnderlineOptions, Underline } from '../marks/underline.js'
import { type BlockquoteOptions, Blockquote } from '../nodes/blockquote.js'
import { type BulletListOptions, BulletList } from '../nodes/bullet-list.js'
import { type CodeBlockOptions, CodeBlock } from '../nodes/code-block.js'
import { Document } from '../nodes/document.js'
import { type HardBreakOptions, HardBreak } from '../nodes/hard-break.js'
import { type HeadingOptions, Heading } from '../nodes/heading.js'
import { type HorizontalRuleOptions, HorizontalRule } from '../nodes/horizontal-rule.js'
import { type ListItemOptions, ListItem } from '../nodes/list-item.js'
import { type OrderedListOptions, OrderedList } from '../nodes/ordered-list/index.js'
import { type ParagraphOptions, Paragraph } from '../nodes/paragraph.js'
import { Text } from '../nodes/text.js'

export interface StarterKitOptions {
  /** Pass options to the Blockquote node, or `false` to disable it. */
  blockquote: Partial<BlockquoteOptions> | false
  /** Pass options to the Bold mark, or `false` to disable it. */
  bold: Partial<BoldOptions> | false
  /** Pass options to the BulletList node, or `false` to disable it. */
  bulletList: Partial<BulletListOptions> | false
  /** Pass options to the CharacterCount extension, or `false` to disable it. */
  characterCount: Partial<CharacterCountOptions> | false
  /** Pass options to the Code mark, or `false` to disable it. */
  code: Partial<CodeOptions> | false
  /** Pass options to the CodeBlock node, or `false` to disable it. */
  codeBlock: Partial<CodeBlockOptions> | false
  /** `false` to omit the Document node (e.g. for fully custom schemas). */
  document: false
  /** Pass options to the Dropcursor extension, or `false` to disable it. */
  dropcursor: Partial<DropcursorOptions> | false
  /** `false` to disable the Gapcursor extension. */
  gapcursor: false
  /** Pass options to the HardBreak node, or `false` to disable it. */
  hardBreak: Partial<HardBreakOptions> | false
  /** Pass options to the Heading node, or `false` to disable it. */
  heading: Partial<HeadingOptions> | false
  /** Pass options to the HorizontalRule node, or `false` to disable it. */
  horizontalRule: Partial<HorizontalRuleOptions> | false
  /** Pass options to the Italic mark, or `false` to disable it. */
  italic: Partial<ItalicOptions> | false
  /** Pass options to the Link mark, or `false` to disable it. */
  link: Partial<LinkOptions> | false
  /** Pass options to the ListItem node, or `false` to disable it. */
  listItem: Partial<ListItemOptions> | false
  /** Pass options to the ListKeymap extension, or `false` to disable it. */
  listKeymap: Partial<ListKeymapOptions> | false
  /** Pass options to the OrderedList node, or `false` to disable it. */
  orderedList: Partial<OrderedListOptions> | false
  /** Pass options to the Paragraph node, or `false` to disable it. */
  paragraph: Partial<ParagraphOptions> | false
  /** Pass options to the Strike mark, or `false` to disable it. */
  strike: Partial<StrikeOptions> | false
  /** `false` to omit the Text node (e.g. for fully custom schemas). */
  text: false
  /** Pass options to the TrailingNode extension, or `false` to disable it. */
  trailingNode: Partial<TrailingNodeOptions> | false
  /** Pass options to the Underline mark, or `false` to disable it. */
  underline: Partial<UnderlineOptions> | false
  /** Pass options to the UndoRedo (history) extension, or `false` to disable it. */
  undoRedo: Partial<UndoRedoOptions> | false
}

/**
 * A curated collection of common editing primitives.
 *
 * StarterKit includes Document, Paragraph, and Text so it composes
 * directly with `@tiptap/core` utilities like `getSchema()`. When used
 * with `new Editor()` from `@tiptap/editor`, the Editor's built-in
 * Document/Paragraph/Text defaults are skipped to avoid duplication.
 * Beyond the core nodes, StarterKit covers common block structures
 * (heading, blockquote, code block, lists, hard break, horizontal rule),
 * basic marks (bold, italic, strike, code, link, underline), and editor
 * UX (gap/drop cursors, undo/redo history, list keymap, trailing node,
 * character count).
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
    if (this.options.characterCount !== false) {
      extensions.push(CharacterCount.configure(this.options.characterCount))
    }
    if (this.options.code !== false) {
      extensions.push(Code.configure(this.options.code))
    }
    if (this.options.codeBlock !== false) {
      extensions.push(CodeBlock.configure(this.options.codeBlock))
    }
    if (this.options.document !== false) {
      extensions.push(Document)
    }
    if (this.options.dropcursor !== false) {
      extensions.push(Dropcursor.configure(this.options.dropcursor))
    }
    if (this.options.gapcursor !== false) {
      extensions.push(Gapcursor)
    }
    if (this.options.hardBreak !== false) {
      extensions.push(HardBreak.configure(this.options.hardBreak))
    }
    if (this.options.heading !== false) {
      extensions.push(Heading.configure(this.options.heading))
    }
    if (this.options.horizontalRule !== false) {
      extensions.push(HorizontalRule.configure(this.options.horizontalRule))
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
    if (this.options.listKeymap !== false) {
      extensions.push(ListKeymap.configure(this.options.listKeymap))
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
      extensions.push(Text)
    }
    if (this.options.trailingNode !== false) {
      extensions.push(TrailingNode.configure(this.options.trailingNode))
    }
    if (this.options.underline !== false) {
      extensions.push(Underline.configure(this.options.underline))
    }
    if (this.options.undoRedo !== false) {
      extensions.push(UndoRedo.configure(this.options.undoRedo))
    }

    return extensions
  },
})

export default StarterKit
