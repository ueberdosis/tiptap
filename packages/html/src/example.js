import { generateHTML } from '@tiptap/html'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

// eslint-disable-next-line
const html = generateHTML({
  type: 'doc',
  content: [{
    type: 'paragraph',
    attrs: {
      align: 'left',
    },
    content: [{
      type: 'text',
      text: 'Example Text',
    }],
  }],
}, [
  new Document(),
  new Paragraph(),
  new Text(),
])
