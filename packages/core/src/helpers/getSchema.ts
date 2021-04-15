import { NodeSpec, MarkSpec, Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import { ExtensionConfig, NodeConfig, MarkConfig } from '..'
import splitExtensions from './splitExtensions'
import getAttributesFromExtensions from './getAttributesFromExtensions'
import getRenderedAttributes from './getRenderedAttributes'
import isEmptyObject from '../utilities/isEmptyObject'
import injectExtensionAttributesToParseRule from './injectExtensionAttributesToParseRule'
import callOrReturn from '../utilities/callOrReturn'
import getExtensionField from './getExtensionField'

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
  const nodeSchemaExtenders: (
    | ExtensionConfig['extendNodeSchema']
    | NodeConfig['extendNodeSchema']
    | MarkConfig['extendNodeSchema']
  )[] = []
  const markSchemaExtenders: (
    | ExtensionConfig['extendNodeSchema']
    | NodeConfig['extendNodeSchema']
    | MarkConfig['extendNodeSchema']
  )[] = []

  extensions.forEach(extension => {
    if (typeof extension.config.extendNodeSchema === 'function') {
      nodeSchemaExtenders.push(extension.config.extendNodeSchema)
    }

    if (typeof extension.config.extendMarkSchema === 'function') {
      markSchemaExtenders.push(extension.config.extendMarkSchema)
    }
  })

  const nodes = Object.fromEntries(nodeExtensions.map(extension => {
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.config.name)
    const context = {
      options: extension.options,
    }

    const extraNodeFields = nodeSchemaExtenders.reduce((fields, nodeSchemaExtender) => {
      const extraFields = callOrReturn(nodeSchemaExtender, context, extension)

      return {
        ...fields,
        ...extraFields,
      }
    }, {})

    const schema: NodeSpec = cleanUpSchemaItem({
      ...extraNodeFields,
      content: callOrReturn(getExtensionField<NodeConfig['content']>(extension, 'content', context)),
      marks: callOrReturn(getExtensionField<NodeConfig['marks']>(extension, 'marks', context)),
      group: callOrReturn(getExtensionField<NodeConfig['group']>(extension, 'group', context)),
      inline: callOrReturn(getExtensionField<NodeConfig['inline']>(extension, 'inline', context)),
      atom: callOrReturn(getExtensionField<NodeConfig['atom']>(extension, 'atom', context)),
      selectable: callOrReturn(getExtensionField<NodeConfig['selectable']>(extension, 'selectable', context)),
      draggable: callOrReturn(getExtensionField<NodeConfig['draggable']>(extension, 'draggable', context)),
      code: callOrReturn(getExtensionField<NodeConfig['code']>(extension, 'code', context)),
      defining: callOrReturn(getExtensionField<NodeConfig['defining']>(extension, 'defining', context)),
      isolating: callOrReturn(getExtensionField<NodeConfig['isolating']>(extension, 'isolating', context)),
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    const parseHTML = callOrReturn(getExtensionField<NodeConfig['parseHTML']>(extension, 'parseHTML', context))

    if (parseHTML) {
      schema.parseDOM = parseHTML
        .map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    const renderHTML = getExtensionField<NodeConfig['renderHTML']>(extension, 'renderHTML', context)

    if (renderHTML) {
      schema.toDOM = node => renderHTML({
        node,
        HTMLAttributes: getRenderedAttributes(node, extensionAttributes),
      })
    }

    return [extension.config.name, schema]
  }))

  const marks = Object.fromEntries(markExtensions.map(extension => {
    const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.config.name)
    const context = {
      options: extension.options,
    }

    const extraMarkFields = markSchemaExtenders.reduce((fields, markSchemaExtender) => {
      const extraFields = callOrReturn(markSchemaExtender, context, extension)

      return {
        ...fields,
        ...extraFields,
      }
    }, {})

    const schema: MarkSpec = cleanUpSchemaItem({
      ...extraMarkFields,
      inclusive: callOrReturn(getExtensionField<NodeConfig['inclusive']>(extension, 'inclusive', context)),
      excludes: callOrReturn(getExtensionField<NodeConfig['excludes']>(extension, 'excludes', context)),
      group: callOrReturn(getExtensionField<NodeConfig['group']>(extension, 'group', context)),
      spanning: callOrReturn(getExtensionField<NodeConfig['spanning']>(extension, 'spanning', context)),
      attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
        return [extensionAttribute.name, { default: extensionAttribute?.attribute?.default }]
      })),
    })

    const parseHTML = callOrReturn(getExtensionField<MarkConfig['parseHTML']>(extension, 'parseHTML', context))

    if (parseHTML) {
      schema.parseDOM = parseHTML
        .map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes))
    }

    const renderHTML = getExtensionField<MarkConfig['renderHTML']>(extension, 'renderHTML', context)

    if (renderHTML) {
      schema.toDOM = mark => renderHTML({
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
