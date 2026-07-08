import type { Editor, EditorEvents } from '@tiptap/core'
import { useEffect, useLayoutEffect, useRef } from 'react'

/** Mirrors core EventEmitter's callback shape (array events spread). */
type EditorEventArgs<EventName extends keyof EditorEvents> =
  EditorEvents[EventName] extends unknown[] ? EditorEvents[EventName] : [EditorEvents[EventName]]

/**
 * Subscribes a handler to an editor event (`'transaction'`, `'update'`,
 * `'selectionUpdate'`, …) for the component's lifetime. The latest handler
 * is always invoked — no stale closures, no re-subscription per render.
 */
export const useEditorEventListener = <EventName extends Extract<keyof EditorEvents, string>>(
  editor: Editor | null,
  event: EventName,
  handler: (...args: EditorEventArgs<EventName>) => void,
): void => {
  const handlerRef = useRef(handler)

  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    // Core's EventEmitter types its callback with its own (unexported)
    // conditional type; ours is structurally identical but TypeScript cannot
    // unify two unresolved conditionals, hence the cast
    const listener = ((...args: EditorEventArgs<EventName>) => {
      handlerRef.current(...args)
    }) as unknown as Parameters<Editor['on']>[1]

    editor.on(event, listener)
    return () => {
      editor.off(event, listener)
    }
  }, [editor, event])
}
