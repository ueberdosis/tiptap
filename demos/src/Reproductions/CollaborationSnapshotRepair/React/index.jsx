import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import { ySyncPluginKey } from '@tiptap/y-tiptap'
import React, { useEffect, useState } from 'react'
import * as Y from 'yjs'

const createHistory = () => {
  const document = new Y.Doc({ gc: false })
  const paragraph = new Y.XmlElement('paragraph')
  const historicParagraph = new Y.XmlElement('paragraph')
  const text = new Y.XmlText('Important content')
  document.getXmlFragment('default').insert(0, [historicParagraph, paragraph])
  historicParagraph.insert(0, [new Y.XmlText('Historic content')])
  paragraph.insert(0, [text])
  text.format(0, text.length, { unsupported: {} })
  const snapshot = Y.snapshot(document)
  text.format(0, text.length, { unsupported: null })

  return { document, snapshot, text }
}

export default () => {
  const [history] = useState(createHistory)
  const [liveText, setLiveText] = useState(history.text.toString())
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({ document: history.document }),
    ],
  })

  useEffect(() => {
    const update = () => setLiveText(history.text.toString())
    history.document.on('update', update)
    return () => history.document.off('update', update)
  }, [history])

  return (
    <>
      <p>
        This snapshot contains a mark the editor cannot display. Viewing it must keep the live
        shared text intact. Return to the live document to check that the text is still there.
      </p>
      <div className="control-group">
        <div className="button-group">
          <button
            disabled={!editor}
            onClick={() =>
              ySyncPluginKey
                .getState(editor.state)
                .binding.renderSnapshot(history.snapshot, history.snapshot)
            }
          >
            View snapshot
          </button>
          <button
            disabled={!editor}
            onClick={() => ySyncPluginKey.getState(editor.state).binding.unrenderSnapshot()}
          >
            Return to live document
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
      <div className="output-group">Live shared text: {liveText}</div>
    </>
  )
}
