/**
 * This will patch the global object (document, window, etc.) with jsdom
 */
import 'global-jsdom/register'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'

const appId = '7j9y6m10'
const room = `room.${new Date().getFullYear().toString().slice(-2)}${
  new Date().getMonth() + 1
}${new Date().getDate()}-nick`

const ydoc = new Y.Doc()
const provider = new TiptapCollabProvider({
  appId,
  name: room,
  document: ydoc,
  preserveConnection: false,
  connect: false,
})

await provider.connect()
await provider.isSynced

const e = new Editor({
  element: null,
  extensions: [
    StarterKit,
    Collaboration.configure({
      document: ydoc,
    }),
  ],
  onTransaction: ({ editor }) => {
    console.dir(editor.getJSON(), { depth: Infinity })
  },
})

// e.chain().insertContentAt(0, '<p>another paragraph</p>').run()
console.log(e)
console.dir(e.getJSON(), { depth: 300 })
