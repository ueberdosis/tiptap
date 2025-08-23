import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React, { useState } from 'react'

export default () => {
  const [autofocusValue, setAutofocusValue] = useState(false)
  const [key, setKey] = useState(0) // To force re-render of editor

  const editor = useEditor({
    extensions: [Document, Paragraph, Text],
    autofocus: autofocusValue,
    content: `
      <p>This is a test for autofocus behavior. The editor should only focus and scroll into view when autofocus is enabled.</p>
      <p>Try different autofocus values using the buttons below.</p>
    `,
  }, [key, autofocusValue])

  const handleAutofocusChange = (value) => {
    setAutofocusValue(value)
    setKey(prev => prev + 1) // Force editor recreation
  }

  return (
    <div className="autofocus-test">
      <div className="content-above">
        <p>Content above editor - this simulates a page where the editor is below the fold.</p>
        <p>When autofocus is disabled (false or null), the page should NOT scroll to the editor.</p>
        <p>When autofocus is enabled, the page SHOULD scroll to the editor.</p>
        
        <div className="controls">
          <h3>Test autofocus values:</h3>
          <button onClick={() => handleAutofocusChange(false)}>
            autofocus: false (should NOT scroll)
          </button>
          <button onClick={() => handleAutofocusChange(null)}>
            autofocus: null (should NOT scroll)
          </button>
          <button onClick={() => handleAutofocusChange(true)}>
            autofocus: true (should scroll)
          </button>
          <button onClick={() => handleAutofocusChange('start')}>
            autofocus: 'start' (should scroll)
          </button>
        </div>
        
        <p>Current autofocus value: <strong>{JSON.stringify(autofocusValue)}</strong></p>
      </div>
      
      <div className="spacer">
        {/* Create some vertical space to push editor below fold */}
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Spacer content line {i + 1}</p>
        ))}
      </div>
      
      <div className="editor-container">
        <h3>Editor (should only focus/scroll when autofocus is enabled):</h3>
        <EditorContent editor={editor} />
      </div>
      
      <div className="content-below">
        <p>Content below editor</p>
        {Array.from({ length: 10 }, (_, i) => (
          <p key={i}>More content line {i + 1}</p>
        ))}
      </div>
    </div>
  )
}