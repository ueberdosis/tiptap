import { JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import { renderToHTMLString, serializeChildrenToHTMLString } from './html-string.js'

/**
 * This code is just to show the flexibility of this renderer. We can potentially render content to any format we want.
 * This is a simple example of how we can render content to markdown. This is not a full implementation of a markdown renderer.
 */

const renderToMarkdown = ({ content }: { content: JSONContent | Node }) => renderToHTMLString({
  content,
  extensions: [StarterKit],
  options: {
    nodeMapping: {
      bulletList({ children }) {
        return `\n${serializeChildrenToHTMLString(children)}`
      },
      orderedList({ children }) {
        return `\n${serializeChildrenToHTMLString(children)}`
      },
      listItem({ node, children, parent }) {
        if (parent?.type.name === 'bulletList') {
          return `- ${serializeChildrenToHTMLString(children).trim()}\n`
        }
        if (parent?.type.name === 'orderedList') {
          let number = parent.attrs.start || 1

          parent.forEach((parentChild, _offset, index) => {
            if (node === parentChild) {
              number = index + 1
            }
          })

          return `${number}. ${serializeChildrenToHTMLString(children).trim()}\n`
        }

        return serializeChildrenToHTMLString(children)
      },
      paragraph({ children }) {
        return `\n${serializeChildrenToHTMLString(children)}\n`
      },
      heading({ node, children }) {
        const level = node.attrs.level as number

        return `${new Array(level).fill('#').join('')} ${children}\n`
      },
      codeBlock({ node, children }) {
        return `\n\`\`\`${node.attrs.language}\n${serializeChildrenToHTMLString(
          children,
        )}\n\`\`\`\n`
      },
      blockquote({ children }) {
        return `\n${serializeChildrenToHTMLString(children)
          .trim()
          .split('\n')
          .map(a => `> ${a}`)
          .join('\n')}`
      },
      image({ node }) {
        return `![${node.attrs.alt}](${node.attrs.src})`
      },
      hardBreak() {
        return '\n'
      },
    },
    markMapping: {
      bold({ children }) {
        return `**${serializeChildrenToHTMLString(children)}**`
      },
      italic({ children, node }) {
        let isBoldToo = false

        // Check if the node being wrapped also has a bold mark, if so, we need to use the bold markdown syntax
        if (node?.marks.some(m => m.type.name === 'bold')) {
          isBoldToo = true
        }

        if (isBoldToo) {
          // If the content is bold, just wrap the bold content in italic markdown syntax with another set of asterisks
          return `*${serializeChildrenToHTMLString(children)}*`
        }

        return `_${serializeChildrenToHTMLString(children)}_`
      },
      code({ children }) {
        return `\`${serializeChildrenToHTMLString(children)}\``
      },
    },
  },
})

// eslint-disable-next-line no-console
console.log(
  renderToMarkdown({
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
                {
                  type: 'italic',
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
  }),
)
