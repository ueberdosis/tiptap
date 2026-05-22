<script lang="ts">
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, Tiptap } from '@tiptap/svelte'

  import SvelteComponent from './Extension.ts'
  import { appContext } from './context.js'

  appContext.set({ value: 'Hi from Svelte context!' })

  const editor = useEditor({
    extensions: [StarterKit, SvelteComponent],
    content: `
      <p>This is still the text editor you're used to, but enriched with node views.</p>
      <svelte-component count="0"></svelte-component>
      <p>Did you see that? That's a Svelte component. We are really living in the future.</p>
    `,
  })
</script>

<Tiptap {editor}>
  <Tiptap.Content />
</Tiptap>

<style lang="scss">
  :global(.tiptap :first-child) { margin-top: 0; }
  :global(.tiptap ul), :global(.tiptap ol) {
    padding: 0 1rem; margin: 1.25rem 1rem 1.25rem 0.4rem;
  }
  :global(.tiptap ul li p), :global(.tiptap ol li p) {
    margin-top: 0.25em; margin-bottom: 0.25em;
  }
  :global(.tiptap h1), :global(.tiptap h2), :global(.tiptap h3),
  :global(.tiptap h4), :global(.tiptap h5), :global(.tiptap h6) {
    line-height: 1.1; margin-top: 2.5rem; text-wrap: pretty;
  }
  :global(.tiptap h1), :global(.tiptap h2) { margin-top: 3.5rem; margin-bottom: 1.5rem; }
  :global(.tiptap h1) { font-size: 1.4rem; }
  :global(.tiptap h2) { font-size: 1.2rem; }
  :global(.tiptap h3) { font-size: 1.1rem; }
  :global(.tiptap h4), :global(.tiptap h5), :global(.tiptap h6) { font-size: 1rem; }
  :global(.tiptap code) {
    background-color: var(--purple-light); border-radius: 0.4rem;
    color: var(--black); font-size: 0.85rem; padding: 0.25em 0.3em;
  }
  :global(.tiptap pre) {
    background: var(--black); border-radius: 0.5rem; color: var(--white);
    font-family: 'JetBrainsMono', monospace; margin: 1.5rem 0; padding: 0.75rem 1rem;
  }
  :global(.tiptap pre code) { background: none; color: inherit; font-size: 0.8rem; padding: 0; }
  :global(.tiptap blockquote) {
    border-left: 3px solid var(--gray-3); margin: 1.5rem 0; padding-left: 1rem;
  }
  :global(.tiptap hr) { border: none; border-top: 1px solid var(--gray-2); margin: 2rem 0; }
</style>
