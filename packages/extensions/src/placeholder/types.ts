import type { Editor } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'

/**
 * The viewport positions tracked by the placeholder plugin.
 * `null` means "no viewport info yet" — the decoration callback falls back to
 * a full document scan until the scroll handler fires.
 */
export interface ViewportState {
  topPos: number | null
  bottomPos: number | null
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
    | ((PlaceholderProps: {
        editor: Editor
        node: ProsemirrorNode
        pos: number
        hasAnchor: boolean
      }) => string)
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
   * **Controls if the placeholder should be shown for all descendants.**
   *
   * If true, the placeholder will be shown for all descendants.
   * If false, the placeholder will only be shown for the current node.
   * @default false
   */
  includeChildren: boolean
}
