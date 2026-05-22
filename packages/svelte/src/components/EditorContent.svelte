<script lang="ts">
  import type { Editor } from '../Editor.js'

  let { editor }: { editor: Editor | null } = $props()

  let rootEl: HTMLDivElement | undefined = $state()

  $effect(() => {
    if (!editor || !rootEl) {
      return
    }

    if (!editor.view.dom?.parentNode) {
      return
    }

    const element = rootEl

    rootEl.append(...editor.view.dom.parentNode.childNodes)

    editor.setOptions({
      element,
    })

    editor.createNodeViews()
  })
</script>

<div bind:this={rootEl} />
