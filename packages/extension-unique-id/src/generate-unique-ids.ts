import type { Extensions, JSONContent } from '@dibdab/core'
import { findChildren, getSchema } from '@dibdab/core'
import { Node } from '@dibdab/pm/model'
import { EditorState } from '@dibdab/pm/state'

import type { UniqueID } from './unique-id.js'

/**
 * Creates a new document with unique IDs added to the nodes. Does the same
 * thing as the UniqueID extension, but without the need to create an `Editor`
 * instance. This lets you add unique IDs to the document in the server.
 *
 * When you call it, include the `UniqueID` extension in the `extensions` array.
 * The configuration from the `UniqueID` extension will be picked up
 * automatically, including its configuration options like `types` and
 * `attributeName`.
 *
 * @see `UniqueID` extension for more information.
 *
 * @throws {Error} If the `UniqueID` extension is not found in the extensions array.
 *
 * @example
 * const doc = {
 *   type: 'doc',
 *   content: [
 *     { type: 'paragraph', content: [{ type: 'text', text: 'Hello, world!' }] }
 *   ]
 * }
 * const newDoc = addUniqueIds(doc, [StarterKit, UniqueID.configure({ types: ['paragraph', 'heading'] })])
 * console.log(newDoc)
 * // Result:
 * // {
 * //   type: 'doc',
 * //   content: [
 * //     { type: 'paragraph', content: [{ type: 'text', text: 'Hello, world!' }], id: '123' }
 * //   ]
 * // }
 *
 * @param doc - A Tiptap JSON document to add unique IDs to.
 * @param extensions - The extensions to use. Must include the `UniqueID` extension.
 * @returns The updated Tiptap JSON document, with the unique IDs added to the nodes.
 */
export function generateUniqueIds(doc: JSONContent, extensions: Extensions): JSONContent {
  // Find the UniqueID extension in the extensions array. If it's not found, throw an error.
  const uniqueIDExtension = extensions.find(ext => ext.name === 'uniqueID') as typeof UniqueID | undefined
  if (!uniqueIDExtension) {
    throw new Error('UniqueID extension not found in the extensions array')
  }
  const { types, attributeName, generateID } = uniqueIDExtension.options

  // Convert the JSON content to a ProseMirror node
  const schema = getSchema([...extensions.filter(ext => ext.name !== 'uniqueID'), uniqueIDExtension])
  const contentNode = Node.fromJSON(schema, doc)

  // Find nodes that don't have a unique ID
  const nodesWithoutId = findChildren(contentNode, node => {
    return !node.attrs[attributeName] && types.includes(node.type.name)
  })

  // Edit the document to add unique IDs to the nodes that don't have a unique ID
  let tr = EditorState.create({
    doc: contentNode,
  }).tr
  // eslint-disable-next-line no-restricted-syntax
  for (const { node, pos } of nodesWithoutId) {
    tr = tr.setNodeAttribute(pos, attributeName, generateID({ node, pos }))
  }

  // Return the updated document
  return tr.doc.toJSON()
}
