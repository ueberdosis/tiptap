import { NodeSpec, MarkSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import splitExtensions from './splitExtensions'
import getAttributesFromExtensions from './getAttributesFromExtensions'
import getRenderedAttributes from './getRenderedAttributes'
import isEmptyObject from './isEmptyObject'
import injectExtensionAttributesToParseRule from './injectExtensionAttributesToParseRule'

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
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name)
    const context = { options: extension.options }
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
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    if (extension.parseHTML) {
      schema.parseDOM = extension.parseHTML
        .bind(context)()
        ?.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    if (extension.renderHTML) {
      schema.toDOM = node => (extension.renderHTML as Function)?.bind(context)({
        node,
        attributes: getRenderedAttributes(node, extensionAttributes),
      })
    }

    return [extension.name, schema]
  }))

  const marks = Object.fromEntries(markExtensions.map(extension => {
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name)
    const context = { options: extension.options }
    const schema: MarkSpec = cleanUpSchemaItem({
      inclusive: extension.inclusive,
      excludes: extension.excludes,
      group: extension.group,
      spanning: extension.spanning,
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    if (extension.parseHTML) {
      schema.parseDOM = extension.parseHTML
        .bind(context)()
        ?.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    if (extension.renderHTML) {
      schema.toDOM = mark => (extension.renderHTML as Function)?.bind(context)({
        mark,
        attributes: getRenderedAttributes(mark, extensionAttributes),
      })
    }

    return [extension.name, schema]
  }))

  return new Schema({
    topNode,
    nodes,
    marks,
  })
}
