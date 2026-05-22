<script lang="ts">
  import type { Editor } from '../Editor.js'
  import { setEditor } from './editorContext.js'
  import type { Snippet } from 'svelte'

  let { editor, children }: { editor: Editor; children?: Snippet } = $props()

  setEditor(editor)
</script>

{#if children}
  {@render children()}
{/if}
