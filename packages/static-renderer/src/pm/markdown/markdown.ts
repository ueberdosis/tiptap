import type { Extensions, JSONContent } from '@tiptap/core'
import type { Mark, Node } from '@tiptap/pm/model'
import { TableMap } from '@tiptap/pm/tables'

import type { TiptapStaticRendererOptions } from '../../json/renderer.js'
import type { StaticEditorOptions } from '../extensionRenderer.js'
import { renderToHTMLString, serializeChildrenToHTMLString } from '../html-string/html-string.js'

/**
 * This code is just to show the flexibility of this renderer. We can potentially render content to any format we want.
 * This is a simple example of how we can render content to markdown. This is not a full implementation of a markdown renderer.
 *
 * Limitations: see `renderToHTMLString` — extensions that mutate the document
 * via plugins/onCreate (UniqueID, TableOfContents) need to be pre-processed.
 *
 * @param staticEditorOptions Optional editor-level options that affect rendered output — mirrors a subset of `EditorOptions`.
 */
export function renderToMarkdown({
  content,
  extensions,
  staticEditorOptions,
  options,
}: {
  content: Node | JSONContent
  extensions: Extensions
  staticEditorOptions?: StaticEditorOptions
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>
}) {
  return renderToHTMLString({
    content,
    extensions,
    staticEditorOptions,
    options: {
      ...options,
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

          return `${Array.from<string>({ length: level }).fill('#').join('')} ${children}\n`
        },
        codeBlock({ node, children }) {
          return `\n\`\`\`${node.attrs.language}\n${serializeChildrenToHTMLString(children)}\n\`\`\`\n`
        },
        blockquote({ children }) {
          return `\n${serializeChildrenToHTMLString(children)
            .trim()
            .split('\n')
            .map(a => `> ${a}`)
            .join('\n')}\n`
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

          // Use the table's real column count (accounting for row/colspan) rather than
          // assuming the first row spans every column.
          const columnCount = TableMap.get(node).width
          return `\n${serializeChildrenToHTMLString(children[0])}| ${Array.from<string>({ length: columnCount }).fill('---').join(' | ')} |\n${serializeChildrenToHTMLString(children.slice(1))}\n`
        },
        tableRow({ node, children, parent }) {
          if (!Array.isArray(children) || !parent) {
            return `${serializeChildrenToHTMLString(children)}\n`
          }

          const map = TableMap.get(parent)

          let rowIndex = -1
          parent.forEach((rowNode, _offset, index) => {
            if (rowNode === node) {
              rowIndex = index
            }
          })

          if (rowIndex === -1) {
            // Should not happen, but fall back to the previous (naive) behavior rather than throwing.
            return `| ${children.join(' | ')} |\n`
          }

          const cells: string[] = []
          let cellIndex = 0

          for (let col = 0; col < map.width; col += 1) {
            const cellPos = map.map[rowIndex * map.width + col]
            const rect = map.findCell(cellPos)

            // Only the cell's top-left slot corresponds to an actual rendered child of this row.
            // Every other slot it covers (via rowspan/colspan) needs a blank placeholder so the
            // markdown grid stays rectangular.
            if (rect.top === rowIndex && rect.left === col) {
              cells.push(children[cellIndex] ?? '')
              cellIndex += 1
            } else {
              cells.push('')
            }
          }

          return `| ${cells.join(' | ')} |\n`
        },
        tableHeader({ children }) {
          return serializeChildrenToHTMLString(children).trim()
        },
        tableCell({ children }) {
          return serializeChildrenToHTMLString(children).trim()
        },
        ...options?.nodeMapping,
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
        link({ mark, children }) {
          return `[${serializeChildrenToHTMLString(children)}](${mark.attrs.href})`
        },
        highlight({ children }) {
          return `==${serializeChildrenToHTMLString(children)}==`
        },
        ...options?.markMapping,
      },
    },
  })
}
