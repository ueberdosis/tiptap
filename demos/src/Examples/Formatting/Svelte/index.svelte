<script lang="ts">
  import Highlight from '@tiptap/extension-highlight'
  import TextAlign from '@tiptap/extension-text-align'
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, useEditorState, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
    ],
    content: `
      <h3 style="text-align:center">Devs Just Want to Have Fun by Cyndi Lauper</h3>
      <p style="text-align:center">
        I come home in the morning light<br />
        My mother says, <mark>"When you gonna live your life right?"</mark><br />
        Oh mother dear we're not the fortunate ones<br />
        And devs, they wanna have fun<br />
        Oh devs just want to have fun
      </p>
      <p style="text-align:center">
        The phone rings in the middle of the night<br />
        My father yells, "What you gonna do with your life?"<br />
        Oh daddy dear, you know you're still number one<br />
        But <s>girls</s>devs, they wanna have fun<br />
        Oh devs just want to have
      </p>
      <p style="text-align:center">
        That's all they really want<br />
        Some fun<br />
        When the working day is done<br />
        Oh devs, they wanna have fun<br />
        Oh devs just wanna have fun<br />
        (devs, they wanna, wanna have fun, devs wanna have)
      </p>
    `,
  })

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isH1: editor.isActive('heading', { level: 1 }),
      isH2: editor.isActive('heading', { level: 2 }),
      isH3: editor.isActive('heading', { level: 3 }),
      isParagraph: editor.isActive('paragraph'),
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isStrike: editor.isActive('strike'),
      isHighlight: editor.isActive('highlight'),
      isTextLeft: editor.isActive({ textAlign: 'left' }),
      isTextCenter: editor.isActive({ textAlign: 'center' }),
      isTextRight: editor.isActive({ textAlign: 'right' }),
      isTextJustify: editor.isActive({ textAlign: 'justify' }),
    }),
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class={$state.isH1 ? 'is-active' : ''}>H1</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class={$state.isH2 ? 'is-active' : ''}>H2</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} class={$state.isH3 ? 'is-active' : ''}>H3</button>
    <button onclick={() => editor.chain().focus().setParagraph().run()} class={$state.isParagraph ? 'is-active' : ''}>Paragraph</button>
    <button onclick={() => editor.chain().focus().toggleBold().run()} class={$state.isBold ? 'is-active' : ''}>Bold</button>
    <button onclick={() => editor.chain().focus().toggleItalic().run()} class={$state.isItalic ? 'is-active' : ''}>Italic</button>
    <button onclick={() => editor.chain().focus().toggleStrike().run()} class={$state.isStrike ? 'is-active' : ''}>Strike</button>
    <button onclick={() => editor.chain().focus().toggleHighlight().run()} class={$state.isHighlight ? 'is-active' : ''}>Highlight</button>
    <button onclick={() => editor.chain().focus().setTextAlign('left').run()} class={$state.isTextLeft ? 'is-active' : ''}>Left</button>
    <button onclick={() => editor.chain().focus().setTextAlign('center').run()} class={$state.isTextCenter ? 'is-active' : ''}>Center</button>
    <button onclick={() => editor.chain().focus().setTextAlign('right').run()} class={$state.isTextRight ? 'is-active' : ''}>Right</button>
    <button onclick={() => editor.chain().focus().setTextAlign('justify').run()} class={$state.isTextJustify ? 'is-active' : ''}>Justify</button>
  </div>
</div>

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

  :global(.tiptap mark) {
    background-color: #faf594;
    border-radius: 0.4rem;
    box-decoration-break: clone;
    padding: 0.1rem 0.3rem;
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
