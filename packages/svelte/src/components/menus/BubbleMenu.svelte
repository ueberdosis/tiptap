<script lang="ts">
  import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
  import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
  import type { Editor } from '../../Editor.js'

  let {
    editor,
    pluginKey = 'bubbleMenu',
    updateDelay = undefined,
    resizeDelay = undefined,
    options = {},
    appendTo = undefined,
    shouldShow = null,
    getReferencedVirtualElement = undefined,
    ...attrs
  }: {
    editor: Editor
    pluginKey?: BubbleMenuPluginProps['pluginKey']
    updateDelay?: BubbleMenuPluginProps['updateDelay']
    resizeDelay?: BubbleMenuPluginProps['resizeDelay']
    options?: BubbleMenuPluginProps['options']
    appendTo?: BubbleMenuPluginProps['appendTo']
    shouldShow?: BubbleMenuPluginProps['shouldShow']
    getReferencedVirtualElement?: BubbleMenuPluginProps['getReferencedVirtualElement']
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
      BubbleMenuPlugin({
        editor,
        element: el,
        options,
        pluginKey,
        resizeDelay,
        appendTo,
        shouldShow,
        getReferencedVirtualElement,
        updateDelay,
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
