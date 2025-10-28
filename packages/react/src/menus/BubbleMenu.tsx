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

    /**
     * The editor instance where the bubble menu plugin will be registered.
     */
    const pluginEditor = editor || currentEditor

    // Creating a useMemo would be more computationally expensive than just
    // re-creating this object on every render.
    const bubbleMenuPluginProps: Omit<BubbleMenuPluginProps, 'editor' | 'element'> = {
      updateDelay,
      resizeDelay,
      appendTo,
      pluginKey,
      shouldShow,
      getReferencedVirtualElement,
      options,
    }
    /**
     * The props for the bubble menu plugin. They are accessed inside a ref to
     * avoid running the useEffect hook and re-registering the plugin when the
     * props change.
     */
    const bubbleMenuPluginPropsRef = useRef(bubbleMenuPluginProps)
    bubbleMenuPluginPropsRef.current = bubbleMenuPluginProps

    useEffect(() => {
      if (pluginEditor?.isDestroyed) {
        return
      }

      if (!pluginEditor) {
        console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.')
        return
      }

      const bubbleMenuElement = menuEl.current
      bubbleMenuElement.style.visibility = 'hidden'
      bubbleMenuElement.style.position = 'absolute'

      const plugin = BubbleMenuPlugin({
        ...bubbleMenuPluginPropsRef.current,
        editor: pluginEditor,
        element: bubbleMenuElement,
      })

      pluginEditor.registerPlugin(plugin)

      const createdPluginKey = bubbleMenuPluginPropsRef.current.pluginKey

      return () => {
        pluginEditor.unregisterPlugin(createdPluginKey)
        window.requestAnimationFrame(() => {
          if (bubbleMenuElement.parentNode) {
            bubbleMenuElement.parentNode.removeChild(bubbleMenuElement)
          }
        })
      }
    }, [pluginEditor])

    return createPortal(<div {...restProps}>{children}</div>, menuEl.current)
  },
)
