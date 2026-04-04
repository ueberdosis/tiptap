import type { Editor } from '@tiptap/core'
import { Extension, isNodeEmpty } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * The default data attribute label
 */
const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/**
 * Prepares the placeholder attribute by ensuring it is properly formatted.
 * @param attr - The placeholder attribute string.
 * @returns The prepared placeholder attribute string.
 */
export function preparePlaceholderAttribute(attr: string): string {
  return (
    attr
      // replace whitespace with dashes
      .replace(/\s+/g, '-')
      // replace non-alphanumeric  characters
      // or special chars like $, %, &, etc.
      // but not dashes
      .replace(/[^a-zA-Z0-9-]/g, '')
      // and replace any numeric character at the start
      .replace(/^[0-9-]+/, '')
      // and finally replace any stray, leading dashes
      .replace(/^-+/, '')
      .toLowerCase()
  )
}

export interface PlaceholderOptions {
  /**
   * **The class name for the empty editor**
   * @default 'is-editor-empty'
   */
  emptyEditorClass: string

  /**
   * **The class name for empty nodes**
   * @default 'is-empty'
   */
  emptyNodeClass: string

  /**
   * **The data-attribute used for the placeholder label**
   * Will be prepended with `data-` and converted to kebab-case and cleaned of special characters.
   * @default 'placeholder'
   */
  dataAttribute: string

  /**
   * **The placeholder content**
   *
   * You can use a function to return a dynamic placeholder or a string.
   * @default 'Write something …'
   */
  placeholder:
    | ((props: { editor: Editor; node: ProseMirrorNode; pos: number; hasAnchor: boolean }) => string)
    | string

  /**
   * **Checks if the placeholder should be only shown when the editor is editable.**
   *
   * If true, the placeholder will only be shown when the editor is editable.
   * If false, the placeholder will always be shown.
   * @default true
   */
  showOnlyWhenEditable: boolean

  /**
   * **Checks if the placeholder should be only shown when the current node is empty.**
   *
   * If true, the placeholder will only be shown when the current node is empty.
   * If false, the placeholder will be shown when any node is empty.
   * @default true
   */
  showOnlyCurrent: boolean

  /**
   * **Controls if the placeholder should be shown for all descendents.**
   *
   * If true, the placeholder will be shown for all descendents.
   * If false, the placeholder will only be shown for the current node.
   * @default false
   */
  includeChildren: boolean
}

function nodeContainsAnchor(anchor: number, pos: number, node: ProseMirrorNode): boolean {
  return anchor >= pos && anchor <= pos + node.nodeSize
}

function createPlaceholderDecoration(
  editor: Editor,
  options: Pick<PlaceholderOptions, 'emptyEditorClass' | 'emptyNodeClass' | 'placeholder'>,
  node: ProseMirrorNode,
  pos: number,
  hasAnchor: boolean,
  dataAttributeKey: string,
): Decoration {
  const classes = [options.emptyNodeClass]
  const isEmptyDoc = editor.isEmpty

  if (isEmptyDoc) {
    classes.push(options.emptyEditorClass)
  }

  return Decoration.node(pos, pos + node.nodeSize, {
    class: classes.join(' '),
    [dataAttributeKey]:
      typeof options.placeholder === 'function'
        ? options.placeholder({
            editor,
            node,
            pos,
            hasAnchor,
          })
        : options.placeholder,
  })
}

/** Full-document scan — only used when `showOnlyCurrent` is false (decorate every empty textblock). */
function collectPlaceholdersFullScan(
  doc: ProseMirrorNode,
  anchor: number,
  editor: Editor,
  options: PlaceholderOptions,
  dataAttributeKey: string,
): Decoration[] {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    const hasAnchor = nodeContainsAnchor(anchor, pos, node)
    const isEmpty = !node.isLeaf && isNodeEmpty(node)

    if (!node.type.isTextblock) {
      return options.includeChildren
    }

    if (!isEmpty) {
      return options.includeChildren
    }

    decorations.push(
      createPlaceholderDecoration(editor, options, node, pos, hasAnchor, dataAttributeKey),
    )

    return options.includeChildren
  })

  return decorations
}

/**
 * When `showOnlyCurrent` is true: same decorations as a full scan would produce,
 * without walking the whole document.
 */
function collectPlaceholdersShowOnlyCurrent(
  doc: ProseMirrorNode,
  anchor: number,
  editor: Editor,
  options: PlaceholderOptions,
  dataAttributeKey: string,
): Decoration[] {
  const $anchor = doc.resolve(anchor)

  if ($anchor.depth < 1) {
    return []
  }

  const decorations: Decoration[] = []
  const maxDepth = options.includeChildren ? $anchor.depth : 1

  for (let d = 1; d <= maxDepth; d += 1) {
    const node = $anchor.node(d)
    const pos = $anchor.before(d)

    if (!node.type.isTextblock) {
      continue
    }

    const hasAnchor = nodeContainsAnchor(anchor, pos, node)
    const isEmpty = !node.isLeaf && isNodeEmpty(node)

    if (hasAnchor && isEmpty) {
      decorations.push(
        createPlaceholderDecoration(editor, options, node, pos, hasAnchor, dataAttributeKey),
      )
    }
  }

  return decorations
}

/**
 * This extension allows you to add a placeholder to your editor.
 * A placeholder is a text that appears when the editor or a node is empty.
 * @see https://www.tiptap.dev/api/extensions/placeholder
 */
export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      dataAttribute: DEFAULT_DATA_ATTRIBUTE,
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addProseMirrorPlugins() {
    const dataAttribute = this.options.dataAttribute
      ? `data-${preparePlaceholderAttribute(this.options.dataAttribute)}`
      : `data-${DEFAULT_DATA_ATTRIBUTE}`

    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable
            const { anchor } = selection

            if (!active) {
              return null
            }

            const opts = this.options
            const decorations = opts.showOnlyCurrent
              ? collectPlaceholdersShowOnlyCurrent(doc, anchor, this.editor, opts, dataAttribute)
              : collectPlaceholdersFullScan(doc, anchor, this.editor, opts, dataAttribute)

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
