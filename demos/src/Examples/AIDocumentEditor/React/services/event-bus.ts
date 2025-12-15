import type { EditorEvent, EditorEventType } from '../types/index.ts'

type EventHandler<T = unknown> = (payload: T) => void

class EditorEventBus {
  private listeners: Map<EditorEventType, Set<EventHandler>> = new Map()

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: EditorEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler as EventHandler)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = unknown>(event: EditorEventType, payload: T): void {
    // Emit to local listeners
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }

    // Also emit as a custom DOM event for cross-component communication
    window.dispatchEvent(
      new CustomEvent(`scyai:editor:${event}`, {
        detail: payload,
        bubbles: true,
      }),
    )
  }

  /**
   * Listen to events from the Canvas/ScyAI
   */
  onCanvasEvent<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (e: Event) => {
      handler((e as CustomEvent).detail)
    }
    window.addEventListener(`scyai:canvas:${event}`, wrappedHandler)
    return () => {
      window.removeEventListener(`scyai:canvas:${event}`, wrappedHandler)
    }
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear()
  }
}

// Singleton instance
export const eventBus = new EditorEventBus()

// React hook for using the event bus
export function useEventBus() {
  return eventBus
}
