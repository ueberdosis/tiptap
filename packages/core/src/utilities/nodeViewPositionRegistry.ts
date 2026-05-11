import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import { ReplaceStep } from '@tiptap/pm/transform'

import type { Editor } from '../Editor.js'
import type { EditorEvents } from '../types.js'

/**
 * Per-editor registry for centralized NodeView position-change checks.
 * A single editor.on('update') listener + rAF is shared across all NodeViews
 * for a given editor, keeping overhead bounded regardless of NodeView count.
 *
 * This is consumed by React, Vue 3, and Vue 2 NodeView renderers.
 */
interface PositionUpdateRegistry {
  callbacks: Set<() => void>
  rafId: number | null
  handler: (props: EditorEvents['update']) => void
}

const positionUpdateRegistries = new WeakMap<Editor, PositionUpdateRegistry>()

function getDocBeforeStep(transaction: Transaction, stepIndex: number): ProseMirrorNode {
  return (transaction as Transaction & { docs?: ProseMirrorNode[] }).docs?.[stepIndex] ?? transaction.before
}

function containsOnlyText(fragment: Fragment): boolean {
  let onlyText = true

  fragment.forEach(node => {
    if (!node.isText) {
      onlyText = false
    }
  })

  return onlyText
}

function isTextblockTextChange(transaction: Transaction, stepIndex: number): boolean {
  const step = transaction.steps[stepIndex]

  if (!(step instanceof ReplaceStep)) {
    return false
  }

  const doc = getDocBeforeStep(transaction, stepIndex)
  const { from, to, slice } = step
  const $from = doc.resolve(from)
  const $to = doc.resolve(to)

  if ($from.parent !== $to.parent || !$from.parent.isTextblock) {
    return false
  }

  return containsOnlyText(slice.content) && containsOnlyText(doc.slice(from, to).content)
}

function shouldCheckPositions(transaction: Transaction, appendedTransactions: Transaction[]): boolean {
  return [transaction, ...appendedTransactions].some(currentTransaction => {
    return currentTransaction.steps.some((_, index) => !isTextblockTextChange(currentTransaction, index))
  })
}

/**
 * Register a callback to be called (via a shared rAF) after every editor
 * update transaction. If this is the first registration for the given editor,
 * a new registry entry and a single `editor.on('update')` listener are created.
 */
export function schedulePositionCheck(editor: Editor, callback: () => void): void {
  let registry = positionUpdateRegistries.get(editor)

  if (!registry) {
    const newRegistry: PositionUpdateRegistry = {
      callbacks: new Set(),
      rafId: null,
      handler: ({ transaction, appendedTransactions }) => {
        if (!shouldCheckPositions(transaction, appendedTransactions)) {
          return
        }

        if (newRegistry.rafId !== null) {
          cancelAnimationFrame(newRegistry.rafId)
        }
        newRegistry.rafId = requestAnimationFrame(() => {
          newRegistry.rafId = null
          newRegistry.callbacks.forEach(cb => cb())
        })
      },
    }

    positionUpdateRegistries.set(editor, newRegistry)
    editor.on('update', newRegistry.handler)
    registry = newRegistry
  }

  registry.callbacks.add(callback)
}

/**
 * Unregister a previously registered callback. When the last callback for an
 * editor is removed, the shared listener and any pending rAF are also cleaned up.
 */
export function cancelPositionCheck(editor: Editor, callback: () => void): void {
  const registry = positionUpdateRegistries.get(editor)

  if (!registry) {
    return
  }

  registry.callbacks.delete(callback)

  if (registry.callbacks.size === 0) {
    if (registry.rafId !== null) {
      cancelAnimationFrame(registry.rafId)
    }

    editor.off('update', registry.handler)
    positionUpdateRegistries.delete(editor)
  }
}
