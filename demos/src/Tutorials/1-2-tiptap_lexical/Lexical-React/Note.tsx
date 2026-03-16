import './styles.css'

import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { EditorState } from 'lexical/LexicalEditorState'
import React, { useRef } from 'react'

import type { TNote } from './types.js'

export default ({ note }: { note: TNote }) => {
  const editorStateRef = useRef<EditorState>()

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
        contentEditable={<ContentEditable />}
        placeholder={<p>{note.content}</p>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={editorState => (editorStateRef.current = editorState)} />
    </LexicalComposer>
  )
}
