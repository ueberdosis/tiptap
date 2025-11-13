import './styles.scss'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

import { BlockActionsExtension } from './BlockActionsExtension.js'
import { KeywordHighlightingExtension } from './KeywordHighlightingExtension.js'
import { ReadabilityScoringExtension } from './ReadabilityScoringExtension.js'
import { SelectionIndicatorExtension } from './SelectionIndicatorExtension.js'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      KeywordHighlightingExtension,
      ReadabilityScoringExtension,
      BlockActionsExtension,
      SelectionIndicatorExtension,
    ],
    content: `
      <h2>Decorations API Examples</h2>

      <h3>1. Keyword Highlighting (Inline Decoration)</h3>
      <p>This example highlights important keywords in the text. The word important appears here, and so does the word todo. You can configure which words to highlight and their colors. Try adding note or warning to see them highlighted in different colors.</p>

      <h3>2. Readability Scoring (Node Decoration)</h3>
      <p>This paragraph is short and easy to read. Notice the green background indicates easy readability.</p>
      <p>This paragraph contains a more complex sentence structure with multiple clauses and subordinate phrases that increase the overall difficulty of comprehension for the average reader.</p>
      <p>Note that the readability score gets updated as you edit. Shorter sentences with simple words get green (easy), medium complexity gets yellow, and complex paragraphs get red (hard).</p>

      <h3>3. Block Actions (Widget Decoration)</h3>
      <p>Hover at the end of paragraphs and headings to see duplicate and delete buttons. Click the duplicate button to copy a block, or delete to remove it. This widget demonstrates how decorations can provide quick actions for editing.</p>
      <p>Try duplicating this paragraph or deleting blocks to see how the widget decorations update in real-time.</p>

      <h3>4. Selection Indicator (Widget Decoration — Updates only on selection changes)</h3>
      <p>This widget displays information about the current selection (cursor or selected text) and is intentionally implemented to only re-render when the selection changes — not for every document edit. Try selecting text to see the widget update, and edit the document elsewhere to observe it remains unchanged.</p>
    `,
  })

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tiptap Decorations API Demo</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This demo showcases three practical uses of the Decorations API:
      </p>
      <EditorContent editor={editor} />
    </div>
  )
}
