import { type BubbleMenuPluginProps, BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { useCurrentEditor } from '@tiptap/react'
import React, { useEffect, useRef, useState } from 'react'
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

    /**
     * Track whether the plugin has been initialized, so we only send updates
     * after the initial registration.
     */
    const [pluginInitialized, setPluginInitialized] = useState(false)

    /**
     * Track whether we need to skip the first options update dispatch.
     * This prevents unnecessary updates right after plugin initialization.
     */
    const skipFirstUpdateRef = useRef(true)

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

      skipFirstUpdateRef.current = true
      setPluginInitialized(true)

      return () => {
        setPluginInitialized(false)
        pluginEditor.unregisterPlugin(createdPluginKey)
        window.requestAnimationFrame(() => {
          if (bubbleMenuElement.parentNode) {
            bubbleMenuElement.parentNode.removeChild(bubbleMenuElement)
          }
        })
      }
    }, [pluginEditor])

    /**
     * Update the plugin options when props change after the plugin has been initialized.
     * This allows dynamic updates to options like scrollTarget without re-registering the entire plugin.
     */
    useEffect(() => {
      if (!pluginInitialized || !pluginEditor || pluginEditor.isDestroyed) {
        return
      }

      // Skip the first update right after initialization since the plugin was just created with these options
      if (skipFirstUpdateRef.current) {
        skipFirstUpdateRef.current = false
        return
      }

      pluginEditor.view.dispatch(
        pluginEditor.state.tr.setMeta('bubbleMenu', {
          type: 'updateOptions',
          options: bubbleMenuPluginPropsRef.current,
        }),
      )
    }, [
      pluginInitialized,
      pluginEditor,
      updateDelay,
      resizeDelay,
      shouldShow,
      options,
      appendTo,
      getReferencedVirtualElement,
    ])

    return createPortal(<div {...restProps}>{children}</div>, menuEl.current)
  },
)
