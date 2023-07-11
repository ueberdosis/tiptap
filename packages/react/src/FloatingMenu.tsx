import { FloatingMenuPlugin, FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import React, {
  useEffect, useState,
} from 'react'

import { useCurrentEditor } from './Context.js'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, 'pluginKey' | 'editor'>, 'element'> & {
  className?: string,
  children: React.ReactNode
}

export const FloatingMenu = (props: FloatingMenuProps) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const { editor: currentEditor } = useCurrentEditor()

  useEffect(() => {
    if (!element) {
      return
    }

    if (props.editor?.isDestroyed || currentEditor?.isDestroyed) {
      return
    }

    const {
      pluginKey = 'floatingMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
    } = props

    const menuEditor = editor || currentEditor

    if (!menuEditor) {
      console.warn('FloatingMenu component is not rendered inside of an editor component or does not have editor prop.')
      return
    }

    const plugin = FloatingMenuPlugin({
      pluginKey,
      editor: menuEditor,
      element,
      tippyOptions,
      shouldShow,
    })

    menuEditor.registerPlugin(plugin)
    return () => menuEditor.unregisterPlugin(pluginKey)
  }, [
    props.editor,
    currentEditor,
    element,
  ])

  return (
    <div ref={setElement} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
