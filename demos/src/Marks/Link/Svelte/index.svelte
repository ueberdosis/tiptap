<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Link from '@tiptap/extension-link'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Link.configure({ openOnClick: false })],
    content: `
      <p>This is a <a href="https://tiptap.dev">link</a> demo.</p>
      <p>Click the button to add a link to the selected text.</p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => {
      const url = window.prompt('URL')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }} class={editor.isActive('link') ? 'is-active' : ''}>Set link</button>
    <button onclick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>Unset link</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap) {
    :first-child { margin-top: 0; }
  }
</style>
