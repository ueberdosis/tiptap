import './styles.scss'

import Bold from '@tiptap/extension-bold'
import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import { FontFamily } from '@tiptap/extension-font-family'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      TextStyle.configure({ mergeNestedSpanStyles: true }),
      Color,
      Bold,
      FontFamily,
    ],
    content: `
        <p><span>This has a &lt;span&gt; tag without a style attribute, so it’s thrown away.</span></p>
        <p><span style="">But this one is wrapped in a &lt;span&gt; tag with an inline style attribute, so it’s kept - even if it’s empty for now.</span></p>


        <p>--- merge nested span styles option enabled ---</p>

        <p>
          <span style="color: #FF0000;">
            <span style="font-family: serif;">
              red serif
            </span>
          </span>
        </p>

        <p>
          <span style="color: #FF0000;">
            <span style="font-family: serif;">
              <span style="color: #0000FF;">
                blue serif
              </span>
            </span>
          </span>
        </p>

        <p>
          <span style="color: #00FF00;">
            <span style="font-family: serif;">green serif </span>
            <span style="font-family: serif;color: #ff0000;">red serif</span>
          </span>
        </p>

        <p>
          <span>
            plain
            <span style="color: #0000FF;">blue</span>
            plain
            <span style="color: #00FF00;">
              green
              <span style="font-family: serif;">green serif</span>
            </span>
            plain
          </span>
        </p>

        <p>
            <span style="color: #0000FF;">
              blue
              <span style="color: #00FF00;">
                green
                <span style="font-family: serif;">
                  green serif
                  <span style="color: #0000FF;">blue serif</span>
                </span>
              </span>
            </span>
        </p>

        <p>
          <strong>
            strong
            <span style="color: #0000FF;">
              <strong>
                strong blue
                <span style="font-size: 24px;font-family: serif;">strong blue serif </span>
                <span style="color: #00FF00;">
                  strong green
                  <span style="font-family: serif;">strong green serif</span>
                </span>
              </strong>
            </span>
          </strong>
        </p>
      `,
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
