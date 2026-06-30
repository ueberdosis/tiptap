<script lang="ts">
  import Blockquote from '@tiptap/extension-blockquote'
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Blockquote],
    content: `
      <blockquote>Nothing is impossible, the word itself says "I'm possible!"</blockquote>
      <p>Audrey Hepburn</p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleBlockquote().run()} class={editor.isActive('blockquote') ? 'is-active' : ''}>Toggle blockquote</button>
    <button onclick={() => editor.chain().focus().setBlockquote().run()} disabled={!editor.can().setBlockquote()}>Set blockquote</button>
    <button onclick={() => editor.chain().focus().unsetBlockquote().run()} disabled={!editor.can().unsetBlockquote()}>Unset blockquote</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap :first-child) { margin-top: 0; }

  :global(.tiptap blockquote) {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }
</style>
