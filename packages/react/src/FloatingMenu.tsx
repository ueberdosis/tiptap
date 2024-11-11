import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useCurrentEditor } from './Context.js'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey'>, 'element' | 'editor'> & {
  editor: FloatingMenuPluginProps['editor'] | null
  className?: string
  children: React.ReactNode
  options?: FloatingMenuPluginProps['options']
}

export const FloatingMenu = (props: FloatingMenuProps) => {
  const menuEl = useRef(document.createElement('div'))
  const { editor: currentEditor } = useCurrentEditor()

  useEffect(() => {
    menuEl.current.style.visibility = 'hidden'
    menuEl.current.style.position = 'absolute'

    if (props.editor?.isDestroyed || currentEditor?.isDestroyed) {
      return
    }

    const { pluginKey = 'floatingMenu', editor, options, shouldShow = null } = props

    const menuEditor = editor || currentEditor

    if (!menuEditor) {
      console.warn('FloatingMenu component is not rendered inside of an editor component or does not have editor prop.')
      return
    }

    const plugin = FloatingMenuPlugin({
      pluginKey,
      editor: menuEditor,
      element: menuEl.current,
      options,
      shouldShow,
    })

    menuEditor.registerPlugin(plugin)
    return () => {
      menuEditor.unregisterPlugin(pluginKey)
      window.requestAnimationFrame(() => {
        if (menuEl.current.parentNode) {
          menuEl.current.parentNode.removeChild(menuEl.current)
        }
      })
    }
  }, [props.editor, currentEditor])

  const portal = createPortal(<div className={props.className}>{props.children}</div>, menuEl.current)

  return <>{portal}</>
}
