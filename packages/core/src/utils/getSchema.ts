import { NodeSpec, MarkSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import splitExtensions from './splitExtensions'
import getAttributesFromExtensions from './getAttributesFromExtensions'
import getRenderedAttributes from './getRenderedAttributes'
import isEmptyObject from './isEmptyObject'

function cleanUpSchemaItem<T>(data: T) {
  return Object.fromEntries(Object.entries(data).filter(([key, value]) => {
    if (key === 'attrs' && isEmptyObject(value)) {
      return false
    }

    return value !== null && value !== undefined
  })) as T
}

export default function getSchema(extensions: Extensions): Schema {
  const allAttributes = getAttributesFromExtensions(extensions)
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)
  const topNode = nodeExtensions.find(extension => extension.topNode)?.name

  const nodes = Object.fromEntries(nodeExtensions.map(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = allAttributes.filter(attribute => attribute.type === extension.name)

    const schema: NodeSpec = cleanUpSchemaItem({
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
      toDOM: node => {
        return extension.renderHTML.bind(context)({
          node,
          attributes: getRenderedAttributes(node, attributes),
        })
      },
      attrs: Object.fromEntries(attributes.map(attribute => {
        return [attribute.name, { default: attribute?.attribute?.default }]
      })),
    })

    return [extension.name, schema]
  }))

  const marks = Object.fromEntries(markExtensions.map(extension => {
    const context = {
      options: extension.options,
    }

    const attributes = allAttributes.filter(attribute => attribute.type === extension.name)

    const schema: MarkSpec = cleanUpSchemaItem({
      inclusive: extension.inclusive,
      excludes: extension.excludes,
      group: extension.group,
      spanning: extension.spanning,
      parseDOM: extension.parseHTML.bind(context)(),
      toDOM: mark => {
        return extension.renderHTML.bind(context)({
          mark,
          attributes: getRenderedAttributes(mark, attributes),
        })
      },
      attrs: Object.fromEntries(attributes.map(attribute => {
        return [attribute.name, { default: attribute?.attribute?.default }]
      })),
    })

    return [extension.name, schema]
  }))

  return new Schema({
    topNode,
    nodes,
    marks,
  })
}
