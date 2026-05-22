<script lang="ts">
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, EditorContent } from '@tiptap/svelte'
  import { BubbleMenu, FloatingMenu } from '@tiptap/svelte/menus'

  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>Try to select <em>this text</em> to see what we call the bubble menu.</p>
      <p>Neat, isn't it? Add an empty paragraph to see the floating menu.</p>
    `,
  })
</script>

<BubbleMenu {editor}>
  <div class="bubble-menu">
    <button onclick={() => editor.chain().focus().toggleBold().run()} class={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
    <button onclick={() => editor.chain().focus().toggleItalic().run()} class={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
    <button onclick={() => editor.chain().focus().toggleStrike().run()} class={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
  </div>
</BubbleMenu>

<FloatingMenu {editor}>
  <div class="floating-menu">
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
    <button onclick={() => editor.chain().focus().toggleBulletList().run()} class={editor.isActive('bulletList') ? 'is-active' : ''}>Bullet list</button>
  </div>
</FloatingMenu>

<EditorContent {editor} />

<style lang="scss">
  :global(.tiptap :first-child) { margin-top: 0; }

  :global(.tiptap ul), :global(.tiptap ol) {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;
  }

  :global(.tiptap ul li p), :global(.tiptap ol li p) {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  :global(.tiptap h1), :global(.tiptap h2), :global(.tiptap h3),
  :global(.tiptap h4), :global(.tiptap h5), :global(.tiptap h6) {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  :global(.tiptap h1), :global(.tiptap h2) {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  :global(.tiptap h1) { font-size: 1.4rem; }
  :global(.tiptap h2) { font-size: 1.2rem; }
  :global(.tiptap h3) { font-size: 1.1rem; }
  :global(.tiptap h4), :global(.tiptap h5), :global(.tiptap h6) { font-size: 1rem; }

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

  :global(.tiptap blockquote) {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  :global(.tiptap hr) {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }

  .bubble-menu :global(button) {
    background-color: unset;
  }

  .bubble-menu :global(button:hover) {
    background-color: var(--gray-3);
  }

  .bubble-menu :global(button.is-active) {
    background-color: var(--purple);
  }

  .bubble-menu :global(button.is-active:hover) {
    background-color: var(--purple-contrast);
  }

  .floating-menu :global(button) {
    background-color: unset;
    padding: 0.275rem 0.425rem;
    border-radius: 0.3rem;
  }

  .floating-menu :global(button:hover) {
    background-color: var(--gray-3);
  }

  .floating-menu :global(button.is-active) {
    background-color: var(--white);
    color: var(--purple);
  }

  .floating-menu :global(button.is-active:hover) {
    color: var(--purple-contrast);
  }
</style>
