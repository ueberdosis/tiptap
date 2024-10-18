import React from 'react'

import { NodeType } from '../types.js'
import { renderJSONContentToReactElement } from './react.js'
import { NodeProps } from './renderer.js'

/**
 * This example demonstrates how to render a JSON representation of a node to a React element
 * It does so without including Prosemirror or Tiptap, it is the lightest possible way to render JSON content
 * But, since it doesn't include Prosemirror or Tiptap, it cannot automatically render marks or nodes for you.
 * If you need that, you should use the `renderToReactElement` from `@tiptap/static-renderer`
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */

// eslint-disable-next-line no-console
console.log(renderJSONContentToReactElement({
  nodeMapping: {
    text({ node }) {
      return node.text ?? null
    },
    heading({
      node,
      children,
    }: NodeProps<NodeType<'heading', { level: number }>, React.ReactNode>) {
      const level = node.attrs.level
      const hTag = `h${level}`

      return React.createElement(hTag, node.attrs, children)
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
}))
