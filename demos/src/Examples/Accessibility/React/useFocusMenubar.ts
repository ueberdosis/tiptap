import { Editor } from '@tiptap/core'
import React, { useCallback, useEffect, useRef } from 'react'

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

  const focusNextButton = useCallback(
    (el = document.activeElement) => {
      if (!containerRef.current) {
        return null
      }

      const elements = Array.from(containerRef.current.querySelectorAll('button'))
      const index = elements.findIndex(element => element === el)

      // Find the next enabled button
      for (let i = index + 1; i <= elements.length; i += 1) {
        if (!elements[i % elements.length].disabled) {
          elements[i % elements.length].focus()
          return elements[i % elements.length]
        }
      }
      return null
    },
    [containerRef],
  )

  const focusPreviousButton = useCallback(
    (el = document.activeElement) => {
      if (!containerRef.current) {
        return null
      }

      const elements = Array.from(containerRef.current.querySelectorAll('button'))
      const index = elements.findIndex(element => element === el)

      // Find the previous enabled button
      for (let i = index - 1; i >= -1; i -= 1) {
        // If we reach the beginning, start from the end
        if (i < 0) {
          i = elements.length - 1
        }
        if (!elements[i].disabled) {
          elements[i].focus()
          return elements[i]
        }
      }
      return null
    },
    [containerRef],
  )

  const focusButton = useCallback(
    (
      el: HTMLButtonElement | null | undefined,
      direction: 'forwards' | 'backwards' = 'forwards',
    ) => {
      if (!el) {
        return
      }
      if (!el.disabled) {
        el.focus()
        return
      }
      if (direction === 'forwards') {
        focusNextButton(el)
      }
      if (direction === 'backwards') {
        focusPreviousButton(el)
      }
    },
    [focusNextButton, focusPreviousButton],
  )

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

      if (isFocusedOnButton || event.target === containerRef.current) {
        // Allow to escape to the editor
        if (event.key === 'Escape') {
          event.preventDefault()
          callbacks.current.onEscape(editor)
          return true
        }
        // Handle arrow navigation within the menu bar
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          if (focusNextButton(event.target as HTMLButtonElement)) {
            event.preventDefault()
            return true
          }
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          if (focusPreviousButton(event.target as HTMLButtonElement)) {
            event.preventDefault()
            return true
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, editor, focusNextButton, focusPreviousButton])

  return { focusNextButton, focusPreviousButton, focusButton }
}
