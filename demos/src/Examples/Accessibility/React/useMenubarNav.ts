import type { Editor } from '@dibdab/core'
import type React from 'react'
import { useCallback, useEffect, useRef } from 'react'

/**
 * Handle arrow navigation within a menu bar container, and allow to escape to the editor
 */
export function useMenubarNav({
  ref: containerRef,
  editor,
  onEscape = (e, ctx) => {
    e.preventDefault()
    ctx.editor.commands.focus()
  },
  onKeydown = () => {
    // Do nothing
  },
}: {
  /**
   * Ref to the menu bar container
   */
  ref: React.RefObject<HTMLElement>
  /**
   * The editor instance
   */
  editor: Editor
  /**
   * Callback when the user presses the escape key
   */
  onEscape?: (event: KeyboardEvent, ctx: { editor: Editor; ref: React.RefObject<HTMLElement> }) => void
  /**
   * Callback when a keyboard event occurs
   * @note Call `event.preventDefault()` to prevent the default behavior
   */
  onKeydown?: (event: KeyboardEvent, ctx: { editor: Editor; ref: React.RefObject<HTMLElement> }) => void
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

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) {
      return []
    }

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('button, [role="button"], [tabindex="0"]'),
    ).filter(el => !el.hasAttribute('disabled'))
  }, [containerRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) {
        return
      }

      callbacks.current.onKeydown(event, { editor, ref: containerRef })
      if (event.defaultPrevented) {
        return
      }

      const elements = getFocusableElements()
      const isWithinContainer = containerRef.current.contains(event.target as HTMLElement)

      if (isWithinContainer) {
        // Allow to escape to the editor
        if (event.key === 'Escape') {
          callbacks.current.onEscape(event, { editor, ref: containerRef })
          if (event.defaultPrevented) {
            return true
          }
        }

        // Move to the first element in the menu bar
        if (event.key === 'Home') {
          event.preventDefault()
          elements[0].focus()
          return true
        }

        // Move to the last element in the menu bar
        if (event.key === 'End') {
          event.preventDefault()
          elements[elements.length - 1].focus()
          return true
        }

        // Move forward in the menu bar
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          const element = elements.indexOf(event.target as HTMLElement)

          elements[(element + 1) % elements.length].focus()
          event.preventDefault()
        }

        // Move backward in the menu bar
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          const element = elements.indexOf(event.target as HTMLElement)

          elements[(element - 1 + elements.length) % elements.length].focus()
          event.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, editor, getFocusableElements])

  return { getFocusableElements }
}
