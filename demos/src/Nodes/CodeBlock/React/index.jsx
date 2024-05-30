import './styles.scss'

import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, CodeBlock],
    content: `
        <p>
          That’s a boring paragraph followed by a fenced code block:
        </p>
        <pre><code>for (var i=1; i <= 20; i++)
{
  if (i % 15 == 0)
    console.log("FizzBuzz");
  else if (i % 3 == 0)
    console.log("Fizz");
  else if (i % 5 == 0)
    console.log("Buzz");
  else
    console.log(i);
}</code></pre>
        <p>
          Press Command/Ctrl + Enter to leave the fenced code block and continue typing in boring paragraphs.
        </p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
          >
            Toggle code block
          </button>
          <button
            onClick={() => editor.chain().focus().setCodeBlock().run()}
            disabled={editor.isActive('codeBlock')}
          >
            Set code block
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
