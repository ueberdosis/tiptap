import { Extension, Mark, Node } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { getAttributesFromExtensions } from '../src/helpers/getAttributesFromExtensions.js'

describe('getAttributesFromExtensions', () => {
  describe('node attributes', () => {
    it('should extract attributes from node extensions', () => {
      const CustomNode = Node.create({
        name: 'customNode',
        addAttributes() {
          return {
            foo: {
              default: 'bar',
            },
          }
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode])

      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'customNode',
          name: 'foo',
          attribute: expect.objectContaining({
            default: 'bar',
          }),
        }),
      )
    })

    it('should merge default attribute values', () => {
      const CustomNode = Node.create({
        name: 'customNode',
        addAttributes() {
          return {
            foo: {
              default: 'bar',
            },
          }
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode])
      const fooAttr = attributes.find(a => a.name === 'foo')

      expect(fooAttr?.attribute).toMatchObject({
        default: 'bar',
        rendered: true,
        renderHTML: null,
        parseHTML: null,
        keepOnSplit: true,
        isRequired: false,
      })
    })

    it('should handle function defaults', () => {
      const CustomNode = Node.create({
        name: 'customNode',
        addAttributes() {
          return {
            foo: {
              default: () => 'computed',
            },
          }
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode])
      const fooAttr = attributes.find(a => a.name === 'foo')

      expect(fooAttr?.attribute.default).toBe('computed')
    })

    it('should handle required attributes without default', () => {
      const CustomNode = Node.create({
        name: 'customNode',
        addAttributes() {
          return {
            requiredAttr: {
              isRequired: true,
              default: undefined,
            },
          }
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode])
      const requiredAttr = attributes.find(a => a.name === 'requiredAttr')

      expect(requiredAttr?.attribute.isRequired).toBe(true)
      expect(requiredAttr?.attribute).not.toHaveProperty('default')
    })
  })

  describe('mark attributes', () => {
    it('should extract attributes from mark extensions', () => {
      const CustomMark = Mark.create({
        name: 'customMark',
        addAttributes() {
          return {
            color: {
              default: 'red',
            },
          }
        },
      })

      const attributes = getAttributesFromExtensions([CustomMark])

      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'customMark',
          name: 'color',
          attribute: expect.objectContaining({
            default: 'red',
          }),
        }),
      )
    })
  })

  describe('global attributes with types', () => {
    it('should apply global attributes to specified types', () => {
      const CustomNode = Node.create({
        name: 'customNode',
      })

      const AnotherNode = Node.create({
        name: 'anotherNode',
      })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: ['customNode'],
              attributes: {
                globalAttr: {
                  default: 'global',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode, AnotherNode, GlobalExtension])

      // Should have the global attribute for customNode
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'customNode',
          name: 'globalAttr',
          attribute: expect.objectContaining({
            default: 'global',
          }),
        }),
      )

      // Should NOT have the global attribute for anotherNode
      const anotherNodeAttrs = attributes.filter(a => a.type === 'anotherNode')
      expect(anotherNodeAttrs.find(a => a.name === 'globalAttr')).toBeUndefined()
    })

    it('should apply global attributes to multiple types', () => {
      const NodeA = Node.create({ name: 'nodeA' })
      const NodeB = Node.create({ name: 'nodeB' })
      const NodeC = Node.create({ name: 'nodeC' })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: ['nodeA', 'nodeB'],
              attributes: {
                sharedAttr: {
                  default: 'shared',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([NodeA, NodeB, NodeC, GlobalExtension])

      // Should have the attribute for nodeA and nodeB
      expect(attributes).toContainEqual(expect.objectContaining({ type: 'nodeA', name: 'sharedAttr' }))
      expect(attributes).toContainEqual(expect.objectContaining({ type: 'nodeB', name: 'sharedAttr' }))

      // Should NOT have the attribute for nodeC
      const nodeCAttrs = attributes.filter(a => a.type === 'nodeC')
      expect(nodeCAttrs.find(a => a.name === 'sharedAttr')).toBeUndefined()
    })
  })

  describe('global attributes with shorthand types', () => {
    it('should apply global attributes to all nodes and marks when types is "*"', () => {
      const NodeA = Node.create({ name: 'nodeA' })
      const NodeB = Node.create({ name: 'nodeB' })
      const CustomMark = Mark.create({ name: 'customMark' })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: '*',
              attributes: {
                universalAttr: {
                  default: 'universal',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([NodeA, NodeB, CustomMark, GlobalExtension])

      // Should have the attribute for both nodes and mark
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'nodeA',
          name: 'universalAttr',
          attribute: expect.objectContaining({ default: 'universal' }),
        }),
      )
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'nodeB',
          name: 'universalAttr',
          attribute: expect.objectContaining({ default: 'universal' }),
        }),
      )
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'customMark',
          name: 'universalAttr',
          attribute: expect.objectContaining({ default: 'universal' }),
        }),
      )
    })

    it('should apply global attributes to all nodes when types is "nodes"', () => {
      const TextNode = Node.create({ name: 'text' })
      const ParagraphNode = Node.create({ name: 'paragraph' })
      const HeadingNode = Node.create({ name: 'heading' })
      const CustomMark = Mark.create({ name: 'customMark' })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: 'nodes',
              attributes: {
                nodeAttr: {
                  default: 'nodeValue',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([
        TextNode,
        ParagraphNode,
        HeadingNode,
        CustomMark,
        GlobalExtension,
      ])

      // Should NOT have the attribute for text node
      const textAttrs = attributes.filter(a => a.type === 'text')
      expect(textAttrs.find(a => a.name === 'nodeAttr')).toBeUndefined()

      // Should have the attribute for other nodes
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'paragraph',
          name: 'nodeAttr',
        }),
      )
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'heading',
          name: 'nodeAttr',
        }),
      )

      // Should NOT have the attribute for marks
      const markAttrs = attributes.filter(a => a.type === 'customMark')
      expect(markAttrs.find(a => a.name === 'nodeAttr')).toBeUndefined()
    })

    it('should apply global attributes to all marks when types is "marks"', () => {
      const CustomNode = Node.create({ name: 'customNode' })
      const BoldMark = Mark.create({ name: 'bold' })
      const ItalicMark = Mark.create({ name: 'italic' })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: 'marks',
              attributes: {
                markAttr: {
                  default: 'markValue',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode, BoldMark, ItalicMark, GlobalExtension])

      // Should have the attribute for marks
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'bold',
          name: 'markAttr',
        }),
      )
      expect(attributes).toContainEqual(
        expect.objectContaining({
          type: 'italic',
          name: 'markAttr',
        }),
      )

      // Should NOT have the attribute for nodes
      const nodeAttrs = attributes.filter(a => a.type === 'customNode')
      expect(nodeAttrs.find(a => a.name === 'markAttr')).toBeUndefined()
    })
  })

  describe('combining node and global attributes', () => {
    it('should include both node-specific and global attributes', () => {
      const CustomNode = Node.create({
        name: 'customNode',
        addAttributes() {
          return {
            nodeAttr: {
              default: 'nodeValue',
            },
          }
        },
      })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: ['customNode'],
              attributes: {
                globalAttr: {
                  default: 'globalValue',
                },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([CustomNode, GlobalExtension])

      const customNodeAttrs = attributes.filter(a => a.type === 'customNode')

      expect(customNodeAttrs).toHaveLength(2)
      expect(customNodeAttrs).toContainEqual(
        expect.objectContaining({ name: 'nodeAttr', attribute: expect.objectContaining({ default: 'nodeValue' }) }),
      )
      expect(customNodeAttrs).toContainEqual(
        expect.objectContaining({ name: 'globalAttr', attribute: expect.objectContaining({ default: 'globalValue' }) }),
      )
    })
  })

  describe('extensions without attributes', () => {
    it('should handle extensions without addAttributes', () => {
      const SimpleNode = Node.create({
        name: 'simpleNode',
      })

      const attributes = getAttributesFromExtensions([SimpleNode])

      const simpleNodeAttrs = attributes.filter(a => a.type === 'simpleNode')
      expect(simpleNodeAttrs).toHaveLength(0)
    })

    it('should handle extensions without addGlobalAttributes', () => {
      const SimpleExtension = Extension.create({
        name: 'simpleExtension',
      })

      const attributes = getAttributesFromExtensions([SimpleExtension])

      expect(attributes).toHaveLength(0)
    })
  })

  describe('multiple global attribute definitions', () => {
    it('should handle multiple global attribute groups', () => {
      const NodeA = Node.create({ name: 'nodeA' })
      const NodeB = Node.create({ name: 'nodeB' })

      const GlobalExtension = Extension.create({
        name: 'globalExtension',
        addGlobalAttributes() {
          return [
            {
              types: ['nodeA'],
              attributes: {
                attrForA: { default: 'a' },
              },
            },
            {
              types: ['nodeB'],
              attributes: {
                attrForB: { default: 'b' },
              },
            },
            {
              types: ['nodeA', 'nodeB'],
              attributes: {
                sharedAttr: { default: 'shared' },
              },
            },
          ]
        },
      })

      const attributes = getAttributesFromExtensions([NodeA, NodeB, GlobalExtension])

      const nodeAAttrs = attributes.filter(a => a.type === 'nodeA')
      const nodeBAttrs = attributes.filter(a => a.type === 'nodeB')

      expect(nodeAAttrs).toContainEqual(expect.objectContaining({ name: 'attrForA' }))
      expect(nodeAAttrs).toContainEqual(expect.objectContaining({ name: 'sharedAttr' }))
      expect(nodeAAttrs).not.toContainEqual(expect.objectContaining({ name: 'attrForB' }))

      expect(nodeBAttrs).toContainEqual(expect.objectContaining({ name: 'attrForB' }))
      expect(nodeBAttrs).toContainEqual(expect.objectContaining({ name: 'sharedAttr' }))
      expect(nodeBAttrs).not.toContainEqual(expect.objectContaining({ name: 'attrForA' }))
    })
  })
})
