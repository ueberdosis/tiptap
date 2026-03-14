import type { Editor } from '../Editor.js'

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
  handler: () => void
}

const positionUpdateRegistries = new WeakMap<Editor, PositionUpdateRegistry>()

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
      handler: () => {
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
