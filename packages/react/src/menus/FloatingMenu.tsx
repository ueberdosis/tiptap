import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { useCurrentEditor } from '@tiptap/react'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element' | 'editor'> & {
  editor: FloatingMenuPluginProps['editor'] | null
  options?: FloatingMenuPluginProps['options']
} & React.HTMLAttributes<HTMLDivElement>

export const FloatingMenu = React.forwardRef<HTMLDivElement, FloatingMenuProps>(
  (
    {
      pluginKey = 'floatingMenu',
      editor,
      updateDelay,
      resizeDelay,
      appendTo,
      shouldShow = null,
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
     * The editor instance where the floating menu plugin will be registered.
     */
    const pluginEditor = editor || currentEditor

    // Creating a useMemo would be more computationally expensive than just
    // re-creating this object on every render.
    const floatingMenuPluginProps: Omit<FloatingMenuPluginProps, 'editor' | 'element'> = {
      updateDelay,
      resizeDelay,
      appendTo,
      pluginKey,
      shouldShow,
      options,
    }

    /**
     * The props for the floating menu plugin. They are accessed inside a ref to
     * avoid running the useEffect hook and re-registering the plugin when the
     * props change.
     */
    const floatingMenuPluginPropsRef = useRef(floatingMenuPluginProps)
    floatingMenuPluginPropsRef.current = floatingMenuPluginProps

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
        console.warn(
          'FloatingMenu component is not rendered inside of an editor component or does not have editor prop.',
        )
        return
      }

      const floatingMenuElement = menuEl.current
      floatingMenuElement.style.visibility = 'hidden'
      floatingMenuElement.style.position = 'absolute'

      const plugin = FloatingMenuPlugin({
        ...floatingMenuPluginPropsRef.current,
        editor: pluginEditor,
        element: floatingMenuElement,
      })

      pluginEditor.registerPlugin(plugin)

      const createdPluginKey = floatingMenuPluginPropsRef.current.pluginKey

      skipFirstUpdateRef.current = true
      setPluginInitialized(true)

      return () => {
        setPluginInitialized(false)
        pluginEditor.unregisterPlugin(createdPluginKey)
        window.requestAnimationFrame(() => {
          if (floatingMenuElement.parentNode) {
            floatingMenuElement.parentNode.removeChild(floatingMenuElement)
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
        pluginEditor.state.tr.setMeta('floatingMenu', {
          type: 'updateOptions',
          options: floatingMenuPluginPropsRef.current,
        }),
      )
    }, [pluginInitialized, pluginEditor, updateDelay, resizeDelay, shouldShow, options, appendTo])

    return createPortal(<div {...restProps}>{children}</div>, menuEl.current)
  },
)
