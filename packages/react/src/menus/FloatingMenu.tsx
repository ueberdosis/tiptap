import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { useCurrentEditor } from '@tiptap/react'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element' | 'editor'> & {
  editor: FloatingMenuPluginProps['editor'] | null
  options?: FloatingMenuPluginProps['options']
} & React.HTMLAttributes<HTMLDivElement>

export const FloatingMenu = React.forwardRef<HTMLDivElement, FloatingMenuProps>(
  ({ pluginKey = 'floatingMenu', editor, shouldShow = null, options, children, ...restProps }, ref) => {
    const menuEl = useRef(document.createElement('div'))

    const { editor: currentEditor } = useCurrentEditor()

    useEffect(() => {
      const floatingMenuElement = menuEl.current

      // Apply user-provided styles, merging with required positioning styles
      const { style, className, ...otherAttrs } = restProps

      const effectiveZIndex = style?.zIndex || '99999'

      Object.assign(
        floatingMenuElement.style,
        {
          visibility: 'hidden',
          position: 'absolute',
          zIndex: effectiveZIndex,
          pointerEvents: 'auto',
          maxWidth: 'calc(100vw - 20px)',
          wordWrap: 'break-word',
          isolation: 'isolate',
        },
        style || {},
      )

      // Apply className
      if (className) {
        floatingMenuElement.className = className
      }

      // Apply other HTML attributes like data-*, aria-*, etc.
      Object.entries(otherAttrs).forEach(([key, value]) => {
        if (value !== undefined) {
          floatingMenuElement.setAttribute(key, String(value))
        }
      })

      // Handle ref forwarding
      if (typeof ref === 'function') {
        ref(floatingMenuElement)
      } else if (ref) {
        ref.current = floatingMenuElement
      }

      if (editor?.isDestroyed || (currentEditor as any)?.isDestroyed) {
        return
      }

      const attachToEditor = editor || currentEditor

      if (!attachToEditor) {
        console.warn(
          'FloatingMenu component is not rendered inside of an editor component or does not have editor prop.',
        )
        return
      }

      const plugin = FloatingMenuPlugin({
        editor: attachToEditor,
        element: floatingMenuElement,
        pluginKey,
        shouldShow,
        options: {
          // Default options to prevent overlaps and improve positioning
          strategy: 'fixed', // Use fixed positioning for better viewport handling
          placement: 'left',
          offset: 8,
          flip: {
            fallbackPlacements: ['right', 'left-start', 'left-end', 'right-start', 'right-end'],
          },
          shift: {
            padding: 10, // Keep menu away from viewport edges
            crossAxis: true, // Allow shifting on cross-axis to avoid collisions
          },
          size: {
            apply({ availableWidth, availableHeight, elements }) {
              // Dynamically adjust size to fit within available space
              Object.assign(elements.floating.style, {
                maxWidth: `${Math.max(200, availableWidth - 20)}px`,
                maxHeight: `${Math.max(100, availableHeight - 20)}px`,
                overflow: 'auto',
              })
            },
          },
          hide: {
            strategy: 'escaped', // Hide when menu would be completely outside viewport
          },
          // Merge with user-provided options
          ...options,
        },
      })

      attachToEditor.registerPlugin(plugin)

      return () => {
        attachToEditor.unregisterPlugin(pluginKey)
        window.requestAnimationFrame(() => {
          if (floatingMenuElement.parentNode) {
            floatingMenuElement.parentNode.removeChild(floatingMenuElement)
          }
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, currentEditor, restProps, ref])

    return createPortal(<div>{children}</div>, menuEl.current)
  },
)
