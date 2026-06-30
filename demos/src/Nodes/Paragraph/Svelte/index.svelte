<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    content: `
      <p>This is a paragraph.</p>
      <p>This is another paragraph.</p>
      <p>There are three paragraphs in total.</p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().setParagraph().run()} class={editor.isActive('paragraph') ? 'is-active' : ''}>Paragraph</button>
  </div>
</div>

<EditorContent {editor} />
