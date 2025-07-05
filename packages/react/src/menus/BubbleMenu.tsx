import { type BubbleMenuPluginProps, BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { useCurrentEditor } from '@tiptap/react'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Optional<Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element'>, 'editor'> &
  React.HTMLAttributes<HTMLDivElement>

export const BubbleMenu = React.forwardRef<HTMLDivElement, BubbleMenuProps>(
  (
    { pluginKey = 'bubbleMenu', editor, updateDelay, resizeDelay, shouldShow = null, options, children, ...restProps },
    ref,
  ) => {
    const menuEl = useRef(document.createElement('div'))

    const { editor: currentEditor } = useCurrentEditor()

    useEffect(() => {
      const bubbleMenuElement = menuEl.current

      // Apply user-provided styles, merging with required positioning styles
      const { style, className, ...otherAttrs } = restProps

      // Apply required positioning styles and merge user styles
      Object.assign(
        bubbleMenuElement.style,
        {
          visibility: 'hidden',
          position: 'absolute',
        },
        style || {},
      )

      // Apply className
      if (className) {
        bubbleMenuElement.className = className
      }

      // Apply other HTML attributes like data-*, aria-*, etc.
      Object.entries(otherAttrs).forEach(([key, value]) => {
        if (value !== undefined) {
          bubbleMenuElement.setAttribute(key, String(value))
        }
      })

      // Handle ref forwarding
      if (typeof ref === 'function') {
        ref(bubbleMenuElement)
      } else if (ref) {
        ref.current = bubbleMenuElement
      }

      if (editor?.isDestroyed || (currentEditor as any)?.isDestroyed) {
        return
      }

      const attachToEditor = editor || currentEditor

      if (!attachToEditor) {
        console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.')
        return
      }

      const plugin = BubbleMenuPlugin({
        updateDelay,
        resizeDelay,
        editor: attachToEditor,
        element: bubbleMenuElement,
        pluginKey,
        shouldShow,
        options,
      })

      attachToEditor.registerPlugin(plugin)

      return () => {
        attachToEditor.unregisterPlugin(pluginKey)
        window.requestAnimationFrame(() => {
          if (bubbleMenuElement.parentNode) {
            bubbleMenuElement.parentNode.removeChild(bubbleMenuElement)
          }
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, currentEditor, restProps, ref])

    return createPortal(<div>{children}</div>, menuEl.current)
  },
)
