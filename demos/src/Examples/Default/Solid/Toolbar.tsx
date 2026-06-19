import { getEditor, useEditorState } from '@tiptap/solid'

export default function Toolbar() {
  const editor = getEditor()

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      isBold: ed.isActive('bold'),
      isItalic: ed.isActive('italic'),
      isStrike: ed.isActive('strike'),
      isCode: ed.isActive('code'),
      isParagraph: ed.isActive('paragraph'),
      isH1: ed.isActive('heading', { level: 1 }),
      isH2: ed.isActive('heading', { level: 2 }),
      isH3: ed.isActive('heading', { level: 3 }),
      isH4: ed.isActive('heading', { level: 4 }),
      isH5: ed.isActive('heading', { level: 5 }),
      isH6: ed.isActive('heading', { level: 6 }),
      isBulletList: ed.isActive('bulletList'),
      isOrderedList: ed.isActive('orderedList'),
      isCodeBlock: ed.isActive('codeBlock'),
      isBlockquote: ed.isActive('blockquote'),
      isPurple: ed.isActive('textStyle', { color: '#958DF1' }),
      canBold: ed.can().chain().focus().toggleBold().run(),
      canItalic: ed.can().chain().focus().toggleItalic().run(),
      canStrike: ed.can().chain().focus().toggleStrike().run(),
      canCode: ed.can().chain().focus().toggleCode().run(),
      canUndo: ed.can().chain().focus().undo().run(),
      canRedo: ed.can().chain().focus().redo().run(),
    }),
  })

  return (
    <div class="control-group">
      <div class="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!state().canBold}
          class={state().isBold ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!state().canItalic}
          class={state().isItalic ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!state().canStrike}
          class={state().isStrike ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!state().canCode}
          class={state().isCode ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          class={state().isParagraph ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          class={state().isH1 ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          class={state().isH2 ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          class={state().isH3 ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          class={state().isH4 ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          class={state().isH5 ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          class={state().isH6 ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          class={state().isBulletList ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          class={state().isOrderedList ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          class={state().isCodeBlock ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          class={state().isBlockquote ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!state().canUndo}>
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!state().canRedo}>
          Redo
        </button>
        <button
          onClick={() => editor.chain().focus().setColor('#958DF1').run()}
          class={state().isPurple ? 'is-active' : ''}
        >
          Purple
        </button>
      </div>
    </div>
  )
}
