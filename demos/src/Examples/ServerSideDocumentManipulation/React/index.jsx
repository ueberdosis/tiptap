import './styles.scss'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Collaboration } from '@tiptap/extension-collaboration'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import * as Y from 'yjs'

import SyncedNode from './SyncedNode/index.jsx'

const MenuBar = ({ editor }) => {
  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain()
            .focus()
            .insertContent(`
<synced-node syncedNodeId="5fbcc54e-adb6-43eb-9a58-2b352e20df2a" imageSrc="./image-placeholder.png">
  <h2>Synced Node ❶.</h2>z
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
</synced-node>`)
            .run()
          }
        >
          Add Synced Node (ID: 1)
        </button>
        <button
          onClick={() => editor.chain()
            .focus()
            .insertContent(`
<synced-node syncedNodeId="268e77b1-921f-4283-a8fb-44c43168def8">
  <h2>Synced Node ❷.</h2>
  <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
</synced-node>`)
            .run()
          }
        >
          Add Synced Node (ID: 2)
        </button>

        <button
          onClick={() => editor.chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain()
            .focus()
            .toggleHeading({ level: 3 })
            .run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button onClick={() => editor.chain()
          .focus()
          .toggleBold()
          .run()} className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button onClick={() => editor.chain()
          .focus()
          .toggleItalic()
          .run()} className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
      </div>
    </div>
  )
}

// const initialContent = [3, 13, 137, 175, 151, 176, 12, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116, 3, 7, 104, 101, 97, 100, 105, 110, 103, 7, 0, 137, 175, 151, 176, 12, 0, 6, 4, 0, 137, 175, 151, 176, 12, 1, 19, 73, 32, 97, 109, 32, 97, 32, 104, 101, 97, 100, 105, 110, 103, 32, 240, 159, 145, 139, 40, 0, 137, 175, 151, 176, 12, 0, 5, 108, 101, 118, 101, 108, 1, 125, 1, 135, 137, 175, 151, 176, 12, 0, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 137, 175, 151, 176, 12, 20, 6, 4, 0, 137, 175, 151, 176, 12, 21, 207, 4, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110, 115, 101, 116, 101, 116, 117, 114, 32, 115, 97, 100, 105, 112, 115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 114, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 110, 111, 110, 117, 109, 121, 32, 101, 105, 114, 109, 111, 100, 32, 116, 101, 109, 112, 111, 114, 32, 105, 110, 118, 105, 100, 117, 110, 116, 32, 117, 116, 32, 108, 97, 98, 111, 114, 101, 32, 101, 116, 32, 100, 111, 108, 111, 114, 101, 32, 109, 97, 103, 110, 97, 32, 97, 108, 105, 113, 117, 121, 97, 109, 32, 101, 114, 97, 116, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 117, 97, 46, 32, 65, 116, 32, 118, 101, 114, 111, 32, 101, 111, 115, 32, 101, 116, 32, 97, 99, 99, 117, 115, 97, 109, 32, 101, 116, 32, 106, 117, 115, 116, 111, 32, 100, 117, 111, 32, 100, 111, 108, 111, 114, 101, 115, 32, 101, 116, 32, 101, 97, 32, 114, 101, 98, 117, 109, 46, 32, 83, 116, 101, 116, 32, 99, 108, 105, 116, 97, 32, 107, 97, 115, 100, 32, 103, 117, 98, 101, 114, 103, 114, 101, 110, 44, 32, 110, 111, 32, 115, 101, 97, 32, 116, 97, 107, 105, 109, 97, 116, 97, 32, 115, 97, 110, 99, 116, 117, 115, 32, 101, 115, 116, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 46, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110, 115, 101, 116, 101, 116, 117, 114, 32, 115, 97, 100, 105, 112, 115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 114, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 110, 111, 110, 117, 109, 121, 32, 101, 105, 114, 109, 111, 100, 32, 116, 101, 109, 112, 111, 114, 32, 105, 110, 118, 105, 100, 117, 110, 116, 32, 117, 116, 32, 108, 97, 98, 111, 114, 101, 32, 101, 116, 32, 100, 111, 108, 111, 114, 101, 32, 109, 97, 103, 110, 97, 32, 97, 108, 105, 113, 117, 121, 97, 109, 32, 101, 114, 97, 116, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 117, 97, 46, 32, 65, 116, 32, 118, 101, 114, 111, 32, 101, 111, 115, 32, 101, 116, 32, 97, 99, 99, 117, 115, 97, 109, 32, 101, 116, 32, 106, 117, 115, 116, 111, 32, 100, 117, 111, 32, 100, 111, 108, 111, 114, 101, 115, 32, 101, 116, 32, 101, 97, 32, 114, 101, 98, 117, 109, 46, 32, 83, 116, 101, 116, 32, 99, 108, 105, 116, 97, 32, 107, 97, 115, 100, 32, 103, 117, 98, 101, 114, 103, 114, 101, 110, 44, 32, 110, 111, 32, 115, 101, 97, 32, 116, 97, 107, 105, 109, 97, 116, 97, 32, 115, 97, 110, 99, 116, 117, 115, 32, 101, 115, 116, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 46, 135, 137, 175, 151, 176, 12, 20, 3, 10, 115, 121, 110, 99, 101, 100, 78, 111, 100, 101, 40, 0, 137, 175, 151, 176, 12, 229, 4, 12, 115, 121, 110, 99, 101, 100, 78, 111, 100, 101, 73, 100, 1, 125, 1, 40, 0, 137, 175, 151, 176, 12, 229, 4, 8, 105, 109, 97, 103, 101, 83, 114, 99, 1, 119, 23, 46, 47, 105, 109, 97, 103, 101, 45, 112, 108, 97, 99, 101, 104, 111, 108, 100, 101, 114, 46, 112, 110, 103, 135, 137, 175, 151, 176, 12, 229, 4, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 137, 175, 151, 176, 12, 232, 4, 6, 4, 0, 137, 175, 151, 176, 12, 233, 4, 207, 4, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110, 115, 101, 116, 101, 116, 117, 114, 32, 115, 97, 100, 105, 112, 115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 114, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 110, 111, 110, 117, 109, 121, 32, 101, 105, 114, 109, 111, 100, 32, 116, 101, 109, 112, 111, 114, 32, 105, 110, 118, 105, 100, 117, 110, 116, 32, 117, 116, 32, 108, 97, 98, 111, 114, 101, 32, 101, 116, 32, 100, 111, 108, 111, 114, 101, 32, 109, 97, 103, 110, 97, 32, 97, 108, 105, 113, 117, 121, 97, 109, 32, 101, 114, 97, 116, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 117, 97, 46, 32, 65, 116, 32, 118, 101, 114, 111, 32, 101, 111, 115, 32, 101, 116, 32, 97, 99, 99, 117, 115, 97, 109, 32, 101, 116, 32, 106, 117, 115, 116, 111, 32, 100, 117, 111, 32, 100, 111, 108, 111, 114, 101, 115, 32, 101, 116, 32, 101, 97, 32, 114, 101, 98, 117, 109, 46, 32, 83, 116, 101, 116, 32, 99, 108, 105, 116, 97, 32, 107, 97, 115, 100, 32, 103, 117, 98, 101, 114, 103, 114, 101, 110, 44, 32, 110, 111, 32, 115, 101, 97, 32, 116, 97, 107, 105, 109, 97, 116, 97, 32, 115, 97, 110, 99, 116, 117, 115, 32, 101, 115, 116, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 46, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 44, 32, 99, 111, 110, 115, 101, 116, 101, 116, 117, 114, 32, 115, 97, 100, 105, 112, 115, 99, 105, 110, 103, 32, 101, 108, 105, 116, 114, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 110, 111, 110, 117, 109, 121, 32, 101, 105, 114, 109, 111, 100, 32, 116, 101, 109, 112, 111, 114, 32, 105, 110, 118, 105, 100, 117, 110, 116, 32, 117, 116, 32, 108, 97, 98, 111, 114, 101, 32, 101, 116, 32, 100, 111, 108, 111, 114, 101, 32, 109, 97, 103, 110, 97, 32, 97, 108, 105, 113, 117, 121, 97, 109, 32, 101, 114, 97, 116, 44, 32, 115, 101, 100, 32, 100, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 117, 97, 46, 32, 65, 116, 32, 118, 101, 114, 111, 32, 101, 111, 115, 32, 101, 116, 32, 97, 99, 99, 117, 115, 97, 109, 32, 101, 116, 32, 106, 117, 115, 116, 111, 32, 100, 117, 111, 32, 100, 111, 108, 111, 114, 101, 115, 32, 101, 116, 32, 101, 97, 32, 114, 101, 98, 117, 109, 46, 32, 83, 116, 101, 116, 32, 99, 108, 105, 116, 97, 32, 107, 97, 115, 100, 32, 103, 117, 98, 101, 114, 103, 114, 101, 110, 44, 32, 110, 111, 32, 115, 101, 97, 32, 116, 97, 107, 105, 109, 97, 116, 97, 32, 115, 97, 110, 99, 116, 117, 115, 32, 101, 115, 116, 32, 76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109, 32, 100, 111, 108, 111, 114, 32, 115, 105, 116, 32, 97, 109, 101, 116, 46, 9, 212, 191, 133, 209, 9, 0, 40, 1, 22, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 99, 111, 110, 102, 105, 103, 14, 97, 117, 116, 111, 86, 101, 114, 115, 105, 111, 110, 105, 110, 103, 1, 125, 1, 40, 1, 22, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 99, 111, 110, 102, 105, 103, 15, 105, 110, 116, 101, 114, 118, 97, 108, 83, 101, 99, 111, 110, 100, 115, 1, 125, 172, 4, 33, 1, 22, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 99, 111, 110, 102, 105, 103, 13, 115, 116, 97, 116, 101, 67, 97, 112, 116, 117, 114, 101, 100, 1, 33, 1, 22, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 99, 111, 110, 102, 105, 103, 14, 99, 117, 114, 114, 101, 110, 116, 86, 101, 114, 115, 105, 111, 110, 1, 8, 1, 24, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 118, 101, 114, 115, 105, 111, 110, 115, 1, 118, 3, 4, 110, 97, 109, 101, 127, 7, 118, 101, 114, 115, 105, 111, 110, 125, 0, 4, 100, 97, 116, 101, 123, 66, 121, 92, 203, 225, 232, 32, 0, 7, 1, 27, 95, 95, 116, 105, 112, 116, 97, 112, 99, 111, 108, 108, 97, 98, 95, 95, 118, 101, 114, 115, 105, 111, 110, 115, 95, 118, 50, 1, 40, 0, 212, 191, 133, 209, 9, 5, 4, 110, 97, 109, 101, 1, 119, 0, 40, 0, 212, 191, 133, 209, 9, 5, 7, 118, 101, 114, 115, 105, 111, 110, 1, 125, 0, 40, 0, 212, 191, 133, 209, 9, 5, 4, 100, 97, 116, 101, 1, 123, 66, 121, 92, 203, 225, 232, 32, 0, 8, 209, 134, 204, 235, 5, 0, 161, 212, 191, 133, 209, 9, 2, 1, 168, 209, 134, 204, 235, 5, 0, 1, 125, 1, 168, 212, 191, 133, 209, 9, 3, 1, 125, 1, 136, 212, 191, 133, 209, 9, 4, 1, 118, 3, 4, 110, 97, 109, 101, 127, 7, 118, 101, 114, 115, 105, 111, 110, 125, 1, 4, 100, 97, 116, 101, 123, 66, 121, 92, 203, 231, 29, 32, 0, 135, 212, 191, 133, 209, 9, 5, 1, 40, 0, 209, 134, 204, 235, 5, 4, 4, 110, 97, 109, 101, 1, 119, 0, 40, 0, 209, 134, 204, 235, 5, 4, 7, 118, 101, 114, 115, 105, 111, 110, 1, 125, 1, 40, 0, 209, 134, 204, 235, 5, 4, 4, 100, 97, 116, 101, 1, 123, 66, 121, 92, 203, 231, 29, 32, 0, 2, 212, 191, 133, 209, 9, 1, 2, 2, 209, 134, 204, 235, 5, 1, 0, 1]
//
// const content = `
// <h1>
//   I am a heading 👋
// </h1>
// <p>
//   Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
// </p>
// <synced-node syncedNodeId="5fbcc54e-adb6-43eb-9a58-2b352e20df2a" imageSrc="./image-placeholder.png">
//   <h2>
//     Synced Node ❶
//   </h2>
//   <p>
//     Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
//   </p>
// </synced-node>
// <p>
//   Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
// </p>
// `

export default () => {
  const [name, setName] = useState('document1')

  const baseExtensions = [
    StarterKit.configure({
      history: false,
    }),
    SyncedNode,
  ]

  const [extensions, setExtensions] = useState(baseExtensions)

  useEffect(() => {
    if (!name) {
      return
    }

    const doc = new Y.Doc()
    // Y.applyUpdate(doc, Uint8Array.from(initialContent))

    const provider = new TiptapCollabProvider({
      appId: 'J9YD7R89',
      // baseUrl: 'http://127.0.0.1:8080',
      name,
      document: doc,
    })

    setExtensions([
      ...baseExtensions,
      Collaboration.configure({
        document: doc,
      }),
    ])

    return () => {
      provider.destroy()
    }
  }, [name])

  const editor = useEditor({
    slotBefore: MenuBar,
    extensions,
  }, [extensions])

  return (
    <div className="col-group">
      <div className="main">
        <MenuBar editor={editor}/>
        <EditorContent editor={editor}/>
      </div>

      <div className="sidebar">
        <div className="sidebar-options">
          <div className="label-large">Documents</div>
          <div className="versions-group">
            <button onClick={() => setName('document1')}
                    className={`${name === 'document1' ? 'is-active' : ''}`}
            >Document 1<span>Synced ✓</span></button>
            <button onClick={() => setName('document2')}
                    className={`${name === 'document2' ? 'is-active' : ''}`}
            >Document 2<span>Synced ✓</span></button>
            <button onClick={() => setName('document3')}
                    className={`${name === 'document3' ? 'is-active' : ''}`}
            >Document 3<span>Synced ✓</span></button>
            <button onClick={() => setName('document4')}
                    className={`${name === 'document4' ? 'is-active' : ''}`}
            >Document 4<span>Synced ✓</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
