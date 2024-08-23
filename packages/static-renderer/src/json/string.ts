/* eslint-disable @typescript-eslint/no-explicit-any */
import { TiptapStaticRenderer, TiptapStaticRendererOptions } from '../base.js'

export const stringRenderer = (
  options: TiptapStaticRendererOptions<string>,
) => {
  return TiptapStaticRenderer(ctx => {
    return ctx.component(ctx.props as any)
  }, options)
}

const fnAgain = stringRenderer({
  nodeMapping: {
    text({ node }) {
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
})

console.log(
  fnAgain({
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
