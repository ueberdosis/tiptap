import type { SchemaSpec } from '@tiptap/pm/model'
import { Schema } from '@tiptap/pm/model'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../../src/Editor.js'
import { Extension } from '../../src/Extension.js'
import { Mark } from '../../src/Mark.js'
import { Node } from '../../src/Node.js'

const editors: Editor[] = []

function createEditor(options: ConstructorParameters<typeof Editor>[0]) {
  const editor = new Editor(options)
  editors.push(editor)
  return editor
}

function schemaSpec(): SchemaSpec {
  return {
    nodes: {
      doc: { content: 'block+' },
      text: { group: 'inline' },
      paragraph: { group: 'block', content: 'inline*', marks: '' },
    },
  }
}

afterEach(() => {
  editors.splice(0).forEach(editor => editor.destroy())
})

describe('Editor schemaSpec', () => {
  it('replaces local structure before compiling local content expressions', () => {
    const editor = createEditor({
      extensions: [
        Document.extend({ content: 'missing+' }),
        Text,
        Paragraph.extend({ atom: true, isolating: true }),
      ],
      schemaSpec: schemaSpec(),
      content: '<p>Hello</p>',
    })

    expect(editor.schema.nodes.paragraph.isAtom).toBe(false)
    expect(editor.schema.nodes.paragraph.spec).not.toHaveProperty('isolating')
    expect(editor.schema.nodes.paragraph.spec.marks).toBe('')
    expect(editor.getHTML()).toBe('<p>Hello</p>')
    expect(editor.state.schema).toBe(editor.schema)
    expect(editor.extensionManager.schema).toBe(editor.schema)
  })

  it('keeps the existing behavior when schemaSpec is absent', () => {
    const editor = createEditor({
      extensions: [Document, Text, Paragraph.extend({ atom: true })],
    })

    expect(editor.schema.nodes.paragraph.isAtom).toBe(true)
  })

  it('preserves the external top node, including OrderedMap specs', () => {
    const root = Document.extend({ name: 'root' })
    const external = new Schema({
      nodes: {
        root: { content: 'block+' },
        paragraph: { group: 'block', content: 'text*' },
        text: {},
      },
      topNode: 'root',
    })
    const editor = createEditor({ extensions: [root, Paragraph, Text], schemaSpec: external.spec })

    expect(editor.schema.topNodeType.name).toBe('root')
    expect(editor.getJSON().type).toBe('root')
  })

  it('preserves external node and mark order instead of local priorities', () => {
    const first = Mark.create({ name: 'first', priority: 1000, renderHTML: () => ['strong', 0] })
    const second = Mark.create({ name: 'second', priority: 1, renderHTML: () => ['em', 0] })
    const editor = createEditor({
      extensions: [Document, Paragraph, Text, first, second],
      schemaSpec: {
        ...schemaSpec(),
        marks: { second: { inclusive: false, excludes: '' }, first: {} },
      },
    })

    const text = editor.schema.text('Hello', [
      editor.schema.marks.first.create(),
      editor.schema.marks.second.create(),
    ])
    expect(text.marks.map(mark => mark.type.name)).toEqual(['second', 'first'])
    expect(editor.schema.marks.second.spec.inclusive).toBe(false)
    expect(editor.schema.marks.second.spec.excludes).toBe('')
    expect(Object.keys(editor.schema.nodes)).toEqual(['doc', 'text', 'paragraph'])
  })

  it('keeps local rendering, parsing, text serialization and custom metadata', () => {
    const editor = createEditor({
      extensions: [
        Document,
        Text,
        Paragraph.extend({
          renderText: () => 'local text',
          extendNodeSchema: () => ({ localRole: 'paragraph' }),
        }),
      ],
      schemaSpec: {
        nodes: {
          doc: { content: 'block+' },
          text: {},
          paragraph: {
            group: 'block',
            content: 'text*',
            toDOM: () => ['aside', 0],
            parseDOM: [{ tag: 'aside' }],
          },
        },
      },
      content: '<p>Hello</p>',
    })

    expect(editor.getHTML()).toBe('<p>Hello</p>')
    expect(editor.getText()).toBe('local text')
    expect(editor.schema.nodes.paragraph.spec.localRole).toBe('paragraph')
  })

  it('uses external attributes for parsing, rendering, commands and splits', () => {
    const global = Extension.create({
      name: 'global',
      addGlobalAttributes: () => [
        {
          types: '*',
          attributes: {
            removed: { default: 'local' },
            label: { default: 'global', keepOnSplit: true },
          },
        },
      ],
    })
    const note = Paragraph.extend({
      addAttributes: () => ({
        label: {
          default: 'local',
          validate: () => {
            throw new Error('local validation')
          },
          keepOnSplit: false,
          parseHTML: element => element.getAttribute('data-label'),
          renderHTML: attributes => ({ 'data-label': attributes.label }),
        },
        required: { default: 'local' },
      }),
    })
    const spec: SchemaSpec = {
      nodes: {
        doc: { content: 'block*' },
        text: {},
        paragraph: {
          group: 'block',
          content: 'text*',
          attrs: {
            label: { default: 'remote', validate: 'string' },
            required: {},
            added: { default: 0 },
          },
        },
      },
    }
    const editor = createEditor({
      extensions: [Document, Text, note, global],
      schemaSpec: spec,
      content: '<p data-label="hello" required="yes" added="4" removed="local">Hello</p>',
    })

    expect(editor.getJSON().content?.[0].attrs).toEqual({
      label: 'hello',
      required: 'yes',
      added: 4,
    })
    expect(editor.getHTML()).toBe('<p data-label="hello" required="yes" added="4">Hello</p>')
    expect(editor.extensionManager.attributes.some(attribute => attribute.name === 'removed')).toBe(
      false,
    )
    expect(
      editor.extensionManager.attributes.find(attribute => attribute.name === 'label')?.attribute
        .keepOnSplit,
    ).toBe(false)
    expect(editor.schema.nodes.paragraph.spec.attrs?.required).not.toHaveProperty('default')
    expect(editor.schema.nodes.paragraph.create({ required: 'yes' }).attrs.label).toBe('remote')
    expect(() =>
      editor.schema.nodeFromJSON({ type: 'paragraph', attrs: { required: 'yes', label: 3 } }),
    ).toThrow()
  })

  it('resets attributes to external defaults when splitting at the end of a block', () => {
    const paragraph = Paragraph.extend({
      addAttributes: () => ({ label: { default: 'local', keepOnSplit: false } }),
    })
    const editor = createEditor({
      extensions: [Document, Text, paragraph],
      schemaSpec: {
        nodes: {
          doc: { content: 'block+' },
          text: {},
          paragraph: { group: 'block', content: 'text*', attrs: { label: { default: 'remote' } } },
        },
      },
      content: '<p label="hello">Hello</p>',
    })

    editor.commands.setTextSelection(6)
    expect(editor.commands.splitBlock()).toBe(true)
    expect(editor.getJSON().content?.[1].attrs?.label).toBe('remote')
  })

  it('uses the real editor context and the merged schema in extension hooks', () => {
    let context: Editor | undefined
    const paragraph = Paragraph.extend({
      group() {
        context = this.editor
        return 'block'
      },
      onBeforeCreate() {
        expect(this.editor.schema.nodes.paragraph.spec.atom).toBe(false)
      },
    })
    const editor = createEditor({
      extensions: [Document, Text, paragraph],
      schemaSpec: {
        nodes: {
          doc: { content: 'block+' },
          text: {},
          paragraph: { group: 'block', content: 'text*', atom: false },
        },
      },
    })

    expect(context).toBe(editor)
  })

  it('passes only external attributes to local node views', () => {
    let renderedAttributes: Record<string, unknown> | undefined
    const paragraph = Paragraph.extend({
      addAttributes: () => ({ label: { default: 'local' }, removed: { default: 'local' } }),
      addNodeView() {
        return ({ HTMLAttributes }) => {
          renderedAttributes = HTMLAttributes
          const dom = document.createElement('p')
          return { dom, contentDOM: dom }
        }
      },
    })
    createEditor({
      extensions: [Document, Text, paragraph],
      schemaSpec: {
        nodes: {
          doc: { content: 'block+' },
          text: {},
          paragraph: { group: 'block', content: 'text*', attrs: { label: { default: 'remote' } } },
        },
      },
    })

    expect(renderedAttributes).toEqual({ label: 'remote' })
  })

  it('uses external mark attributes with local HTML behavior', () => {
    const highlight = Mark.create({
      name: 'highlight',
      addAttributes: () => ({
        color: {
          default: 'local',
          parseHTML: element => element.getAttribute('data-color'),
          renderHTML: attributes => ({ 'data-color': attributes.color }),
        },
        removed: { default: 'local' },
      }),
      parseHTML: () => [{ tag: 'mark' }],
      renderHTML: ({ HTMLAttributes }) => ['mark', HTMLAttributes, 0],
    })
    const editor = createEditor({
      extensions: [Document, Paragraph, Text, highlight],
      schemaSpec: {
        nodes: {
          doc: { content: 'block+' },
          text: {},
          paragraph: { group: 'block', content: 'text*' },
        },
        marks: { highlight: { attrs: { color: { default: 'blue', validate: 'string' } } } },
      },
      content: '<p><mark data-color="red" removed="local">Hello</mark></p>',
    })

    expect(editor.schema.marks.highlight.create().attrs).toEqual({ color: 'blue' })
    expect(editor.getHTML()).toBe('<p><mark data-color="red">Hello</mark></p>')
    expect(() =>
      editor.schema.nodeFromJSON({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello', marks: [{ type: 'highlight', attrs: { color: 0 } }] },
        ],
      }),
    ).toThrow()
  })

  it.each<SchemaSpec>([
    { nodes: { doc: { content: 'missing+' }, text: {} } },
    { nodes: { doc: {} } },
    { nodes: { doc: { content: 'text*' }, text: {} }, topNode: 'missing' },
  ])('rejects invalid ProseMirror structure %#', spec => {
    expect(
      () => new Editor({ extensions: [Document, Paragraph, Text], schemaSpec: spec }),
    ).toThrow()
  })

  it.each(['atom', 'inline', 'isolating'])('rejects invalid %s values loaded from JSON', field => {
    const spec = JSON.parse(
      `{"nodes":{"doc":{"content":"paragraph*"},"text":{},"paragraph":{"content":"text*","${field}":"false"}}}`,
    )

    expect(
      () => new Editor({ extensions: [Document, Paragraph, Text], schemaSpec: spec }),
    ).toThrow()
  })

  it('rejects missing local implementations and extra local schema types', () => {
    expect(
      () =>
        new Editor({
          extensions: [Document, Paragraph, Text],
          schemaSpec: { ...schemaSpec(), marks: { bold: {} } },
        }),
    ).toThrow('bold')

    expect(
      () =>
        new Editor({
          extensions: [Document, Paragraph, Text, Mark.create({ name: 'extra' })],
          schemaSpec: schemaSpec(),
        }),
    ).toThrow('extra')

    const root = Node.create({ name: 'root', topNode: true })
    expect(
      () => new Editor({ extensions: [root, Paragraph, Text], schemaSpec: schemaSpec() }),
    ).toThrow('doc')
  })

  it('rejects node/mark mismatches and duplicate local schema types', () => {
    expect(
      () =>
        new Editor({
          extensions: [Document, Paragraph, Text, Mark.create({ name: 'image' })],
          schemaSpec: {
            nodes: {
              doc: { content: 'block+' },
              text: {},
              paragraph: { group: 'block', content: 'text*' },
              image: { inline: true },
            },
          },
        }),
    ).toThrow('image')

    expect(
      () =>
        new Editor({
          extensions: [Document, Paragraph, Text, Paragraph],
          schemaSpec: schemaSpec(),
        }),
    ).toThrow('paragraph')
  })
})
