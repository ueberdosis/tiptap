<script lang="ts">
  import { getEditor } from './editorContext.js'
  import EditorContent from './EditorContent.svelte'

  const editor = $derived(getEditor())
</script>

<EditorContent editor={editor} />
