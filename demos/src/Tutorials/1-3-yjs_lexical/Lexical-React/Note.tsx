import './styles.css'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import React from 'react'
import * as Y from 'yjs'

import { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const initialConfig: InitialConfigType = {
    onError(error: Error): void {
      throw error
    },
    namespace: 'myeditor',
    editable: true,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable/>}
        placeholder={<p>{note.defaultContent}</p>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id={note.id}
        key={note.id}
        // @ts-ignore
        providerFactory={(id, yjsDocMap) => {
          const doc = new Y.Doc()

          yjsDocMap.set(id, doc)

          const provider = new TiptapCollabProvider({
            name: note.id, // any identifier - all connections sharing the same identifier will be synced
            appId: '7j9y6m10', // replace with YOUR_APP_ID
            token: 'notoken', // replace with your JWT
            document: doc,
          })

          return provider
        }}
        shouldBootstrap={true}
      />
    </LexicalComposer>
  )
}
