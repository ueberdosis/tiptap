/// <reference types="cypress" />

import { Editor, Mark, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

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
    expect(nodeType.spec.attrs?.requiredAttr).to.not.equal(undefined)
    expect(nodeType.spec.attrs?.requiredAttr).to.not.have.property('default')

    // Check that the optional attribute has a default
    expect(nodeType.spec.attrs?.optionalAttr).to.not.equal(undefined)
    expect(nodeType.spec.attrs?.optionalAttr).to.have.property('default')

    editor.destroy()
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
    expect(markType?.spec.attrs?.requiredAttr).to.not.equal(undefined)
    expect(markType?.spec.attrs?.requiredAttr).to.not.have.property('default')

    // Check that the optional attribute has a default
    expect(markType?.spec.attrs?.optionalAttr).to.not.equal(undefined)
    expect(markType?.spec.attrs?.optionalAttr).to.have.property('default')
    expect(markType?.spec.attrs?.optionalAttr.default).to.equal('test')

    editor.destroy()
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
    expect(nodeType.spec.attrs?.attrWithNull).to.have.property('default', null)
    expect(nodeType.spec.attrs?.attrWithValue).to.have.property('default', 'defaultValue')
    expect(nodeType.spec.attrs?.attrWithZero).to.have.property('default', 0)
    expect(nodeType.spec.attrs?.attrWithFalse).to.have.property('default', false)
    expect(nodeType.spec.attrs?.attrWithUndefined).to.have.property('default', undefined)

    editor.destroy()
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
    expect(nodeType.spec.attrs?.validatedAttr).to.have.property('validate')
    expect(nodeType.spec.attrs?.validatedAttr.validate).to.be.a('function')

    // Check that the non-validated attribute does not have a validate property
    expect(nodeType.spec.attrs?.nonValidatedAttr).to.not.have.property('validate')

    editor.destroy()
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
    expect(nodeType.spec.attrs?.strictAttr).to.not.equal(undefined)
    expect(nodeType.spec.attrs?.strictAttr).to.not.have.property('default')
    expect(nodeType.spec.attrs?.strictAttr).to.have.property('validate')

    editor.destroy()
  })
})
