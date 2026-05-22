<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Strike from '@tiptap/extension-strike'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Strike],
    content: `
      <p>This isn't strikethrough.</p>
      <p><s>This is strikethrough.</s></p>
      <p><strike>And this.</strike></p>
      <p><del>This also.</del></p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleStrike().run()} class={editor.isActive('strike') ? 'is-active' : ''}>Toggle strike</button>
    <button onclick={() => editor.chain().focus().setStrike().run()} disabled={editor.isActive('strike')}>Set strike</button>
    <button onclick={() => editor.chain().focus().unsetStrike().run()} disabled={!editor.isActive('strike')}>Unset strike</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap) {
    :first-child { margin-top: 0; }
  }
</style>
