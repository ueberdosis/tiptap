<script lang="ts">
  import { Color, TextStyle } from '@tiptap/extension-text-style'
  import { ListItem } from '@tiptap/extension-list'
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, Tiptap } from '@tiptap/svelte'
  import Toolbar from './Toolbar.svelte'

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure(),
      StarterKit,
    ],
    content: `
      <h2>Hi there,</h2>
      <p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kinds of basic text styles you'd probably expect from a text editor. But wait until you see the lists:</p>
      <ul>
        <li>That's a bullet list with one …</li>
        <li>… or two list items.</li>
      </ul>
      <p>Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:</p>
      <pre><code class="language-css">body {\n  display: none;\n}</code></pre>
      <p>I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.</p>
      <blockquote>Wow, that's amazing. Good work, boy! 👏<br />— Mom</blockquote>
    `,
  })
</script>

<Tiptap {editor}>
  <Toolbar />
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
