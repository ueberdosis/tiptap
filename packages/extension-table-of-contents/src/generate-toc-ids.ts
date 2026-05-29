import type { Extensions, JSONContent } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { v4 as uuidv4 } from 'uuid'

import type { TableOfContents } from './tableOfContents.js'

/**
 * Creates a new document with `id` and `data-toc-id` attributes added to
 * anchor-type nodes (headings by default). Does the same job as the
 * `TableOfContents` ProseMirror plugin, but without needing an `Editor`
 * instance — so it can run on the server before `renderToHTMLString`.
 *
 * The configuration from the `TableOfContents` extension (in particular
 * `anchorTypes` and `getId`) is picked up automatically. Nodes that already
 * have a unique `data-toc-id` are left untouched; duplicates and missing IDs
 * are re-generated to match the plugin's behavior.
 *
 * @throws {Error} If the `TableOfContents` extension is not in the array.
 *
 * @example
 * const doc = {
 *   type: 'doc',
 *   content: [
 *     { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Intro' }] },
 *   ],
 * }
 * const docWithIds = generateTocIds(doc, [StarterKit, TableOfContents])
 * // → heading now has `id` and `data-toc-id` attributes
 * const html = renderToHTMLString({ content: docWithIds, extensions: [...] })
 *
 * @param doc - A Tiptap JSON document to add anchor IDs to.
 * @param extensions - The extensions to use. Must include the `TableOfContents` extension (or one extending it).
 * @param extensionName - Optional name of the `TableOfContents` extension to look up. Defaults to `'tableOfContents'`. Override this if you have extended the base extension and changed its `name`.
 * @returns The updated Tiptap JSON document.
 */
export function generateTocIds(
  doc: JSONContent,
  extensions: Extensions,
  extensionName = 'tableOfContents',
): JSONContent {
  const tocExtension = extensions.find(ext => ext.name === extensionName) as
    | typeof TableOfContents
    | undefined

  if (!tocExtension) {
    throw new Error(
      `TableOfContents extension (name: "${extensionName}") not found in the extensions array`,
    )
  }

  const schema = getSchema([...extensions.filter(ext => ext.name !== extensionName), tocExtension])
  const anchorTypes = tocExtension.options.anchorTypes ?? ['heading']
  const getId = tocExtension.options.getId ?? (() => uuidv4())

  const contentNode = Node.fromJSON(schema, doc)

  // Mirrors the TableOfContents plugin's appendTransaction in `plugin.ts`:
  // an anchor node gets a fresh id when its `data-toc-id` is missing or
  // already seen earlier in the document. We track original ids — including
  // null — to match the plugin's behavior exactly.
  type Update = { pos: number; attrs: Record<string, unknown> }
  const updates: Update[] = []
  const existingIds: Array<string | null | undefined> = []

  contentNode.descendants((node, pos) => {
    if (!anchorTypes.includes(node.type.name) || node.textContent.length === 0) {
      return
    }

    const currentId = node.attrs['data-toc-id'] as string | null | undefined

    if (currentId == null || existingIds.includes(currentId)) {
      const id = getId(node.textContent)
      updates.push({ pos, attrs: { ...node.attrs, id, 'data-toc-id': id } })
    }

    existingIds.push(currentId)
  })

  const tr = EditorState.create({ doc: contentNode }).tr

  updates.forEach(({ pos, attrs }) => {
    tr.setNodeMarkup(pos, undefined, attrs)
  })

  return tr.doc.toJSON()
}
