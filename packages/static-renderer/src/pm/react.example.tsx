/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { renderToReactElement } from './react.js'

/**
 * This example demonstrates how to render a Prosemirror Node (or JSON Content) to a React Element.
 * It will use your extensions to render the content based on each Node's/Mark's `renderHTML` method.
 * This can be useful if you want to render content to React without having an actual editor instance.
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */

const Element = renderToReactElement({
  extensions: [StarterKit],
  options: {
    nodeMapping: {
      heading({ node, children }) {
        return <h1 {...node.attrs}>THIS IS AN EXAMPLE OF CUSTOM RENDERING{children}</h1>
      },
    },
    markMapping: {},
  },
  content: {
    type: 'doc',
    from: 0,
    to: 574,
    content: [
      {
        type: 'heading',
        from: 0,
        to: 11,
        attrs: {
          level: 2,
        },
        content: [
          {
            type: 'text',
            from: 1,
            to: 10,
            text: 'Hi there,',
          },
        ],
      },
      {
        type: 'paragraph',
        from: 11,
        to: 169,
        content: [
          {
            type: 'text',
            from: 12,
            to: 22,
            text: 'this is a ',
          },
          {
            type: 'text',
            from: 22,
            to: 27,
            marks: [
              {
                type: 'italic',
              },
            ],
            text: 'basic',
          },
          {
            type: 'text',
            from: 27,
            to: 39,
            text: ' example of ',
          },
          {
            type: 'text',
            from: 39,
            to: 45,
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'Tiptap',
          },
          {
            type: 'text',
            from: 45,
            to: 168,
            text: '. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:',
          },
        ],
      },
      {
        type: 'bulletList',
        from: 169,
        to: 230,
        content: [
          {
            type: 'listItem',
            from: 170,
            to: 205,
            attrs: {
              color: '',
            },
            content: [
              {
                type: 'paragraph',
                from: 171,
                to: 204,
                content: [
                  {
                    type: 'text',
                    from: 172,
                    to: 203,
                    text: 'That’s a bullet list with one …',
                  },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            from: 205,
            to: 229,
            attrs: {
              color: '',
            },
            content: [
              {
                type: 'paragraph',
                from: 206,
                to: 228,
                content: [
                  {
                    type: 'text',
                    from: 207,
                    to: 227,
                    text: '… or two list items.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        from: 230,
        to: 326,
        content: [
          {
            type: 'text',
            from: 231,
            to: 325,
            text: 'Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:',
          },
        ],
      },
      {
        type: 'codeBlock',
        from: 326,
        to: 353,
        attrs: {
          language: 'css',
        },
        content: [
          {
            type: 'text',
            from: 327,
            to: 352,
            text: 'body {\n  display: none;\n}',
          },
        ],
      },
      {
        type: 'paragraph',
        from: 353,
        to: 522,
        content: [
          {
            type: 'text',
            from: 354,
            to: 521,
            text: 'I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.',
          },
        ],
      },
      {
        type: 'blockquote',
        from: 522,
        to: 572,
        content: [
          {
            type: 'paragraph',
            from: 523,
            to: 571,
            content: [
              {
                type: 'text',
                from: 524,
                to: 564,
                text: 'Wow, that’s amazing. Good work, boy! 👏 ',
              },
              {
                type: 'hardBreak',
                from: 564,
                to: 565,
              },
              {
                type: 'text',
                from: 565,
                to: 570,
                text: '— Mom',
              },
            ],
          },
        ],
      },
    ],
  },
})

// eslint-disable-next-line no-console
console.log(renderToStaticMarkup(Element))
