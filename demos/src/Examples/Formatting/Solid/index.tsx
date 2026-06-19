import './styles.scss'

import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] }), Highlight],
    content: `
      <h3 style="text-align:center">Devs Just Want to Have Fun by Cyndi Lauper</h3>
      <p style="text-align:center">
        I come home in the morning light<br />
        My mother says, <mark>"When you gonna live your life right?"</mark><br />
        Oh mother dear we're not the fortunate ones<br />
        And devs, they wanna have fun<br />
        Oh devs just want to have fun
      </p>
      <p style="text-align:center">
        The phone rings in the middle of the night<br />
        My father yells, "What you gonna do with your life?"<br />
        Oh daddy dear, you know you're still number one<br />
        But <s>girls</s>devs, they wanna have fun<br />
        Oh devs just want to have
      </p>
      <p style="text-align:center">
        That's all they really want<br />
        Some fun<br />
        When the working day is done<br />
        Oh devs, they wanna have fun<br />
        Oh devs just wanna have fun<br />
        (devs, they wanna, wanna have fun, devs wanna have)
      </p>
    `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isH1: ed.isActive('heading', { level: 1 }),
      isH2: ed.isActive('heading', { level: 2 }),
      isH3: ed.isActive('heading', { level: 3 }),
      isParagraph: ed.isActive('paragraph'),
      isBold: ed.isActive('bold'),
      isItalic: ed.isActive('italic'),
      isStrike: ed.isActive('strike'),
      isHighlight: ed.isActive('highlight'),
      isTextLeft: ed.isActive({ textAlign: 'left' }),
      isTextCenter: ed.isActive({ textAlign: 'center' }),
      isTextRight: ed.isActive({ textAlign: 'right' }),
      isTextJustify: ed.isActive({ textAlign: 'justify' }),
    }),
  })

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 1 }).run()}
            class={state().isH1 ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 2 }).run()}
            class={state().isH2 ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHeading({ level: 3 }).run()}
            class={state().isH3 ? 'is-active' : ''}
          >
            H3
          </button>
          <button
            onClick={() => editor().chain().focus().setParagraph().run()}
            class={state().isParagraph ? 'is-active' : ''}
          >
            Paragraph
          </button>
          <button
            onClick={() => editor().chain().focus().toggleBold().run()}
            class={state().isBold ? 'is-active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor().chain().focus().toggleItalic().run()}
            class={state().isItalic ? 'is-active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() => editor().chain().focus().toggleStrike().run()}
            class={state().isStrike ? 'is-active' : ''}
          >
            Strike
          </button>
          <button
            onClick={() => editor().chain().focus().toggleHighlight().run()}
            class={state().isHighlight ? 'is-active' : ''}
          >
            Highlight
          </button>
          <button
            onClick={() => editor().chain().focus().setTextAlign('left').run()}
            class={state().isTextLeft ? 'is-active' : ''}
          >
            Left
          </button>
          <button
            onClick={() => editor().chain().focus().setTextAlign('center').run()}
            class={state().isTextCenter ? 'is-active' : ''}
          >
            Center
          </button>
          <button
            onClick={() => editor().chain().focus().setTextAlign('right').run()}
            class={state().isTextRight ? 'is-active' : ''}
          >
            Right
          </button>
          <button
            onClick={() => editor().chain().focus().setTextAlign('justify').run()}
            class={state().isTextJustify ? 'is-active' : ''}
          >
            Justify
          </button>
        </div>
      </div>
      <EditorContent editor={editor()} />
    </>
  )
}
