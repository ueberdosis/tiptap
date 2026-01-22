import { Editor, Mark, Node } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { describe, expect, it } from 'vitest'

describe('Required Attributes', () => {
  it('should mark node attributes as required when isRequired is true and no default is set', () => {
    const CustomNode = Node.create({
      name: 'customNode',
      addAttributes() {
        return {
          requiredAttr: {
            isRequired: true,
            // No default value specified
          },
          optionalAttr: {
            default: null,
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomNode],
    })

    const schema = editor.schema
    const nodeType = schema.nodes.customNode

    // Check that the required attribute does not have a default
    expect(nodeType.spec.attrs?.requiredAttr).not.toEqual(undefined)
    expect(nodeType.spec.attrs?.requiredAttr).not.toHaveProperty('default')

    // Check that the optional attribute has a default
    expect(nodeType.spec.attrs?.optionalAttr).not.toEqual(undefined)
    expect(nodeType.spec.attrs?.optionalAttr).toHaveProperty('default')
  })

  it('should mark mark attributes as required when isRequired is true and no default is set', () => {
    const CustomMark = Mark.create({
      name: 'customMark',
      addAttributes() {
        return {
          requiredAttr: {
            isRequired: true,
            // No default value specified
          },
          optionalAttr: {
            default: 'test',
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomMark],
    })

    const schema = editor.schema
    const markType = schema.marks.customMark

    // Check that the required attribute does not have a default
    expect(markType?.spec.attrs?.requiredAttr).not.toEqual(undefined)
    expect(markType?.spec.attrs?.requiredAttr).not.toHaveProperty('default')

    // Check that the optional attribute has a default
    expect(markType?.spec.attrs?.optionalAttr).not.toEqual(undefined)
    expect(markType?.spec.attrs?.optionalAttr).toHaveProperty('default')
    expect(markType?.spec.attrs?.optionalAttr.default).toBe('test')
  })

  it('should not mark attributes as required when they have an explicit default value', () => {
    const CustomNode = Node.create({
      name: 'customNode',
      addAttributes() {
        return {
          attrWithNull: {
            default: null,
          },
          attrWithValue: {
            default: 'defaultValue',
          },
          attrWithZero: {
            default: 0,
          },
          attrWithFalse: {
            default: false,
          },
          attrWithUndefined: {
            default: undefined,
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomNode],
    })

    const schema = editor.schema
    const nodeType = schema.nodes.customNode

    // All attributes should have a default property
    expect(nodeType.spec.attrs?.attrWithNull).toHaveProperty('default', null)
    expect(nodeType.spec.attrs?.attrWithValue).toHaveProperty('default', 'defaultValue')
    expect(nodeType.spec.attrs?.attrWithZero).toHaveProperty('default', 0)
    expect(nodeType.spec.attrs?.attrWithFalse).toHaveProperty('default', false)
    expect(nodeType.spec.attrs?.attrWithUndefined).toHaveProperty('default', undefined)
  })

  it('should only include validate property when it is defined', () => {
    const CustomNode = Node.create({
      name: 'customNode',
      addAttributes() {
        return {
          validatedAttr: {
            default: null,
            validate: (value: any) => typeof value === 'string',
          },
          nonValidatedAttr: {
            default: null,
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomNode],
    })

    const schema = editor.schema
    const nodeType = schema.nodes.customNode

    // Check that the validated attribute has a validate property
    expect(nodeType.spec.attrs?.validatedAttr).toHaveProperty('validate')
    expect(nodeType.spec.attrs?.validatedAttr.validate).toBeTypeOf('function')

    // Check that the non-validated attribute does not have a validate property
    expect(nodeType.spec.attrs?.nonValidatedAttr).not.toHaveProperty('validate')
  })

  it('should handle attributes with isRequired and validate together', () => {
    const CustomNode = Node.create({
      name: 'customNode',
      addAttributes() {
        return {
          strictAttr: {
            isRequired: true,
            validate: (value: any) => value !== null,
          },
        }
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomNode],
    })

    const schema = editor.schema
    const nodeType = schema.nodes.customNode

    // Check that the attribute is required (no default) but has validation
    expect(nodeType.spec.attrs?.strictAttr).not.toEqual(undefined)
    expect(nodeType.spec.attrs?.strictAttr).not.toHaveProperty('default')
    expect(nodeType.spec.attrs?.strictAttr).toHaveProperty('validate')
  })
})
