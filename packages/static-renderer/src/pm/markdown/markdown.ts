import type { Extensions, JSONContent } from '@tiptap/core'
import type { Mark, Node } from '@tiptap/pm/model'

import type { TiptapStaticRendererOptions } from '../../json/renderer.js'
import { renderToHTMLString, serializeChildrenToHTMLString } from '../html-string/html-string.js'

/**
 * This code is just to show the flexibility of this renderer. We can potentially render content to any format we want.
 * This is a simple example of how we can render content to markdown. This is not a full implementation of a markdown renderer.
 */
export function renderToMarkdown({
  content,
  extensions,
  options,
}: {
  content: Node | JSONContent
  extensions: Extensions
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>
}) {
  const { nodeMapping, markMapping, ...rest } = options ?? {}
  return renderToHTMLString({
    content,
    extensions,
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
          return `\n\`\`\`${node.attrs.language}\n${serializeChildrenToHTMLString(children)}\n\`\`\`\n`
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
        horizontalRule() {
          return '\n---\n'
        },
        table({ children, node }) {
          if (!Array.isArray(children)) {
            return `\n${serializeChildrenToHTMLString(children)}\n`
          }

          return `\n${serializeChildrenToHTMLString(children[0])}| ${new Array(node.childCount - 2).fill('---').join(' | ')} |\n${serializeChildrenToHTMLString(children.slice(1))}\n`
        },
        tableRow({ children }) {
          if (Array.isArray(children)) {
            return `| ${children.join(' | ')} |\n`
          }
          return `${serializeChildrenToHTMLString(children)}\n`
        },
        tableHeader({ children }) {
          return serializeChildrenToHTMLString(children).trim()
        },
        tableCell({ children }) {
          return serializeChildrenToHTMLString(children).trim()
        },
        ...nodeMapping,
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
        strike({ children }) {
          return `~~${serializeChildrenToHTMLString(children)}~~`
        },
        underline({ children }) {
          return `<u>${serializeChildrenToHTMLString(children)}</u>`
        },
        subscript({ children }) {
          return `<sub>${serializeChildrenToHTMLString(children)}</sub>`
        },
        superscript({ children }) {
          return `<sup>${serializeChildrenToHTMLString(children)}</sup>`
        },
        link({ node, children }) {
          return `[${serializeChildrenToHTMLString(children)}](${node.attrs.href})`
        },
        highlight({ children }) {
          return `==${serializeChildrenToHTMLString(children)}==`
        },
        ...markMapping,
      },
      ...rest,
    },
  })
}
