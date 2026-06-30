<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Italic from '@tiptap/extension-italic'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Italic],
    content: `
      <p>This isn't italic.</p>
      <p><em>This is italic.</em></p>
      <p><i>And this.</i></p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleItalic().run()} class={editor.isActive('italic') ? 'is-active' : ''}>Toggle italic</button>
    <button onclick={() => editor.chain().focus().setItalic().run()} disabled={editor.isActive('italic')}>Set italic</button>
    <button onclick={() => editor.chain().focus().unsetItalic().run()} disabled={!editor.isActive('italic')}>Unset italic</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap) {
    :first-child { margin-top: 0; }
  }
</style>
