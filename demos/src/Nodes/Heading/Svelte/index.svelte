<script lang="ts">
  import Document from '@tiptap/extension-document'
  import Heading from '@tiptap/extension-heading'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: `
      <h1>This is a 1st level heading</h1>
      <h2>This is a 2nd level heading</h2>
      <h3>This is a 3rd level heading</h3>
      <h4>This 4th level heading will be converted to a paragraph, because levels are configured to be only 1, 2 or 3.</h4>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} class={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>H3</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global {
    .tiptap {
      :first-child { margin-top: 0; }

      h1, h2, h3, h4, h5, h6 {
        line-height: 1.1;
        margin-top: 2.5rem;
        text-wrap: pretty;
      }

      h1, h2 {
        margin-top: 3.5rem;
        margin-bottom: 1.5rem;
      }

      h1 { font-size: 1.4rem; }
      h2 { font-size: 1.2rem; }
      h3 { font-size: 1.1rem; }
      h4, h5, h6 { font-size: 1rem; }
    }
  }
</style>
