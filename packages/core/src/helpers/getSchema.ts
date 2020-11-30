import { NodeSpec, MarkSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import splitExtensions from './splitExtensions'
import getAttributesFromExtensions from './getAttributesFromExtensions'
import getRenderedAttributes from './getRenderedAttributes'
import isEmptyObject from '../utilities/isEmptyObject'
import injectExtensionAttributesToParseRule from './injectExtensionAttributesToParseRule'
import callOrReturn from '../utilities/callOrReturn'

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
  const topNode = nodeExtensions.find(extension => extension.config.topNode)?.config.name

  const nodes = Object.fromEntries(nodeExtensions.map(extension => {
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.config.name)
    const context = { options: extension.options }
    const schema: NodeSpec = cleanUpSchemaItem({
      content: callOrReturn(extension.config.content, context),
      marks: callOrReturn(extension.config.marks, context),
      group: callOrReturn(extension.config.group, context),
      inline: callOrReturn(extension.config.inline, context),
      atom: callOrReturn(extension.config.atom, context),
      selectable: callOrReturn(extension.config.selectable, context),
      draggable: callOrReturn(extension.config.draggable, context),
      code: callOrReturn(extension.config.code, context),
      defining: callOrReturn(extension.config.defining, context),
      isolating: callOrReturn(extension.config.isolating, context),
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    if (extension.config.parseHTML) {
      schema.parseDOM = extension.config.parseHTML
        .bind(context)()
        ?.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    if (extension.config.renderHTML) {
      schema.toDOM = node => (extension.config.renderHTML as Function)?.bind(context)({
        node,
        HTMLAttributes: getRenderedAttributes(node, extensionAttributes),
      })
    }

    return [extension.config.name, schema]
  }))

  const marks = Object.fromEntries(markExtensions.map(extension => {
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.config.name)
    const context = { options: extension.options }
    const schema: MarkSpec = cleanUpSchemaItem({
      inclusive: callOrReturn(extension.config.inclusive, context),
      excludes: callOrReturn(extension.config.excludes, context),
      group: callOrReturn(extension.config.group, context),
      spanning: callOrReturn(extension.config.spanning, context),
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    if (extension.config.parseHTML) {
      schema.parseDOM = extension.config.parseHTML
        .bind(context)()
        ?.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    if (extension.config.renderHTML) {
      schema.toDOM = mark => (extension.config.renderHTML as Function)?.bind(context)({
        mark,
        HTMLAttributes: getRenderedAttributes(mark, extensionAttributes),
      })
    }

    return [extension.config.name, schema]
  }))

  return new Schema({
    topNode,
    nodes,
    marks,
  })
}
