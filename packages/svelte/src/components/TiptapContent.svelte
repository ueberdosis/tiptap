<script lang="ts">
  import { getEditor } from './editorContext.js'
  import EditorContent from './EditorContent.svelte'

  const editor = getEditor()
</script>

<EditorContent editor={editor} />
