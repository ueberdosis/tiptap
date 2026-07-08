import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ViewMutationRecord } from '@tiptap/pm/view'
import type { RefObject } from 'react'
import { createContext, useContext } from 'react'

import type { NodeViewDesc } from '../viewdesc.js'

/**
 * Handlers a node view component registers through `useStopEvent` /
 * `useIgnoreMutation`. They live on a stable ref (not on the desc directly)
 * because the component's effects run before the parent `ReactNodeView`
 * effect that creates the desc — the desc dereferences the ref at event
 * time instead.
 */
export interface NodeViewHandlers {
  stopEvent?: (event: Event) => boolean
  ignoreMutation?: (mutation: ViewMutationRecord) => boolean
}

export interface NodeViewContextValue {
  /** The node this view renders (current for this commit). */
  node: ProseMirrorNode
  /** Resolves the node's current position from the live desc tree. */
  getPos: () => number | undefined
  /** Whether the node is node-selected. */
  selected: boolean
  /** The node's desc; current after each commit. */
  descRef: RefObject<NodeViewDesc | undefined>
  /** The registration target for `useStopEvent` / `useIgnoreMutation`. */
  handlersRef: RefObject<NodeViewHandlers>
}

/**
 * Provided by `ReactNodeView` around each user node view component, so
 * node-view hooks work anywhere inside the component tree.
 */
export const NodeViewContext = createContext<NodeViewContextValue | null>(null)

/** The surrounding node view's context; throws outside a node view. */
export const useNodeViewContext = (): NodeViewContextValue => {
  const value = useContext(NodeViewContext)

  if (!value) {
    throw new RangeError(
      '[tiptap error]: This hook can only be used inside a React node view component',
    )
  }
  return value
}
