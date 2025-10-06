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

    if (typeof ref === 'function') {
      ref(menuEl.current)
    } else if (ref) {
      ref.current = menuEl.current
    }

    const { editor: currentEditor } = useCurrentEditor()

    // Apply props to the menu element whenever they change
    useEffect(() => {
      const floatingMenuElement = menuEl.current
      const { style, className, ...otherProps } = restProps

      // Clear existing attributes and className first
      floatingMenuElement.className = ''
      Array.from(floatingMenuElement.attributes).forEach(attr => {
        if (attr.name !== 'style') {
          floatingMenuElement.removeAttribute(attr.name)
        }
      })

      // Apply className to the actual menu element
      if (className) {
        floatingMenuElement.className = className
      }

      // Apply other HTML attributes (data-*, etc.) to the actual menu element
      Object.keys(otherProps).forEach(key => {
        const value = (otherProps as any)[key]
        if (value !== undefined) {
          floatingMenuElement.setAttribute(key, value)
        }
      })

      // Apply style props to the actual menu element (preserve positioning styles)
      if (style) {
        Object.assign(floatingMenuElement.style, style)
      }
    }, [restProps])

    useEffect(() => {
      const floatingMenuElement = menuEl.current

      floatingMenuElement.style.visibility = 'hidden'
      floatingMenuElement.style.position = 'absolute'

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
    }, [editor, currentEditor])

    return createPortal(<div>{children}</div>, menuEl.current)
  },
)
