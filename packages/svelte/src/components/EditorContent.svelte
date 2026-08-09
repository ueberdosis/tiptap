<script lang="ts">
  import type { Editor } from '../Editor.js'

  let { editor }: { editor: Editor | null } = $props()

  let rootEl: HTMLDivElement | undefined = $state()

  $effect(() => {
    if (!editor || !rootEl) {
      return
    }

    // `editor.view` is a throwing proxy until the editor is mounted, and
    // `isDestroyed` is true in that case, so check it before touching the view.
    if (editor.isDestroyed || !editor.view.dom?.parentNode) {
      return
    }

    const element = rootEl
    const mountedEditor = editor

    element.append(...editor.view.dom.parentNode.childNodes)

    editor.setOptions({
      element,
    })

    editor.createNodeViews()

    return () => {
      if (mountedEditor.isDestroyed) {
        return
      }

      // Move the editor DOM out of our element so a replacement editor does not
      // render next to it. The editor stays usable and can mount again later.
      const detachedElement = document.createElement('div')

      detachedElement.append(...element.childNodes)

      mountedEditor.setOptions({
        element: detachedElement,
      })
    }
  })
</script>

<div bind:this={rootEl} />
