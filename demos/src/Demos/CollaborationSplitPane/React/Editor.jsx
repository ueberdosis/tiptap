import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
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

const Editor = ({
  ydoc, provider, room,
}) => {
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser)

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
        history: false,
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
      CollaborationCursor.extend().configure({
        provider,
      }),
    ],
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
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            Strike
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Bullet list
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'is-active' : ''}
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
            ? `${editor.storage.collaborationCursor.users.length} user${
              editor.storage.collaborationCursor.users.length === 1 ? '' : 's'
            } online in ${room}`
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
