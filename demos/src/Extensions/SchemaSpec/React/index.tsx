import type { SchemaSpec } from '@tiptap/pm/model'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'

import { CustomNode } from './CustomNode.js'

const schemaSpec: SchemaSpec = {
  nodes: {
    doc: { content: 'block+' },
    text: { group: 'inline' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      marks: 'bold',
      attrs: { tone: { default: 'newsletter', validate: 'string' } },
    },
    customNode: {
      group: 'block',
      atom: true,
      attrs: { highlighted: { default: false, validate: 'boolean' } },
    },
  },
  marks: { bold: {} },
}

const LocalParagraph = Paragraph.extend({
  marks: '',
  addAttributes() {
    return {
      tone: {
        default: 'local',
        parseHTML: element => element.getAttribute('data-tone'),
        renderHTML: attributes => ({ 'data-tone': attributes.tone }),
      },
    }
  },
})

export default function SchemaSpecDemo() {
  const editor = useEditor({
    extensions: [Document, Text, LocalParagraph, Bold, CustomNode],
    schemaSpec,
    content: '<p>Edit this newsletter.</p><aside data-type="custom-node"></aside>',
  })
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      json: current?.getJSON(),
    }),
  })

  return (
    <>
      <div className="control-group">
        <p>
          The schema spec sets the tone to "newsletter" and allows bold text. Local extensions
          render the content.
        </p>
        <p>
          CustomNode defines only HTML parsing, rendering and a click plugin. Its group, atom flag
          and highlighted attribute come from the schema spec. Click the custom node to toggle its
          highlighted attribute.
        </p>
        <div className="button-group">
          <button
            type="button"
            disabled={!editor}
            className={state?.bold ? 'is-active' : ''}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            type="button"
            disabled={!editor}
            onClick={() => editor?.commands.setContent(editor.getHTML())}
          >
            Reload HTML
          </button>
          <button
            type="button"
            disabled={!editor}
            onClick={() => editor?.commands.setContent(editor.getJSON())}
          >
            Reload JSON
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
      <div className="output-group">
        <pre data-testid="json-output">{JSON.stringify(state?.json, null, 2)}</pre>
      </div>
    </>
  )
}
