<script lang="ts">
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, Tiptap } from '@tiptap/svelte'

  import DraggableItem from './Extension.ts'

  const editor = useEditor({
    extensions: [StarterKit, DraggableItem],
    content: `
      <p>This is a boring paragraph.</p>
      <div data-type="draggable-item">
        <p>Followed by a fancy draggable item.</p>
      </div>
      <div data-type="draggable-item">
        <p>And another draggable item.</p>
        <div data-type="draggable-item">
          <p>And a nested one.</p>
          <div data-type="draggable-item">
            <p>But can we go deeper?</p>
          </div>
        </div>
      </div>
      <p>Let's finish with a boring paragraph.</p>
    `,
  })
</script>

<Tiptap {editor}>
  <Tiptap.Content />
</Tiptap>

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
</style>
