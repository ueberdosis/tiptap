import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useCurrentEditor } from './Context.js'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element' | 'editor'> & {
  editor: BubbleMenuPluginProps['editor'] | null
  className?: string
  children: React.ReactNode
  updateDelay?: number
  resizeDelay?: number
  options?: BubbleMenuPluginProps['options']
}

export const BubbleMenu = (props: BubbleMenuProps) => {
  const menuEl = useRef(document.createElement('div'))
  const { editor: currentEditor } = useCurrentEditor()

  useEffect(() => {
    menuEl.current.style.visibility = 'hidden'
    menuEl.current.style.position = 'absolute'

    if (props.editor?.isDestroyed || currentEditor?.isDestroyed) {
      return
    }

    const { pluginKey = 'bubbleMenu', editor, updateDelay, resizeDelay, shouldShow = null } = props

    const menuEditor = editor || currentEditor

    if (!menuEditor) {
      console.warn('BubbleMenu component is not rendered inside of an editor component or does not have editor prop.')
      return
    }

    const plugin = BubbleMenuPlugin({
      updateDelay,
      resizeDelay,
      editor: menuEditor,
      element: menuEl.current,
      pluginKey,
      shouldShow,
      options: props.options,
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
