<script lang="ts">
  import { Color, TextStyle } from '@tiptap/extension-text-style'
  import { ListItem } from '@tiptap/extension-list'
  import StarterKit from '@tiptap/starter-kit'
  import { useEditor, useEditorState, EditorContent } from '@tiptap/svelte'

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure(),
      StarterKit,
    ],
    content: `
      <h2>Hi there,</h2>
      <p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:</p>
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

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isStrike: editor.isActive('strike'),
      isCode: editor.isActive('code'),
      isParagraph: editor.isActive('paragraph'),
      isH1: editor.isActive('heading', { level: 1 }),
      isH2: editor.isActive('heading', { level: 2 }),
      isH3: editor.isActive('heading', { level: 3 }),
      isH4: editor.isActive('heading', { level: 4 }),
      isH5: editor.isActive('heading', { level: 5 }),
      isH6: editor.isActive('heading', { level: 6 }),
      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),
      isCodeBlock: editor.isActive('codeBlock'),
      isBlockquote: editor.isActive('blockquote'),
      isPurple: editor.isActive('textStyle', { color: '#958DF1' }),
      canBold: editor.can().chain().focus().toggleBold().run(),
      canItalic: editor.can().chain().focus().toggleItalic().run(),
      canStrike: editor.can().chain().focus().toggleStrike().run(),
      canCode: editor.can().chain().focus().toggleCode().run(),
      canUndo: editor.can().chain().focus().undo().run(),
      canRedo: editor.can().chain().focus().redo().run(),
    }),
  })
</script>

<div class="control-group">
  <div class="button-group">
    <button onclick={() => editor.chain().focus().toggleBold().run()} disabled={!$state.canBold} class={$state.isBold ? 'is-active' : ''}>Bold</button>
    <button onclick={() => editor.chain().focus().toggleItalic().run()} disabled={!$state.canItalic} class={$state.isItalic ? 'is-active' : ''}>Italic</button>
    <button onclick={() => editor.chain().focus().toggleStrike().run()} disabled={!$state.canStrike} class={$state.isStrike ? 'is-active' : ''}>Strike</button>
    <button onclick={() => editor.chain().focus().toggleCode().run()} disabled={!$state.canCode} class={$state.isCode ? 'is-active' : ''}>Code</button>
    <button onclick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
    <button onclick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
    <button onclick={() => editor.chain().focus().setParagraph().run()} class={$state.isParagraph ? 'is-active' : ''}>Paragraph</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} class={$state.isH1 ? 'is-active' : ''}>H1</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} class={$state.isH2 ? 'is-active' : ''}>H2</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} class={$state.isH3 ? 'is-active' : ''}>H3</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} class={$state.isH4 ? 'is-active' : ''}>H4</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} class={$state.isH5 ? 'is-active' : ''}>H5</button>
    <button onclick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} class={$state.isH6 ? 'is-active' : ''}>H6</button>
    <button onclick={() => editor.chain().focus().toggleBulletList().run()} class={$state.isBulletList ? 'is-active' : ''}>Bullet list</button>
    <button onclick={() => editor.chain().focus().toggleOrderedList().run()} class={$state.isOrderedList ? 'is-active' : ''}>Ordered list</button>
    <button onclick={() => editor.chain().focus().toggleCodeBlock().run()} class={$state.isCodeBlock ? 'is-active' : ''}>Code block</button>
    <button onclick={() => editor.chain().focus().toggleBlockquote().run()} class={$state.isBlockquote ? 'is-active' : ''}>Blockquote</button>
    <button onclick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
    <button onclick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
    <button onclick={() => editor.chain().focus().undo().run()} disabled={!$state.canUndo}>Undo</button>
    <button onclick={() => editor.chain().focus().redo().run()} disabled={!$state.canRedo}>Redo</button>
    <button onclick={() => editor.chain().focus().setColor('#958DF1').run()} class={$state.isPurple ? 'is-active' : ''}>Purple</button>
  </div>
</div>

<EditorContent editor={editor} />

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
