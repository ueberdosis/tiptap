import './styles.scss'

import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, CodeBlock],
    content: `
        <p>
          That's a boring paragraph followed by a fenced code block:
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

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isCodeBlock: ed.isActive('codeBlock'),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleCodeBlock().run()}
            class={state().isCodeBlock ? 'is-active' : ''}
          >
            Toggle code block
          </button>
          <button
            onClick={() => editor().chain().focus().setCodeBlock().run()}
            disabled={state().isCodeBlock}
          >
            Set code block
          </button>
        </div>
      </div>

      <EditorContent editor={editor()} />
    </>
  )
}
