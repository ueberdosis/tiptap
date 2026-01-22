import './styles.scss'

import Code from '@dibdab/extension-code'
import Document from '@dibdab/extension-document'
import { BulletList, ListItem } from '@dibdab/extension-list'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { Focus } from '@dibdab/extensions'
import { EditorContent, useEditor } from '@dibdab/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Code,
      BulletList,
      ListItem,
    ],
    autofocus: true,
    content: `
        <p>
          The focus extension adds a class to the focused node only. That enables you to add a custom styling to just that node. By default, it’ll add <code>.has-focus</code>, even to nested nodes.
        </p>
        <ul>
          <li>Nested elements (like this list item) will be focused with the default setting of <code>mode: all</code>.</li>
          <li>Otherwise the whole list will get the focus class, even when just a single list item is selected.</li>
        </ul>
      `,
  })

  return <EditorContent editor={editor} />
}
