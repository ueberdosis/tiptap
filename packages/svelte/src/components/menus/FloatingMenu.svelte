<script lang="ts">
  import type { FloatingMenuPluginProps } from '@tiptap/extension-floating-menu'
  import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
  import type { Editor } from '../../Editor.js'

  let {
    editor,
    pluginKey = 'floatingMenu',
    updateDelay = undefined,
    resizeDelay = undefined,
    options = {},
    appendTo = undefined,
    shouldShow = null,
    ...attrs
  }: {
    editor: Editor
    pluginKey?: FloatingMenuPluginProps['pluginKey']
    updateDelay?: FloatingMenuPluginProps['updateDelay']
    resizeDelay?: FloatingMenuPluginProps['resizeDelay']
    options?: FloatingMenuPluginProps['options']
    appendTo?: FloatingMenuPluginProps['appendTo']
    shouldShow?: FloatingMenuPluginProps['shouldShow']
    [key: string]: any
  } = $props()

  let rootEl: HTMLDivElement | undefined = $state()

  $effect(() => {
    if (!rootEl || !editor) {
      return
    }

    const el = rootEl

    el.style.visibility = 'hidden'
    el.style.position = 'absolute'

    el.remove()

    editor.registerPlugin(
      FloatingMenuPlugin({
        pluginKey,
        editor,
        element: el,
        updateDelay,
        resizeDelay,
        options,
        appendTo,
        shouldShow,
      }),
    )

    return () => {
      editor.unregisterPlugin(pluginKey)
    }
  })
</script>

<div bind:this={rootEl} {...attrs}>
  <slot />
</div>
