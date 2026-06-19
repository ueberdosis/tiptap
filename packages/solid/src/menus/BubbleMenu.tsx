import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { JSX } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

export type BubbleMenuProps = BubbleMenuPluginProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    children?: JSX.Element
  }

export function BubbleMenu(props: BubbleMenuProps) {
  const [local, rest] = splitProps(props, [
    'pluginKey',
    'editor',
    'updateDelay',
    'resizeDelay',
    'options',
    'appendTo',
    'shouldShow',
    'getReferencedVirtualElement',
    'children',
  ])

  let root: HTMLDivElement | undefined
  const resolvedPluginKey = local.pluginKey ?? new PluginKey('bubbleMenu')

  onMount(() => {
    const el = root

    if (!el) {
      return
    }

    el.style.visibility = 'hidden'
    el.style.position = 'absolute'
    el.remove()

    local.editor.registerPlugin(
      BubbleMenuPlugin({
        editor: local.editor,
        element: el,
        options: local.options,
        pluginKey: resolvedPluginKey,
        resizeDelay: local.resizeDelay,
        appendTo: local.appendTo,
        shouldShow: local.shouldShow ?? null,
        getReferencedVirtualElement: local.getReferencedVirtualElement,
        updateDelay: local.updateDelay,
      }),
    )
  })

  onCleanup(() => {
    local.editor.unregisterPlugin(resolvedPluginKey)
  })

  return (
    <div
      ref={el => {
        root = el ?? undefined
      }}
      {...rest}
    >
      {local.children}
    </div>
  )
}
