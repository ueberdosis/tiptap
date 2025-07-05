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

      // Apply required positioning styles and merge user styles
      Object.assign(
        floatingMenuElement.style,
        {
          visibility: 'hidden',
          position: 'absolute',
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
        options,
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
