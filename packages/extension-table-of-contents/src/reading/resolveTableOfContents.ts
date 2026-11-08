import type { Node as PMNode } from '@tiptap/pm/model'

import { getTableOfContentsDepths } from './getTableOfContentsDepths.js'
import type { ResolveTableOfContentsOptions, TableOfContentsHeading } from './types.js'

/**
 * Reads the outline of a document without an editor or a DOM.
 * Works on the server, in tests and on stored JSON.
 * @param doc The document node, for example `editor.state.doc` or `PMNode.fromJSON(schema, json)`.
 * @param options The node types and the parts of the document to read.
 * @returns The headings in document order, without empty headings.
 * @example
 * const headings = resolveTableOfContents(editor.state.doc)
 * // [{ id: '…', level: 2, depth: 1, textContent: 'Introduction', pos: 0 }]
 */
export function resolveTableOfContents(
  doc: PMNode,
  options: ResolveTableOfContentsOptions = {},
): TableOfContentsHeading[] {
  const anchorTypes = options.anchorTypes ?? ['heading']
  const ranges = options.ranges ?? [{ from: 0, to: doc.content.size }]
  const headingsByPos = new Map<number, Omit<TableOfContentsHeading, 'depth'>>()

  ranges.forEach(range => {
    const from = Math.max(0, range.from)
    const to = Math.min(doc.content.size, range.to)

    if (to <= from) {
      return
    }

    doc.nodesBetween(from, to, (node, pos) => {
      if (!anchorTypes.includes(node.type.name)) {
        return
      }

      const isInsideRange = pos >= from && pos + node.nodeSize <= to

      if (!isInsideRange || node.textContent.length === 0 || headingsByPos.has(pos)) {
        return
      }

      const id = node.attrs['data-toc-id']
      const level = node.attrs.level

      headingsByPos.set(pos, {
        id: typeof id === 'string' ? id : null,
        level: typeof level === 'number' ? level : 1,
        textContent: node.textContent,
        pos,
      })
    })
  })

  const headings = [...headingsByPos.values()].sort((left, right) => left.pos - right.pos)
  const depths = getTableOfContentsDepths(headings.map(heading => heading.level))

  return headings.map((heading, index) => ({ ...heading, depth: depths[index] }))
}
