import type { ViewMutationRecord } from '@tiptap/pm/view'
import { useLayoutEffect, useRef } from 'react'

import type { NodeViewHandlers } from '../contexts/NodeViewContext.js'
import { useNodeViewContext } from '../contexts/NodeViewContext.js'

/**
 * The node's current position, resolved from the live desc tree. Returns a
 * stable getter: positions move with every transaction, so reading during
 * render would go stale — resolve inside event handlers and effects instead.
 */
export const useNodePos = (): (() => number | undefined) => useNodeViewContext().getPos

/** Whether the surrounding node view is node-selected. */
export const useIsNodeSelected = (): boolean => useNodeViewContext().selected

/**
 * Registers the latest callback under the given handler slot. The slot lives
 * on the context's stable handlers ref, which the node's desc dereferences
 * at event time — so registration works regardless of effect order.
 */
const useNodeViewHandler = <Slot extends keyof NodeViewHandlers>(
  slot: Slot,
  handler: NonNullable<NodeViewHandlers[Slot]>,
): void => {
  const { handlersRef } = useNodeViewContext()
  const handlerRef = useRef(handler)

  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useLayoutEffect(() => {
    handlersRef.current[slot] = ((...args: unknown[]) =>
      (handlerRef.current as (...inner: unknown[]) => unknown)(...args)) as NodeViewHandlers[Slot]

    return () => {
      handlersRef.current[slot] = undefined
    }
  }, [handlersRef, slot])
}

/**
 * Lets the node view claim events targeting it, so ProseMirror's input
 * handling ignores them (the React equivalent of `NodeView.stopEvent`).
 * Return true to stop ProseMirror from handling the event.
 */
export const useStopEvent = (handler: (event: Event) => boolean): void => {
  useNodeViewHandler('stopEvent', handler)
}

/**
 * Lets the node view decide which DOM mutations ProseMirror should ignore
 * (the React equivalent of `NodeView.ignoreMutation`). With the mutation
 * observer disabled this only affects selection-change records today, but
 * the contract matches the imperative API.
 */
export const useIgnoreMutation = (handler: (mutation: ViewMutationRecord) => boolean): void => {
  useNodeViewHandler('ignoreMutation', handler)
}
