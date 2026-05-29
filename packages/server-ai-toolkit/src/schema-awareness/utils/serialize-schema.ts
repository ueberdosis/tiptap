import type { AttributeSpec, MarkSpec, NodeSpec, Schema } from '@tiptap/pm/model'
import { omit } from 'es-toolkit'

/**
 * A serialized version of AttributeSpec where the validate function is converted to a string.
 * This allows the attribute specification to be JSON-serializable.
 */
export type SerializedAttributeSpec = Omit<AttributeSpec, 'validate'> & {
  validate?: string
}

/**
 * A type representing serialized attributes as a record of attribute names to their serialized specs.
 */
type SerializedAttributes = { attrs?: Record<string, SerializedAttributeSpec> }

/**
 * A serialized version of NodeSpec with non-serializable properties
 * (toDOM, parseDOM, toDebugString, leafText, toText) removed and attrs converted to
 * SerializedAttributeSpec format.
 */
export type SerializedNodeSpec = Omit<
  NodeSpec,
  'toDOM' | 'parseDOM' | 'toDebugString' | 'leafText' | 'toText' | 'attrs'
> &
  SerializedAttributes

/**
 * A serialized version of MarkSpec with non-serializable properties (toDOM, parseDOM) removed
 * and attrs converted to SerializedAttributeSpec format.
 */
export type SerializedMarkSpec = Omit<MarkSpec, 'toDOM' | 'parseDOM' | 'attrs'> &
  SerializedAttributes

/**
 * A JSON-serializable representation of a ProseMirror Schema.
 * Contains the top node name, and serialized node and mark specifications.
 */
export interface SerializedSchema {
  topNode?: string
  nodes: Record<string, SerializedNodeSpec>
  marks: Record<string, SerializedMarkSpec>
}

/**
 * Serializes an AttributeSpec by converting the validate function to a string if it exists.
 * This makes the attribute specification JSON-serializable.
 *
 * @param attributeSpec - The AttributeSpec to serialize
 * @returns A SerializedAttributeSpec with validate as a string or undefined
 */
function serializeAttributeSpec(attributeSpec: AttributeSpec): SerializedAttributeSpec {
  return {
    ...omit(attributeSpec, ['validate']),
    validate: typeof attributeSpec.validate === 'string' ? attributeSpec.validate : undefined,
  }
}

/**
 * Serializes a record of AttributeSpec objects by converting each one using serializeAttributeSpec.
 *
 * @param attributeSpecs - A record of attribute names to their AttributeSpec definitions
 * @returns A record of attribute names to their SerializedAttributeSpec definitions
 */
function serializeAttributeSpecs(
  attributeSpecs: Record<string, AttributeSpec>,
): Record<string, SerializedAttributeSpec> {
  return Object.fromEntries(
    Object.entries(attributeSpecs).map(([key, value]) => [key, serializeAttributeSpec(value)]),
  )
}

/**
 * Serializes a NodeSpec by removing non-serializable properties
 * (toDOM, parseDOM, toDebugString, leafText, toText) and converting the attrs to
 * SerializedAttributeSpec format.
 *
 * @param nodeSpec - The NodeSpec to serialize
 * @returns A SerializedNodeSpec with only JSON-serializable properties
 */
function serializeNodeSpec(nodeSpec: NodeSpec): SerializedNodeSpec {
  return {
    ...omit(nodeSpec, ['toDOM', 'parseDOM', 'toDebugString', 'leafText', 'toText', 'attrs']),
    attrs: nodeSpec.attrs ? serializeAttributeSpecs(nodeSpec.attrs) : undefined,
  }
}

/**
 * Serializes a MarkSpec by removing non-serializable properties (toDOM, parseDOM)
 * and converting the attrs to SerializedAttributeSpec format.
 *
 * @param markSpec - The MarkSpec to serialize
 * @returns A SerializedMarkSpec with only JSON-serializable properties
 */
function serializeMarkSpec(markSpec: MarkSpec): SerializedMarkSpec {
  return {
    ...omit(markSpec, ['toDOM', 'parseDOM', 'attrs']),
    attrs: markSpec.attrs ? serializeAttributeSpecs(markSpec.attrs) : undefined,
  }
}

/**
 * Serializes a ProseMirror Schema to a JSON-serializable format.
 * Converts all node and mark specifications by removing non-serializable properties
 * and converting attribute validation functions to strings.
 *
 * Non-serializable properties are properties related to DOM serialization and parsing,
 * and functions that validate attribute values. These are just removed from the schema.
 *
 * @param schema - The ProseMirror Schema to serialize
 * @returns A SerializedSchema containing the top node name and serialized node/mark specs
 */
export function serializeSchema(schema: Schema): SerializedSchema {
  return {
    topNode: schema.spec.topNode,
    nodes: Object.fromEntries(
      Object.values(schema.nodes).map(node => [node.name, serializeNodeSpec(node.spec)]),
    ),
    marks: Object.fromEntries(
      Object.values(schema.marks).map(mark => [mark.name, serializeMarkSpec(mark.spec)]),
    ),
  }
}
