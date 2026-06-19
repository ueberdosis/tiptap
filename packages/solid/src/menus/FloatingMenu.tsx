import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import { PluginKey } from '@tiptap/pm/state'
import type { JSX } from 'solid-js'
import { onCleanup, onMount, splitProps } from 'solid-js'

export type FloatingMenuProps = FloatingMenuPluginProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    children?: JSX.Element
  }

export function FloatingMenu(props: FloatingMenuProps) {
  const [local, rest] = splitProps(props, [
    'pluginKey',
    'editor',
    'updateDelay',
    'resizeDelay',
    'options',
    'appendTo',
    'shouldShow',
    'children',
  ])

  let root: HTMLDivElement | undefined
  const resolvedPluginKey = local.pluginKey ?? new PluginKey('floatingMenu')

  onMount(() => {
    const el = root

    if (!el) {
      return
    }

    el.style.visibility = 'hidden'
    el.style.position = 'absolute'
    el.remove()

    local.editor.registerPlugin(
      FloatingMenuPlugin({
        pluginKey: resolvedPluginKey,
        editor: local.editor,
        element: el,
        updateDelay: local.updateDelay,
        resizeDelay: local.resizeDelay,
        options: local.options,
        appendTo: local.appendTo,
        shouldShow: local.shouldShow ?? null,
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
