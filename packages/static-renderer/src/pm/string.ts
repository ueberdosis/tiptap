/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Extensions,
  getAttributesFromExtensions,
  getExtensionField,
  getSchema,
  MarkConfig,
  NodeConfig,
  resolveExtensions,
  splitExtensions,
} from '@tiptap/core'
import type { DOMOutputSpec, Mark, Node } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'

import { TiptapStaticRenderer, TiptapStaticRendererOptions } from '../base.js'
import { getHTMLAttributes } from '../helpers.js'
import { DOMOutputSpecArray } from '../types.js'

export const stringRenderer = (
  options: TiptapStaticRendererOptions<string, Mark, Node>,
) => {
  return TiptapStaticRenderer(ctx => {
    return ctx.component(ctx.props as any)
  }, options)
}

function serializeAttrs(attrs: Record<string, any>): string {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ')
}
function serializeChildren(children?: string | string[]): string {
  return ([] as string[])
    .concat(children || '')
    .filter(Boolean)
    .join('\n')
}

function domToString(
  content: DOMOutputSpec,
): (children?: string | string[]) => string {
  if (typeof content === 'string') {
    return () => content
  }
  if (typeof content === 'object' && 'length' in content) {
    const [tag, attrs, children, ...rest] = content as DOMOutputSpecArray

    if (attrs === undefined) {
      return () => `<${tag} />`
    }
    if (attrs === 0) {
      return child => `<${tag}>${serializeChildren(child)}</${tag}>`
    }
    if (typeof attrs === 'object') {
      if (Array.isArray(attrs)) {
        if (children === undefined) {
          return child => `<${tag}>${domToString(attrs as DOMOutputSpecArray)(
            child,
          )}</${tag}>`
        }
        if (children === 0) {
          return child => `<${tag}>${domToString(attrs as DOMOutputSpecArray)(
            child,
          )}</${tag}>`
        }
        return child => `<${tag}>${domToString(attrs as DOMOutputSpecArray)(child)}${[
          children,
        ]
          .concat(rest)
          .map(a => domToString(a)(child))}</${tag}>`
      }
      if (children === undefined) {
        return () => `<${tag} ${serializeAttrs(attrs)} />`
      }
      if (children === 0) {
        return child => `<${tag} ${serializeAttrs(attrs)}>${serializeChildren(
          child,
        )}</${tag}>`
      }

      return child => `<${tag} ${serializeAttrs(attrs)}>${[children]
        .concat(rest)
        .map(a => domToString(a)(child))}</${tag}>`

    }
  }

  // TODO support DOM?
  throw new Error('Unsupported DOM type', { cause: content })
}

export function generateMappings(
  extensions: Extensions,
): TiptapStaticRendererOptions<string, Mark, Node> {
  extensions = resolveExtensions(extensions)
  const extensionAttributes = getAttributesFromExtensions(extensions)
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)

  return {
    nodeMapping: Object.fromEntries(
      nodeExtensions.map(extension => {
        if (extension.name === 'doc') {
          // Skip any work for the doc extension
          return [
            extension.name,
            ({ children }) => {
              return serializeChildren(children)
            },
          ]
        }
        if (extension.name === 'text') {
          // Skip any work for the text extension
          return ['text', ({ node }) => node.text!]
        }

        const context = {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
          parent: extension.parent,
        }

        const renderToHTML = getExtensionField<NodeConfig['renderHTML']>(
          extension,
          'renderHTML',
          context,
        )

        if (!renderToHTML) {
          return [
            extension.name,
            () => {
              throw new Error(
                `Node ${extension.name} cannot be rendered, it is missing a "renderToHTML" method`,
              )
            },
          ]
        }

        return [
          extension.name,
          ({ node, children }) => {
            return domToString(
              renderToHTML({
                node,
                HTMLAttributes: getHTMLAttributes(node, extensionAttributes),
              }),
            )(children)
          },
        ]
      }),
    ),
    markMapping: Object.fromEntries(
      markExtensions.map(extension => {
        const context = {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
          parent: extension.parent,
        }

        const renderToHTML = getExtensionField<MarkConfig['renderHTML']>(
          extension,
          'renderHTML',
          context,
        )

        if (!renderToHTML) {
          return [
            extension.name,
            () => {
              throw new Error(
                `Node ${extension.name} cannot be rendered, it is missing a "renderToHTML" method`,
              )
            },
          ]
        }

        return [
          extension.name,
          ({ mark, children }) => {
            return domToString(
              renderToHTML({
                mark,
                HTMLAttributes: getHTMLAttributes(mark, extensionAttributes),
              }),
            )(children)
          },
        ]
      }),
    ),
  }
}

const extensions = [StarterKit]
const fn = stringRenderer(
  // {
  // nodeMapping: {
  //   text({ node }) {
  //     return node.text!;
  //   },
  //   heading({ node, children }) {
  //     const level = node.attrs.level;
  //     const attrs = Object.entries(node.attrs || {})
  //       .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
  //       .join(" ");
  //     return `<h${level}${attrs ? " " + attrs : ""}>${([] as string[])
  //       .concat(children || "")
  //       .filter(Boolean)
  //       .join("\n")}</h${level}>`;
  //   },
  // },
  // markMapping: {},
  // }
  generateMappings(extensions),
)

const schema = getSchema(extensions)

console.log(
  fn({
    content: schema.nodeFromJSON(
      //   {
      //   type: "heading",
      //   content: [
      //     {
      //       type: "text",
      //       text: "hello world",
      //       marks: [],
      //     },
      //   ],
      //   attrs: { level: 2 },
      // }
      {
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
    ),
  }),
)
