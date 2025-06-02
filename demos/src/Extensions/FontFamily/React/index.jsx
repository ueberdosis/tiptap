import './styles.scss'

import Document from '@tiptap/extension-document'
import FontFamily from '@tiptap/extension-font-family'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, TextStyle, FontFamily],
    content: `
        <p><span style="font-family: Inter">Did you know that Inter is a really nice font for interfaces?</span></p>
        <p><span style="font-family: Comic Sans MS, Comic Sans">It doesn’t look as professional as Comic Sans.</span></p>
        <p><span style="font-family: serif">Serious people use serif fonts anyway.</span></p>
        <p><span style="font-family: monospace">The cool kids can apply monospace fonts aswell.</span></p>
        <p><span style="font-family: cursive">But hopefully we all can agree, that cursive fonts are the best.</span></p>
        <p><span style="font-family: var(--title-font-family)">Then there are CSS variables, the new hotness.</span></p>
        <p><span style="font-family: 'Exo 2'">TipTap even can handle exotic fonts as Exo 2.</span></p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"/>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().setFontFamily('Inter').run()}
            className={editor.isActive('textStyle', { fontFamily: 'Inter' }) ? 'is-active' : ''}
            data-test-id="inter"
          >
            Inter
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('"Comic Sans MS", "Comic Sans"').run()}
            className={
              editor.isActive('textStyle', { fontFamily: '"Comic Sans MS", "Comic Sans"' })
                ? 'is-active'
                : ''
            }
            data-test-id="comic-sans"
          >
            Comic Sans
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('serif').run()}
            className={editor.isActive('textStyle', { fontFamily: 'serif' }) ? 'is-active' : ''}
            data-test-id="serif"
          >
            Serif
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('monospace').run()}
            className={editor.isActive('textStyle', { fontFamily: 'monospace' }) ? 'is-active' : ''}
            data-test-id="monospace"
          >
            Monospace
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('cursive').run()}
            className={editor.isActive('textStyle', { fontFamily: 'cursive' }) ? 'is-active' : ''}
            data-test-id="cursive"
          >
            Cursive
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('var(--title-font-family)').run()}
            className={editor.isActive('textStyle', { fontFamily: 'var(--title-font-family)' }) ? 'is-active' : ''}
            data-test-id="css-variable"
          >
            CSS variable
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily('"Exo 2"').run()}
            className={editor.isActive('textStyle', { fontFamily: '"Exo 2"' }) ? 'is-active' : ''}
            data-test-id="exo2"
          >
            Exo 2
          </button>
          <button onClick={() => editor.chain().focus().unsetFontFamily().run()}
                  data-test-id="unsetFontFamily">
            Unset font family
          </button>
        </div>
      </div>
      <EditorContent editor={editor}/>
    </>
  )
}
