import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { DOMParser, DOMSerializer, Schema } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Mark } from '../Mark.js'
import { getSchemaSpecByResolvedExtensions } from './getSchemaSpecByResolvedExtensions.js'
import { resolveExtensions } from './resolveExtensions.js'

describe('getSchemaSpecByResolvedExtensions', () => {
  it('allows replacing local structure before schema validation', () => {
    const extensions = resolveExtensions([
      Document.extend({ content: 'remoteBlock+' }),
      Paragraph,
      Text,
    ])
    const spec = getSchemaSpecByResolvedExtensions(extensions)

    expect(() => new Schema(spec)).toThrow('remoteBlock')

    const schema = new Schema({
      ...spec,
      nodes: {
        ...spec.nodes,
        doc: { content: 'paragraph+' },
      },
    })

    expect(schema.topNodeType.createAndFill()?.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    })
  })

  it('preserves node and mark attribute parsing and rendering', () => {
    const Note = Paragraph.extend({
      addAttributes() {
        return {
          label: {
            default: 'note',
            parseHTML: element => element.getAttribute('data-label'),
            renderHTML: attributes => ({ 'data-label': attributes.label }),
          },
        }
      },
    })
    const Highlight = Mark.create({
      name: 'highlight',
      addAttributes() {
        return {
          color: {
            default: 'yellow',
            parseHTML: element => element.getAttribute('data-color'),
            renderHTML: attributes => ({ 'data-color': attributes.color }),
          },
        }
      },
      parseHTML() {
        return [{ tag: 'mark' }]
      },
      renderHTML({ HTMLAttributes }) {
        return ['mark', HTMLAttributes, 0]
      },
    })
    const extensions = resolveExtensions([Document, Text, Note, Highlight])
    const schema = new Schema(getSchemaSpecByResolvedExtensions(extensions))
    const input = document.createElement('div')
    input.innerHTML = '<p data-label="hello"><mark data-color="blue">Hello</mark></p>'

    const content = DOMParser.fromSchema(schema).parse(input)

    expect(content.firstChild?.attrs.label).toBe('hello')
    expect(content.firstChild?.firstChild?.marks[0].attrs.color).toBe('blue')

    const output = document.createElement('div')
    output.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(content.content))

    expect(output.innerHTML).toBe(input.innerHTML)
  })

  it('preserves the editor context for schema callbacks', () => {
    const editor = new Editor({ extensions: [Document, Paragraph, Text] })

    try {
      const ContextParagraph = Paragraph.extend({
        group() {
          expect(this.editor).toBe(editor)
          return 'block'
        },
      })
      const extensions = resolveExtensions([Document, ContextParagraph, Text])
      const schema = new Schema(getSchemaSpecByResolvedExtensions(extensions, editor))

      expect(schema.nodes.paragraph.isInGroup('block')).toBe(true)
    } finally {
      editor.destroy()
    }
  })
})
