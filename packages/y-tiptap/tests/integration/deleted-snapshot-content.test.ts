import { expect, it } from 'vite-plus/test'
import { Schema } from 'prosemirror-model'
import * as Y from 'yjs'
import { schema as baseSchema } from '../utils/testSchema.js'
import { createEmptyMeta } from '../../src/lib/utils/conversion/createEmptyMeta.js'
import { createNodeFromYElement } from '../../src/lib/utils/conversion/createNodeFromYElement.js'

const schema = new Schema({
  nodes: baseSchema.spec.nodes.update('paragraph', {
    ...baseSchema.spec.nodes.get('paragraph'),
    attrs: { id: { default: null }, ychange: { default: null } },
  }),
  marks: baseSchema.spec.marks.addToEnd('ychange', {
    attrs: { type: {}, user: { default: null }, color: { default: null } },
  }),
})

const computeYChange = (type: 'added' | 'removed') => ({
  type,
  user: 'test',
  color: { light: '#fff', dark: '#000' },
})

it('keeps a deleted element’s previous attributes and text', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const fragment = document.getXmlFragment('prosemirror')
    const element = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    fragment.insert(0, [element])
    element.setAttribute('id', 'original')
    element.insert(0, [text])
    text.insert(0, 'original text')
    const previous = Y.snapshot(document)
    element.setAttribute('id', 'changed')
    text.delete(0, text.length)
    text.insert(0, 'changed text')
    fragment.delete(0, 1)
    const current = Y.snapshot(document)
    const node = createNodeFromYElement(
      element,
      schema,
      createEmptyMeta(),
      current,
      previous,
      computeYChange,
    )
    expect(node.attrs.id).toBe('original')
    expect(node.attrs.ychange.type).toBe('removed')
    expect(node.textContent).toBe('original text')
    expect(node.firstChild?.marks.find(mark => mark.type.name === 'ychange')?.attrs.type).toBe(
      'removed',
    )
  } finally {
    document.destroy()
  }
})

it('handles an element added and deleted between snapshots', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const fragment = document.getXmlFragment('prosemirror')
    const previous = Y.snapshot(document)
    const element = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    fragment.insert(0, [element])
    element.setAttribute('id', 'temporary')
    element.insert(0, [text])
    text.insert(0, 'temporary text')
    fragment.delete(0, 1)
    const current = Y.snapshot(document)
    const node = createNodeFromYElement(
      element,
      schema,
      createEmptyMeta(),
      current,
      previous,
      computeYChange,
    )
    expect(node.attrs.ychange.type).toBe('removed')
    expect(node.textContent).toBe('')
  } finally {
    document.destroy()
  }
})
