<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Image from '@tiptap/extension-image'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Image],
    content: `
      <p>This is a image demo.</p>
      <img src="https://placehold.co/800x400" alt="Placeholder" />
      <p>This image is rendered by the image extension.</p>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().setImage({ src: 'https://placehold.co/800x400' }).run()}>Set image</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap :first-child) { margin-top: 0; }

  :global(.tiptap img) {
    height: auto;
    max-width: 100%;
  }
</style>
