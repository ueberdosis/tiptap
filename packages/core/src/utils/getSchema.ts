import { NodeSpec, MarkSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
// import getTopNodeFromExtensions from './getTopNodeFromExtensions'
// import getNodesFromExtensions from './getNodesFromExtensions'
// import getMarksFromExtensions from './getMarksFromExtensions'
// import resolveExtensionConfig from './resolveExtensionConfig'
import splitExtensions from './splitExtensions'

export default function getSchema(extensions: Extensions): Schema {
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)

  const topNode = nodeExtensions.find(extension => extension.topNode)?.name

  const nodes = Object.fromEntries(nodeExtensions.map(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = {
      class: 'test',
    }

    const schema: NodeSpec = {
      content: extension.content,
      marks: extension.marks,
      group: extension.group,
      inline: extension.inline,
      atom: extension.atom,
      selectable: extension.selectable,
      draggable: extension.draggable,
      code: extension.code,
      defining: extension.defining,
      isolating: extension.isolating,
      parseDOM: extension.parseHTML.bind(context)(),
      toDOM: node => extension.renderHTML.bind(context)({ node, attributes }),
    }

    return [extension.name, schema]
  }))

  const marks = Object.fromEntries(markExtensions.map(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = {
      class: 'test',
    }

    const schema: MarkSpec = {
      inclusive: extension.inclusive,
      excludes: extension.excludes,
      group: extension.group,
      spanning: extension.spanning,
      parseDOM: extension.parseHTML.bind(context)(),
      toDOM: node => extension.renderHTML.bind(context)({ node, attributes }),
    }

    return [extension.name, schema]
  }))

  return new Schema({
    topNode,
    nodes,
    marks,
  })
}
