import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Highlight from '@tiptap/extension-highlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useState } from 'react'

const colors = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#FAF594',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
  '#C3E2C2',
  '#EAECCC',
  '#AFC8AD',
  '#EEC759',
  '#9BB8CD',
  '#FF90BC',
  '#FFC0D9',
  '#DC8686',
  '#7ED7C1',
  '#F3EEEA',
  '#89B9AD',
  '#D0BFFF',
  '#FFF8C9',
  '#CBFFA9',
  '#9BABB8',
  '#E3F4F4',
]
const names = [
  'Lea Thompson',
  'Cyndi Lauper',
  'Tom Cruise',
  'Madonna',
  'Jerry Hall',
  'Joan Collins',
  'Winona Ryder',
  'Christina Applegate',
  'Alyssa Milano',
  'Molly Ringwald',
  'Ally Sheedy',
  'Debbie Harry',
  'Olivia Newton-John',
  'Elton John',
  'Michael J. Fox',
  'Axl Rose',
  'Emilio Estevez',
  'Ralph Macchio',
  'Rob Lowe',
  'Jennifer Grey',
  'Mickey Rourke',
  'John Cusack',
  'Matthew Broderick',
  'Justine Bateman',
  'Lisa Bonet',
]

const defaultContent = `
  <p>Hi 👋, this is a collaborative document.</p>
  <p>Feel free to edit and collaborate in real-time!</p>
`

const getRandomElement = list => list[Math.floor(Math.random() * list.length)]

const getRandomColor = () => getRandomElement(colors)
const getRandomName = () => getRandomElement(names)

const getInitialUser = () => {
  return {
    name: getRandomName(),
    color: getRandomColor(),
  }
}

const Editor = ({ ydoc, provider, room }) => {
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser)
  const [userCount, setUserCount] = useState(0)

  const editor = useEditor({
    enableContentCheck: true,
    onContentError: ({ disableCollaboration }) => {
      disableCollaboration()
    },
    onCreate: ({ editor: currentEditor }) => {
      provider.on('synced', () => {
        if (currentEditor.isEmpty) {
          currentEditor.commands.setContent(defaultContent)
        }
      })
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.extend().configure({
        limit: 10000,
      }),
      Collaboration.extend().configure({
        document: ydoc,
      }),
      CollaborationCaret.extend().configure({
        provider,
      }),
    ],
  })

  const { isBold, isItalic, isStrike, isBulletList, isCode } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      isItalic: ctx.editor.isActive('italic') ?? false,
      isStrike: ctx.editor.isActive('strike') ?? false,
      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      isCode: ctx.editor.isActive('code') ?? false,
    }),
  })

  useEffect(() => {
    // Update status changes
    const statusHandler = event => {
      setStatus(event.status)
    }

    provider.on('status', statusHandler)

    return () => {
      provider.off('status', statusHandler)
    }
  }, [provider])

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    const updateUserCount = () => {
      setUserCount(editor.storage.collaborationCaret.users.length)
    }

    updateUserCount()
    provider.awareness.on('update', updateUserCount)

    return () => {
      provider.awareness.off('update', updateUserCount)
    }
  }, [editor, provider])

  // Save current user to localStorage and emit to editor
  useEffect(() => {
    if (editor && currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      editor.chain().focus().updateUser(currentUser).run()
    }
  }, [editor, currentUser])

  const setName = useCallback(() => {
    const name = (window.prompt('Name', currentUser.name) || '').trim().substring(0, 32)

    if (name) {
      return setCurrentUser({ ...currentUser, name })
    }
  }, [currentUser])

  if (!editor) {
    return null
  }

  return (
    <div className="column-half">
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={isBold ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={isItalic ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={isStrike ? 'is-active' : ''}
          >
            Strike
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={isBulletList ? 'is-active' : ''}
          >
            Bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={isCode ? 'is-active' : ''}
          >
            Code
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="main-group" />

      <div
        className="collab-status-group"
        data-state={status === 'connected' ? 'online' : 'offline'}
      >
        <label>
          {status === 'connected'
            ? `${userCount} user${userCount === 1 ? '' : 's'} online in ${room}`
            : 'offline'}
        </label>
        <button style={{ '--color': currentUser.color }} onClick={setName}>
          ✎ {currentUser.name}
        </button>
      </div>
    </div>
  )
}

export default Editor
