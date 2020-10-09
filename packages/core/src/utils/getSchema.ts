import deepmerge from 'deepmerge'
import { NodeSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import getTopNodeFromExtensions from './getTopNodeFromExtensions'
import getNodesFromExtensions from './getNodesFromExtensions'
import getMarksFromExtensions from './getMarksFromExtensions'
import resolveExtensionConfig from './resolveExtensionConfig'
import Node from '../Node'
import Mark from '../Mark'
import Extension from '../Extension'

export default function getSchema(extensions: Extensions): Schema {
  const baseExtensions = extensions.filter(extension => extension.type === 'extension') as Extension[]
  const nodeExtensions = extensions.filter(extension => extension.type === 'node') as Node[]
  const markExtensions = extensions.filter(extension => extension.type === 'mark') as Mark[]

  const nodes = Object.fromEntries(nodeExtensions.map(node => {
    return [
      node.name,
      {
        content: node.content,
        group: node.group,
        parseDOM: node.parseHTML(),
        toDOM: node.renderHTML,
      } as unknown as NodeSpec,
    ]
  }))

  console.log({ nodes })

  const topNode = nodeExtensions.find(extension => extension.topNode)?.name

  // extensions.forEach(extension => {
  //   resolveExtensionConfig(extension, 'name')
  //   resolveExtensionConfig(extension, 'defaults')
  //   resolveExtensionConfig(extension, 'topNode')

  //   const { name } = extension.config
  //   const options = {
  //     ...extension.config.defaults,
  //     ...extension.options,
  //   }

  //   resolveExtensionConfig(extension, 'schema', { name, options })
  // })

  // return new Schema({
  //   topNode: getTopNodeFromExtensions(extensions),
  //   nodes: getNodesFromExtensions(extensions),
  //   marks: getMarksFromExtensions(extensions),
  // })

  return new Schema({
    topNode,
    nodes,
    marks: {},
    // topNode: getTopNodeFromExtensions(extensions),
    // nodes: getNodesFromExtensions(extensions),
    // marks: getMarksFromExtensions(extensions),
  })
}
