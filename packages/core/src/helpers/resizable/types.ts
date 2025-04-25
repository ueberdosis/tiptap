import type { Node } from '@tiptap/pm/model'

import type { Editor } from '../../Editor.js'

export type ResizableNodeViewDirection = 'top' | 'right' | 'bottom' | 'left'
export type ResizableNodeViewDiagonalDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type ResizableNodeViewDirections = {
  [key in ResizableNodeViewDirection | ResizableNodeViewDiagonalDirection]: boolean
}

/**
 * Options for creating a resizable node view
 */
export interface ResizableNodeViewOptions {
  /**
   * Which resize handles should be enabled
   * @default All directions and corners enabled
   */
  directions?: ResizableNodeViewDirections

  /**
   * The DOM element to make resizable
   */
  dom: HTMLElement

  /**
   * The editor instance
   */
  editor: Editor

  /**
   * Function to get the position of the node
   */
  getPos: () => number | undefined

  /**
   * The node instance
   */
  node: Node

  /**
   * Minimum width in pixels that the node can be resized to
   * @default 20
   */
  minWidth?: number

  /**
   * Minimum height in pixels that the node can be resized to
   * @default 20
   */
  minHeight?: number
}
