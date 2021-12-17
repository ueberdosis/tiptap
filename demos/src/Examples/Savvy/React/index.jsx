import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Code from '@tiptap/extension-code'
import Typography from '@tiptap/extension-typography'
import { ColorHighlighter } from './ColorHighlighter'
import { SmilieReplacer } from './SmilieReplacer'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Code,
      Typography,
      ColorHighlighter,
      SmilieReplacer,
    ],
    content: `
      <p>
        → With the Typography extension, tiptap understands »what you mean« and adds correct characters to your text — it’s like a “typography nerd” on your side.
      </p>
      <p>
        Try it out and type <code>(c)</code>, <code>-></code>, <code>>></code>, <code>1/2</code>, <code>!=</code>, <code>--</code> or <code>1x1</code> here:
      </p>
      <p></p>
      <p>
        Or add completely custom input rules. We added a custom extension here that replaces smilies like <code>:-)</code>, <code><3</code> or <code>>:P</code> with emojis. Try it out:
      </p>
      <p></p>
      <p>
        You can also teach the editor new things. For example to recognize hex colors and add a color swatch on the fly: #FFF, #0D0D0D, #616161, #A975FF, #FB5151, #FD9170, #FFCB6B, #68CEF8, #80cbc4, #9DEF8F
      </p>
    `,
  })

  return <EditorContent editor={editor} />
}
