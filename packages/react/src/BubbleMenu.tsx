import React, {
  useEffect, useState,
} from 'react'
import { BubbleMenuPlugin, BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type BubbleMenuProps = Omit<Optional<BubbleMenuPluginProps, 'pluginKey'>, 'element'> & {
  className?: string,
}

export const BubbleMenu: React.FC<BubbleMenuProps> = props => {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!element) {
      return
    }

    if (props.editor.isDestroyed) {
      return
    }

    const {
      pluginKey = 'bubbleMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
    } = props

    const plugin = BubbleMenuPlugin({
      pluginKey,
      editor,
      element,
      tippyOptions,
      shouldShow,
    })

    editor.registerPlugin(plugin)
    return () => editor.unregisterPlugin(pluginKey)
  }, [
    props.editor,
    element,
  ])

  return (
    <div ref={setElement} className={props.className} style={{ visibility: 'hidden' }}>
      {props.children}
    </div>
  )
}
