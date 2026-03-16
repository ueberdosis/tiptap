import type { MarkSpec, NodeSpec, TagParseRule } from '@tiptap/pm/model'
import { Schema } from '@tiptap/pm/model'

import type { Editor, MarkConfig, NodeConfig } from '../index.js'
import type { AnyConfig, Extensions } from '../types.js'
import { callOrReturn } from '../utilities/callOrReturn.js'
import { isEmptyObject } from '../utilities/isEmptyObject.js'
import { getAttributesFromExtensions } from './getAttributesFromExtensions.js'
import { getExtensionField } from './getExtensionField.js'
import { getRenderedAttributes } from './getRenderedAttributes.js'
import { injectExtensionAttributesToParseRule } from './injectExtensionAttributesToParseRule.js'
import { splitExtensions } from './splitExtensions.js'

function cleanUpSchemaItem<T>(data: T) {
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(data).filter(([key, value]) => {
      if (key === 'attrs' && isEmptyObject(value as object | undefined)) {
        return false
      }

      return value !== null && value !== undefined
    }),
  ) as T
}

/**
 * Builds an attribute spec tuple for ProseMirror schema from an extension attribute.
 * @param extensionAttribute The extension attribute to build the spec for
 * @returns A tuple of [attributeName, spec]
 */
function buildAttributeSpec(
  extensionAttribute: ReturnType<typeof getAttributesFromExtensions>[number],
): [string, Record<string, any>] {
  const spec: Record<string, any> = {}

  // Only include 'default' if the attribute is not required and default is set on the attribute
  if (!extensionAttribute?.attribute?.isRequired && 'default' in (extensionAttribute?.attribute || {})) {
    spec.default = extensionAttribute.attribute.default
  }

  // Only include 'validate' if it's defined
  if (extensionAttribute?.attribute?.validate !== undefined) {
    spec.validate = extensionAttribute.attribute.validate
  }

  return [extensionAttribute.name, spec]
}

/**
 * Creates a new Prosemirror schema based on the given extensions.
 * @param extensions An array of Tiptap extensions
 * @param editor The editor instance
 * @returns A Prosemirror schema
 */
export function getSchemaByResolvedExtensions(extensions: Extensions, editor?: Editor): Schema {
  const allAttributes = getAttributesFromExtensions(extensions)
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)
  const topNode = nodeExtensions.find(extension => getExtensionField(extension, 'topNode'))?.name

  const nodes = Object.fromEntries(
    nodeExtensions.map(extension => {
      const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name)
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor,
      }

      const extraNodeFields = extensions.reduce((fields, e) => {
        const extendNodeSchema = getExtensionField<AnyConfig['extendNodeSchema']>(e, 'extendNodeSchema', context)

        return {
          ...fields,
          ...(extendNodeSchema ? extendNodeSchema(extension) : {}),
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
        whitespace: callOrReturn(getExtensionField<NodeConfig['whitespace']>(extension, 'whitespace', context)),
        linebreakReplacement: callOrReturn(
          getExtensionField<NodeConfig['linebreakReplacement']>(extension, 'linebreakReplacement', context),
        ),
        defining: callOrReturn(getExtensionField<NodeConfig['defining']>(extension, 'defining', context)),
        isolating: callOrReturn(getExtensionField<NodeConfig['isolating']>(extension, 'isolating', context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec)),
      })

      const parseHTML = callOrReturn(getExtensionField<NodeConfig['parseHTML']>(extension, 'parseHTML', context))

      if (parseHTML) {
        schema.parseDOM = parseHTML.map(parseRule =>
          injectExtensionAttributesToParseRule(parseRule, extensionAttributes),
        ) as TagParseRule[]
      }

      const renderHTML = getExtensionField<NodeConfig['renderHTML']>(extension, 'renderHTML', context)

      if (renderHTML) {
        schema.toDOM = node =>
          renderHTML({
            node,
            HTMLAttributes: getRenderedAttributes(node, extensionAttributes),
          })
      }

      const renderText = getExtensionField<NodeConfig['renderText']>(extension, 'renderText', context)

      if (renderText) {
        schema.toText = renderText
      }

      return [extension.name, schema]
    }),
  )

  const marks = Object.fromEntries(
    markExtensions.map(extension => {
      const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name)
      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor,
      }

      const extraMarkFields = extensions.reduce((fields, e) => {
        const extendMarkSchema = getExtensionField<AnyConfig['extendMarkSchema']>(e, 'extendMarkSchema', context)

        return {
          ...fields,
          ...(extendMarkSchema ? extendMarkSchema(extension as any) : {}),
        }
      }, {})

      const schema: MarkSpec = cleanUpSchemaItem({
        ...extraMarkFields,
        inclusive: callOrReturn(getExtensionField<MarkConfig['inclusive']>(extension, 'inclusive', context)),
        excludes: callOrReturn(getExtensionField<MarkConfig['excludes']>(extension, 'excludes', context)),
        group: callOrReturn(getExtensionField<MarkConfig['group']>(extension, 'group', context)),
        spanning: callOrReturn(getExtensionField<MarkConfig['spanning']>(extension, 'spanning', context)),
        code: callOrReturn(getExtensionField<MarkConfig['code']>(extension, 'code', context)),
        attrs: Object.fromEntries(extensionAttributes.map(buildAttributeSpec)),
      })

      const parseHTML = callOrReturn(getExtensionField<MarkConfig['parseHTML']>(extension, 'parseHTML', context))

      if (parseHTML) {
        schema.parseDOM = parseHTML.map(parseRule =>
          injectExtensionAttributesToParseRule(parseRule, extensionAttributes),
        )
      }

      const renderHTML = getExtensionField<MarkConfig['renderHTML']>(extension, 'renderHTML', context)

      if (renderHTML) {
        schema.toDOM = mark =>
          renderHTML({
            mark,
            HTMLAttributes: getRenderedAttributes(mark, extensionAttributes),
          })
      }

      return [extension.name, schema]
    }),
  )

  return new Schema({
    topNode,
    nodes,
    marks,
  })
}
