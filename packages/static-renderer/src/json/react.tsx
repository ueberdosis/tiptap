/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'

import {
  NodeProps,
  TiptapStaticRenderer,
  TiptapStaticRendererOptions,
} from '../base.js'
import { NodeType } from '../types.js'

export const reactRenderer = (
  options: TiptapStaticRendererOptions<React.ReactNode>,
) => {
  let key = 0

  return TiptapStaticRenderer(
    ({ component, props: { children, ...props } }) => {
      key += 1
      return React.createElement(
        component as React.FC<typeof props>,
        Object.assign(props, { key }),
        ([] as React.ReactNode[]).concat(children),
      )
    },
    options,
  )
}

const fn = reactRenderer({
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
})

console.log(
  fn({
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
