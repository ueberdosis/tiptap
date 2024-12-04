import { renderJSONContentToString } from './string.js'

/**
 * This example demonstrates how to render a JSON representation of a node to a string
 * It does so without including Prosemirror or Tiptap, it is the lightest possible way to render JSON content
 * But, since it doesn't include Prosemirror or Tiptap, it cannot automatically render marks or nodes for you.
 * If you need that, you should use the `renderToHTMLString` from `@tiptap/static-renderer`
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */

// eslint-disable-next-line no-console
console.log(
  renderJSONContentToString({
    nodeMapping: {
      text({ node }) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return node.text!
      },
      heading({ node, children }) {
        const level = node.attrs?.level
        const attrs = Object.entries(node.attrs || {})
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(' ')

        return `<h${level}${attrs ? ` ${attrs}` : ''}>${([] as string[])
          .concat(children || '')
          .filter(Boolean)
          .join('\n')}</h${level}>`
      },
    },
    markMapping: {},
  })({
    content: {
      type: 'heading',
      content: [
        {
          type: 'text',
          text: 'hello world',
          marks: [],
        },
      ],
      attrs: { level: 2 },
    },
  }),
)
