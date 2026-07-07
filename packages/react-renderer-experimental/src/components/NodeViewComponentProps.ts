import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ComponentType, ReactNode, Ref } from 'react'

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
  updateAttributes: (attributes: Record<string, unknown>) => void
  deleteNode: () => void
  /** Must be attached to the component's top-level element. */
  ref: Ref<Element>
  /** Must be attached to the element holding `children` (content nodes). */
  contentDOMRef: Ref<HTMLElement>
  /** Rendered content for non-leaf nodes. */
  children?: ReactNode
}

// oxlint-disable-next-line no-explicit-any
export type NodeViewComponent = ComponentType<NodeViewComponentProps<any>>
