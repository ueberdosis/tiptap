import './styles.css'

import type { HocuspocusProviderConfiguration } from '@hocuspocus/provider'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import React from 'react'
import * as Y from 'yjs'

import type { TNote } from './types.js'

class LexicalProvider extends HocuspocusProvider {
  constructor(configuration: HocuspocusProviderConfiguration) {
    super(configuration)

    this.on('synced', ({ state }) => {
      this.emit('sync', state)
    })
  }
}

export default ({ note }: { note: TNote }) => {
  const initialConfig: InitialConfigType = {
    onError(error: Error): void {
      throw error
    },
    namespace: 'myeditor',
    editorState: null,
    editable: true,
  }

  return (
    <LexicalCollaboration>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
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

            const provider = new LexicalProvider({
              name: note.id, // any identifier - all connections sharing the same identifier will be synced
              url: 'wss://7j9y6m10.collab.tiptap.cloud', // replace with your server URL
              token: 'notoken', // replace with your JWT
              document: doc,
            })

            return provider
          }}
          shouldBootstrap={true}
        />
      </LexicalComposer>
    </LexicalCollaboration>
  )
}
