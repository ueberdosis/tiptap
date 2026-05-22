<script lang="ts">
  import CodeBlock from '@tiptap/extension-code-block'
  import Document from '@tiptap/extension-document'
  import Paragraph from '@tiptap/extension-paragraph'
  import Text from '@tiptap/extension-text'
  import { useEditor, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [Document, Paragraph, Text, CodeBlock],
    content: `
      <p>This is a code block demo.</p>
      <pre><code>const greeting = 'Hello, World!'
console.log(greeting)</code></pre>
    `,
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleCodeBlock().run()} class={editor.isActive('codeBlock') ? 'is-active' : ''}>Code block</button>
  </div>
</div>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap :first-child) { margin-top: 0; }

  :global(.tiptap code) {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  :global(.tiptap pre) {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;
  }

  :global(.tiptap pre code) {
    background: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0;
  }
</style>
