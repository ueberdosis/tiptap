import './styles.scss'

import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import InvisibleCharacters, {
  HardBreakNode,
  NonBreakingSpaceCharacter,
  ParagraphNode,
  SpaceCharacter,
  TabCharacter,
} from '@tiptap/extension-invisible-characters'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Heading,
      Text,
      InvisibleCharacters.configure({
        builders: [
          new SpaceCharacter(),
          new ParagraphNode(),
          new HardBreakNode(),
          new TabCharacter(),
          new NonBreakingSpaceCharacter(),
        ],
      }),
      HardBreak,
    ],
    content: `
      <h1>
        This is a heading.
      </h1>
      <p>
        This<br>is<br>a<br>paragraph.
      </p>
      <p>
        This is a paragraph, but without breaks.
      </p>
      <p>
        This paragraph contains non&nbsp;breaking&nbsp;spaces.
      </p>
    `,
  })

  const { isVisible } = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isVisible: false,
        }
      }

      return {
        isVisible: ctx.editor.storage.invisibleCharacters.visibility() ?? false,
      }
    },
  })

  if (!editor) {
    return false
  }

  return (
    <div>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.commands.showInvisibleCharacters()}>
            Show invisible characters
          </button>
          {/* Works as well */}
          {/* <button onClick={() => editor.commands.showInvisibleCharacters(false)}>showInvisibleCharacters(false)</button> */}
          <button onClick={() => editor.commands.hideInvisibleCharacters()}>
            Hide invisible characters
          </button>
          <button onClick={() => editor.commands.toggleInvisibleCharacters()}>
            Toggle invisible characters
          </button>
          <button onClick={() => editor.chain().focus().insertContent('\t').run()}>
            Insert tab
          </button>
        </div>
        <div>
          <input
            type="checkbox"
            id="show-invisible-characters"
            checked={isVisible}
            onChange={event => {
              const value = event.currentTarget.checked

              editor.commands.showInvisibleCharacters(value)
            }}
          />
          <label htmlFor="show-invisible-characters">Show invisibles</label>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
