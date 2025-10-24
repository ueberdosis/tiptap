import { type BubbleMenuPluginProps, BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { useCurrentEditor } from '@tiptap/react'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Optional<Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element'>, 'editor'> &
  React.HTMLAttributes<HTMLDivElement>

export const BubbleMenu = React.forwardRef<HTMLDivElement, BubbleMenuProps>(
  (
    {
      pluginKey = 'bubbleMenu',
      editor,
      updateDelay,
      resizeDelay,
      appendTo,
      shouldShow = null,
      getReferencedVirtualElement,
      options,
      children,
      ...restProps
    },
    ref,
  ) => {
    const menuEl = useRef(document.createElement('div'))

    if (typeof ref === 'function') {
      ref(menuEl.current)
    } else if (ref) {
      ref.current = menuEl.current
    }

    const { editor: currentEditor } = useCurrentEditor()

    const attachToEditor = editor || currentEditor

    const bubbleMenuPluginProps: Omit<BubbleMenuPluginProps, 'editor' | 'element'> = {
      updateDelay,
      resizeDelay,
      appendTo,
      pluginKey,
      shouldShow,
      getReferencedVirtualElement,
      options,
    }
    const bubbleMenuPluginPropsRef = useRef(bubbleMenuPluginProps)
    bubbleMenuPluginPropsRef.current = bubbleMenuPluginProps

    useEffect(() => {
      if (attachToEditor?.isDestroyed) {
        return
      }

      if (!attachToEditor) {
        console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.')
        return
      }

      const bubbleMenuElement = menuEl.current
      bubbleMenuElement.style.visibility = 'hidden'
      bubbleMenuElement.style.position = 'absolute'

      const plugin = BubbleMenuPlugin({
        ...bubbleMenuPluginPropsRef.current,
        editor: attachToEditor,
        element: bubbleMenuElement,
      })

      attachToEditor.registerPlugin(plugin)

      return () => {
        attachToEditor.unregisterPlugin(bubbleMenuPluginPropsRef.current.pluginKey)
        window.requestAnimationFrame(() => {
          if (bubbleMenuElement.parentNode) {
            bubbleMenuElement.parentNode.removeChild(bubbleMenuElement)
          }
        })
      }
    }, [attachToEditor])

    return createPortal(<div {...restProps}>{children}</div>, menuEl.current)
  },
)
