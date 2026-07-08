import Collaboration from '@tiptap/extension-collaboration'
import Highlight from '@tiptap/extension-highlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { CharacterCount } from '@tiptap/extensions'
import { useEditorState } from '@tiptap/react'
import { EditorContent, useReactEditor } from '@tiptap/react-renderer-experimental'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const defaultContent = `
  <p>Hi 👋, this is a collaborative document.</p>
  <p>Both panes are separate editors bound to the same Y.Doc — type in either one.</p>
`

const Editor = ({ ydoc, label, seed = false }) => {
  const editor = useReactEditor({
    onCreate: ({ editor: currentEditor }) => {
      // Only one pane seeds the shared document (a provider's "synced"
      // callback would do this in a networked setup)
      if (seed && currentEditor.isEmpty) {
        currentEditor.commands.setContent(defaultContent)
      }
    },
    extensions: [
      StarterKit.configure({
        // Collaboration brings its own history that syncs across editors
        undoRedo: false,
      }),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({
        limit: 10000,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
  })

  // `useEditorState` is editor-scoped, not renderer-scoped: it works the
  // same against the experimental renderer
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor?.isActive('bold') ?? false,
      isItalic: ctx.editor?.isActive('italic') ?? false,
      isStrike: ctx.editor?.isActive('strike') ?? false,
      isBulletList: ctx.editor?.isActive('bulletList') ?? false,
      isCode: ctx.editor?.isActive('code') ?? false,
      characters: ctx.editor?.storage.characterCount.characters() ?? 0,
    }),
  })

  return (
    <div className="column-half">
      <div className="control-group">
        <div className="button-group">
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
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editorState.isBulletList ? 'is-active' : ''}
          >
            Bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editorState.isCode ? 'is-active' : ''}
          >
            Code
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="main-group" />

      <div className="collab-status-group" data-state="online">
        <label>
          {label} — shared Y.Doc, {editorState.characters} characters
        </label>
      </div>
    </div>
  )
}

export default Editor
