import { Editor } from '@tiptap/core'
import React, { useEffect, useRef } from 'react'

/**
 * Handle arrow navigation within a menu bar container, and allow to escape to the editor
 */
export function useFocusMenubar({
  ref: containerRef,
  editor,
  onEscape = e => {
    e.commands.focus()
  },
  onKeydown = () => {
    // Do nothing
  },
}: {
  /**
   * Ref to the menu bar container
   */
  ref: React.RefObject<HTMLElement>;
  /**
   * The editor instance
   */
  editor: Editor;
  /**
   * Callback when the user presses the escape key
   */
  onEscape?: (editor: Editor) => void;
  /**
   * Callback when a keyboard event occurs
   * @note Call `event.preventDefault()` to prevent the default behavior
   */
  onKeydown?: (
    event: KeyboardEvent,
    ctx: { editor: Editor; ref: React.RefObject<HTMLElement> }
  ) => void;
}) {
  const callbacks = useRef({
    onEscape,
    onKeydown,
  })

  // Always take the latest callback
  callbacks.current = {
    onEscape,
    onKeydown,
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) {
        return
      }

      callbacks.current.onKeydown(event, { editor, ref: containerRef })
      if (event.defaultPrevented) {
        return
      }

      const elements = Array.from(containerRef.current.querySelectorAll('button'))
      const isFocusedOnButton = elements.includes(event.target as HTMLButtonElement)

      // Allow to escape to the editor
      if (isFocusedOnButton || event.target === containerRef.current) {
        if (event.key === 'Escape') {
          event.preventDefault()
          callbacks.current.onEscape(editor)
          return
        }
      }

      if (isFocusedOnButton) {
        // Handle arrow navigation within the menu bar
        if (event.key === 'ArrowRight') {
          const index = elements.indexOf(event.target as HTMLButtonElement)

          // Find the next enabled button
          for (let i = index + 1; i <= elements.length; i += 1) {
            if (!elements[i % elements.length].disabled) {
              event.preventDefault()
              elements[i % elements.length].focus()
              return
            }
          }
        }

        if (event.key === 'ArrowLeft') {
          const index = elements.indexOf(event.target as HTMLButtonElement)

          // Find the previous enabled button
          for (let i = index - 1; i >= -1; i -= 1) {
            // If we reach the beginning, start from the end
            if (i < 0) {
              i = elements.length - 1
            }
            if (!elements[i].disabled) {
              event.preventDefault()
              elements[i].focus()
              return
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, editor])
}
