import './styles.scss'

import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import styles from './index.module.css'

const menuBarStateSelector = ctx => ({
  isBold: ctx.editor.isActive('bold') ?? false,
  isItalic: ctx.editor.isActive('italic') ?? false,
  isStrike: ctx.editor.isActive('strike') ?? false,
  isCode: ctx.editor.isActive('code') ?? false,
  isParagraph: ctx.editor.isActive('paragraph') ?? false,
  isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
  isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
  isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
  isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
  isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
  isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
  isBulletList: ctx.editor.isActive('bulletList') ?? false,
  isOrderedList: ctx.editor.isActive('orderedList') ?? false,
  isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
  isBlockquote: ctx.editor.isActive('blockquote') ?? false,
})

const MenuBar = ({ editor }) => {
  const editorState = useEditorState({ editor, selector: menuBarStateSelector })

  if (!editor) {
    return null
  }

  return (
    <div className={`toolbar ${styles.toolbar}`}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editorState.isBold ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editorState.isItalic ? 'is-active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editorState.isStrike ? 'is-active' : ''}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editorState.isCode ? 'is-active' : ''}
      >
        Code
      </button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
      <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editorState.isParagraph ? 'is-active' : ''}
      >
        Paragraph
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editorState.isHeading1 ? 'is-active' : ''}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editorState.isHeading2 ? 'is-active' : ''}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editorState.isHeading3 ? 'is-active' : ''}
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editorState.isHeading4 ? 'is-active' : ''}
      >
        H4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editorState.isHeading5 ? 'is-active' : ''}
      >
        H5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editorState.isHeading6 ? 'is-active' : ''}
      >
        H6
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editorState.isBulletList ? 'is-active' : ''}
      >
        Bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editorState.isOrderedList ? 'is-active' : ''}
      >
        Ordered list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editorState.isCodeBlock ? 'is-active' : ''}
      >
        Code block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editorState.isBlockquote ? 'is-active' : ''}
      >
        Blockquote
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        Horizontal rule
      </button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
      <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
      <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [StarterKit],
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
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
