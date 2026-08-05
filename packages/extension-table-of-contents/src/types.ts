import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'

/**
 * Decides the nesting level of a heading, given the headings before it.
 */
export type GetTableOfContentLevelFunction = (
  headline: { node: Node; pos: number },
  previousItems: TableOfContentDataItem[],
) => number

/**
 * Decides the number shown next to a heading, given the headings before it.
 */
export type GetTableOfContentIndexFunction = (
  headline: { node: Node; pos: number },
  previousItems: TableOfContentDataItem[],
  currentLevel?: number,
) => number

/**
 * Options for the `TableOfContents` extension.
 */
export type TableOfContentsOptions = {
  /**
   * Builds the anchor id for a heading. Defaults to a UUID.
   */
  getId?: (textContent: string) => string

  /**
   * Runs whenever the table of contents changes. This is where you render it.
   */
  onUpdate?: (data: TableOfContentData, isCreate?: boolean) => void

  /**
   * Decides the nesting level of a heading.
   */
  getLevel?: GetTableOfContentLevelFunction

  /**
   * Decides the number shown next to a heading.
   */
  getIndex?: GetTableOfContentIndexFunction

  /**
   * The element that scrolls, used to work out which heading is in view.
   * @default window
   */
  scrollParent?: (() => HTMLElement | Window) | HTMLElement | Window

  /**
   * The node types to collect.
   * @default ['heading']
   */
  anchorTypes?: Array<string>
}

/**
 * What the extension keeps on `editor.storage.tableOfContents`.
 */
export type TableOfContentsStorage = {
  /**
   * The current table of contents.
   */
  content: TableOfContentData

  /**
   * The heading elements in the document.
   */
  anchors: Array<HTMLHeadingElement | HTMLElement>

  /**
   * The listener that tracks which heading is in view.
   */
  scrollHandler: () => void

  /**
   * How far the scroll parent is scrolled.
   */
  scrollPosition: number
}

/**
 * The whole table of contents, in document order.
 */
export type TableOfContentData = Array<TableOfContentDataItem>

/**
 * One heading in the table of contents.
 */
export type TableOfContentDataItem = {
  /**
   * The heading element in the page.
   */
  dom: HTMLHeadingElement

  editor: Editor

  /**
   * The anchor id, for linking to this heading.
   */
  id: string

  /**
   * Whether this is the heading the reader is on.
   */
  isActive: boolean

  /**
   * Whether the reader has already scrolled past this heading.
   */
  isScrolledOver: boolean

  /**
   * The number shown next to the heading, from `getIndex`.
   */
  itemIndex: number

  /**
   * The nesting level, from `getLevel`.
   */
  level: number

  node: Node

  /**
   * The heading level in the document, before `getLevel` changed it.
   */
  originalLevel: number

  /**
   * The position of the heading in the document.
   */
  pos: number

  /**
   * The heading text.
   */
  textContent: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      /**
       * Rebuild the table of contents from the current document.
       * @example editor.commands.updateTableOfContents()
       */
      updateTableOfContents: () => ReturnType
    }
  }

  interface Storage {
    tableOfContents: TableOfContentsStorage
  }
}
