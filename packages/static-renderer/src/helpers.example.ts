/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAttributesFromExtensions, resolveExtensions } from '@tiptap/core'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'

import { getAttributes } from './helpers.js'

const extensionAttributes = getAttributesFromExtensions(
  resolveExtensions([
    StarterKit,
    TextAlign.configure({
      types: ['paragraph', 'heading'],
    }),
    TextStyle,
  ]),
)
const attributes = getAttributes(
  {
    type: 'heading',
    attrs: {
      textAlign: 'right',
    },
    content: [
      {
        type: 'text',
        text: 'hello world',
      },
    ],
  },
  extensionAttributes,
)

// eslint-disable-next-line no-console
console.log(attributes)
