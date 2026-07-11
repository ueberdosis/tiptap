import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { ComponentType, ReactNode, RefCallback } from 'react'

/**
 * The props a React node view component receives. Aligned with Tiptap's
 * legacy `ReactNodeViewProps`, minus the wrapper: the component renders its
 * own top-level element and must attach `ref` to it. Content-bearing nodes
 * additionally render `children` and attach `contentDOMRef` to the element
 * holding them (use `useMergedRefs` when both target the same element).
 */
export interface NodeViewComponentProps<Element extends HTMLElement = HTMLElement> {
  editor: Editor
  node: ProseMirrorNode
  /** HTML attributes computed from the extension's attribute config. */
  HTMLAttributes: Record<string, unknown>
  /** The node's current position, resolved from the live desc tree. */
  getPos: () => number | undefined
  /** Whether the node is node-selected. */
  selected: boolean
  /** The decorations rendered onto the node itself. */
  decorations: readonly Decoration[]
  /** The decorations for the node's content. */
  innerDecorations: DecorationSource
  updateAttributes: (attributes: Record<string, unknown>) => void
  deleteNode: () => void
  /** Must be attached to the component's top-level element. */
  ref: RefCallback<Element>
  /** Must be attached to the element holding `children` (content nodes). */
  contentDOMRef: RefCallback<HTMLElement>
  /** Rendered content for non-leaf nodes. */
  children?: ReactNode
}

// oxlint-disable-next-line no-explicit-any
export type NodeViewComponent = ComponentType<NodeViewComponentProps<any>>
