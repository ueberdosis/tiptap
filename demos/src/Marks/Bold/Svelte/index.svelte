<script lang="ts">
  import Bold from '@tiptap/extension-bold'
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold],
    content: `
      <p>This isn't bold.</p>
      <p><strong>This is bold.</strong></p>
      <p><b>And this.</b></p>
      <p style="font-weight: bold">This as well.</p>
      <p style="font-weight: bolder">Oh, and this!</p>
      <p style="font-weight: 500">Cool, isn't it!?</p>
      <p style="font-weight: 999">Up to font weight 999!!!</p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleBold().run()} class={editor.isActive('bold') ? 'is-active' : ''}>Toggle bold</button>
    <button onclick={() => editor.chain().focus().setBold().run()} disabled={editor.isActive('bold')}>Set bold</button>
    <button onclick={() => editor.chain().focus().unsetBold().run()} disabled={!editor.isActive('bold')}>Unset bold</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap) {
    :first-child { margin-top: 0; }
  }
</style>
