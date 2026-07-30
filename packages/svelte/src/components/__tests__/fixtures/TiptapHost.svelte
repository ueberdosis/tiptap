<script lang="ts">
  import type { Editor } from '../../../Editor.js'
  import Tiptap from '../../Tiptap.svelte'
  import TiptapContent from '../../TiptapContent.svelte'

  let { editor }: { editor: Editor } = $props()
</script>

<Tiptap {editor}>
  <TiptapContent />
</Tiptap>
