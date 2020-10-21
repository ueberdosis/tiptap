import { NodeSpec, Schema } from 'prosemirror-model'

import { Extensions } from '../types'
import getTopNodeFromExtensions from './getTopNodeFromExtensions'
import getNodesFromExtensions from './getNodesFromExtensions'
import getMarksFromExtensions from './getMarksFromExtensions'
import resolveExtensionConfig from './resolveExtensionConfig'
import { NodeExtension } from '../Node'
import Mark from '../Mark'
import Extension from '../Extension'

export default function getSchema(extensions: Extensions): Schema {
  // const baseExtensions = extensions.filter(extension => extension.type === 'extension') as Extension[]
  const nodeExtensions = extensions.filter(extension => extension.type === 'node') as NodeExtension[]
  // const markExtensions = extensions.filter(extension => extension.type === 'mark') as Mark[]

  // console.log({ extensions })

  const nodes = Object.fromEntries(nodeExtensions.map(extension => {
    const schema: NodeSpec = {
      content: extension.content,
      group: extension.group,
      parseDOM: extension.parseHTML(),
      toDOM: node => extension.renderHTML({ node, attributes: { class: 'test' } }),
    }

    return [extension.name, schema]
  }))

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
  })
}
