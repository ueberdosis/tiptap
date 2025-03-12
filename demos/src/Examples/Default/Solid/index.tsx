import './styles.scss'

import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/solid'
import { createEditor, createEditorState, EditorContent } from '@tiptap/solid'
import StarterKit from '@tiptap/starter-kit'

const extensions = [TextStyleKit, StarterKit]

function MenuBar(props: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = createEditorState(
    () => props.editor,
    editor => {
      return {
        isBold: editor.isActive('bold'),
        canBold: editor.can().chain().focus().toggleBold().run(),
        isItalic: editor.isActive('italic'),
        canItalic: editor.can().chain().focus().toggleItalic().run(),
        isStrike: editor.isActive('strike'),
        canStrike: editor.can().chain().focus().toggleStrike().run(),
        isCode: editor.isActive('code'),
        canCode: editor.can().chain().focus().toggleCode().run(),
        canClearMarks: editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: editor.isActive('paragraph'),
        isHeading1: editor.isActive('heading', { level: 1 }),
        isHeading2: editor.isActive('heading', { level: 2 }),
        isHeading3: editor.isActive('heading', { level: 3 }),
        isHeading4: editor.isActive('heading', { level: 4 }),
        isHeading5: editor.isActive('heading', { level: 5 }),
        isHeading6: editor.isActive('heading', { level: 6 }),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        isCodeBlock: editor.isActive('codeBlock'),
        isBlockquote: editor.isActive('blockquote'),
        canUndo: editor.can().chain().focus().undo().run(),
        canRedo: editor.can().chain().focus().redo().run(),
      }
    },
  )

  return (
    <div class="control-group">
      <div class="button-group">
        <button
          onClick={() => props.editor.chain().focus().toggleBold().run()}
          disabled={!editorState().canBold}
          class={editorState().isBold ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleItalic().run()}
          disabled={!editorState().canItalic}
          class={editorState().isItalic ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleStrike().run()}
          disabled={!editorState().canStrike}
          class={editorState().isStrike ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleCode().run()}
          disabled={!editorState().canCode}
          class={editorState().isCode ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => props.editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
        <button onClick={() => props.editor.chain().focus().clearNodes().run()}>Clear nodes</button>
        <button
          onClick={() => props.editor.chain().focus().setParagraph().run()}
          class={editorState().isParagraph ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 1 }).run()}
          class={editorState().isHeading1 ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 2 }).run()}
          class={editorState().isHeading2 ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 3 }).run()}
          class={editorState().isHeading3 ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 4 }).run()}
          class={editorState().isHeading4 ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 5 }).run()}
          class={editorState().isHeading5 ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleHeading({ level: 6 }).run()}
          class={editorState().isHeading6 ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleBulletList().run()}
          class={editorState().isBulletList ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleOrderedList().run()}
          class={editorState().isOrderedList ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleCodeBlock().run()}
          class={editorState().isCodeBlock ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => props.editor.chain().focus().toggleBlockquote().run()}
          class={editorState().isBlockquote ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => props.editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
        <button onClick={() => props.editor.chain().focus().setHardBreak().run()}>Hard break</button>
        <button onClick={() => props.editor.chain().focus().undo().run()} disabled={!editorState().canUndo}>
          Undo
        </button>
        <button onClick={() => props.editor.chain().focus().redo().run()} disabled={!editorState().canRedo}>
          Redo
        </button>
      </div>
    </div>
  )
}

export default () => {
  const editor = createEditor({
    extensions,
    content: `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`,
  })
  return (
    <div>
      <MenuBar editor={editor()} />
      <EditorContent editor={editor()} />
    </div>
  )
}
