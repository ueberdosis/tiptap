import { Schema } from 'prosemirror-model'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import * as Y from 'yjs'

import { ySyncPluginKey } from '../../plugins/keys.js'
import { createEmptyMeta } from '../conversion/createEmptyMeta.js'
import { yXmlFragmentToProsemirrorJSON } from '../conversion/yXmlFragmentToProsemirrorJSON.js'
import { updateYFragment } from './updateYFragment.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block*' },
    paragraph: {
      group: 'block',
      content: 'text*',
      attrs: { id: { default: null }, ychange: { default: null } },
    },
    heading: { group: 'block', content: 'text*' },
    text: {},
  },
})

const paragraph = (text: string) => schema.node('paragraph', null, text ? schema.text(text) : [])
const heading = (text: string) => schema.node('heading', null, schema.text(text))
const first = paragraph('First')
const second = paragraph('Second')
const inserted = paragraph('Inserted')

describe('updateYFragment', () => {
  const documents: Y.Doc[] = []

  afterEach(() => {
    documents.forEach(document => document.destroy())
    documents.length = 0
  })

  const createFragment = () => {
    const document = new Y.Doc()
    documents.push(document)

    return { document, fragment: document.getXmlFragment('prosemirror'), meta: createEmptyMeta() }
  }

  it.each([
    { name: 'updates text', before: [first], after: [inserted] },
    { name: 'inserts at the start', before: [first, second], after: [inserted, first, second] },
    {
      name: 'inserts between mapped children',
      before: [first, second],
      after: [first, inserted, second],
    },
    { name: 'inserts at the end', before: [first], after: [first, inserted] },
    { name: 'deletes the first child', before: [first, second], after: [second] },
    { name: 'deletes all children', before: [first, second], after: [] },
    { name: 'replaces a node type', before: [first], after: [heading('First')] },
    {
      name: 'matches the left child',
      before: [first, heading('Second')],
      after: [inserted, paragraph('Last')],
    },
    {
      name: 'matches the right child',
      before: [heading('First'), second],
      after: [inserted, paragraph('Last')],
    },
  ])('$name', ({ before, after }) => {
    const { document, fragment, meta } = createFragment()
    updateYFragment(document, fragment, schema.node('doc', null, before), meta)

    const next = schema.node('doc', null, after)
    updateYFragment(document, fragment, next, meta)

    expect(schema.nodeFromJSON(yXmlFragmentToProsemirrorJSON(fragment)).toJSON()).toEqual(
      next.toJSON(),
    )
  })

  it('preserves mapped children when inserting between them', () => {
    const { document, fragment, meta } = createFragment()
    updateYFragment(document, fragment, schema.node('doc', null, [first, second]), meta)
    const firstElement = fragment.get(0)
    const secondElement = fragment.get(1)

    updateYFragment(document, fragment, schema.node('doc', null, [first, inserted, second]), meta)

    expect(fragment.get(0)).toBe(firstElement)
    expect(fragment.get(2)).toBe(secondElement)
    expect(meta.mapping.get(firstElement)).toBe(first)
    expect(meta.mapping.get(secondElement)).toBe(second)
  })

  it('groups direct mapped-child updates in one sync transaction', () => {
    const { document, fragment, meta } = createFragment()
    updateYFragment(document, fragment, schema.node('doc', null, [first, second]), meta)
    const next = schema.node('doc', null, [first, inserted, second, heading('Last')])
    const updates: unknown[] = []
    document.on('update', (_update, origin) => {
      const content = schema.nodeFromJSON(yXmlFragmentToProsemirrorJSON(fragment)).toJSON()
      updates.push({ origin, content })
    })

    updateYFragment(document, fragment, next, meta)

    expect(updates).toHaveLength(1)
    expect(updates).toEqual([{ origin: ySyncPluginKey, content: next.toJSON() }])
  })

  it('keeps the existing text type when its content becomes empty', () => {
    const { document, fragment, meta } = createFragment()
    updateYFragment(document, fragment, schema.node('doc', null, [first]), meta)
    const element = fragment.get(0)

    if (!(element instanceof Y.XmlElement)) {
      throw new Error('Expected a paragraph element')
    }

    const text = element.get(0)
    updateYFragment(document, fragment, schema.node('doc', null, [paragraph('')]), meta)

    expect(fragment.get(0)).toBe(element)
    expect(element.get(0)).toBe(text)
    expect(text.toString()).toBe('')
    expect(meta.mapping.has(text)).toBe(false)
  })

  it('removes obsolete attributes and preserves snapshot annotations', () => {
    const { document, fragment, meta } = createFragment()
    updateYFragment(document, fragment, schema.node('doc', null, [first]), meta)
    const element = fragment.get(0)

    if (!(element instanceof Y.XmlElement)) {
      throw new Error('Expected a paragraph element')
    }

    element.setAttribute('id', 'old')
    element.setAttribute('obsolete', 'old')
    element.setAttribute('ychange', 'existing')
    const next = schema.node('paragraph', { id: null, ychange: 'new' }, schema.text('First'))

    updateYFragment(document, fragment, schema.node('doc', null, [next]), meta)

    expect(element.getAttributes()).toEqual({ ychange: 'existing' })
  })
})
