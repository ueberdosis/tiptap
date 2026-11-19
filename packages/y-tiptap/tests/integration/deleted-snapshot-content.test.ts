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

it('skips a nested list added and deleted between snapshots', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const listSchema = new Schema({
      nodes: schema.spec.nodes.append({
        bulletList: { group: 'block', content: 'listItem+' },
        listItem: { content: 'paragraph+' },
      }),
      marks: schema.spec.marks,
    })
    const fragment = document.getXmlFragment('prosemirror')
    const blockquote = new Y.XmlElement('blockquote')
    const paragraph = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    fragment.insert(0, [blockquote])
    blockquote.insert(0, [paragraph])
    paragraph.insert(0, [text])
    text.insert(0, 'Surviving text')
    const previous = Y.snapshot(document)
    const list = new Y.XmlElement('bulletList')
    const item = new Y.XmlElement('listItem')
    blockquote.insert(1, [list])
    list.insert(0, [item])
    item.insert(0, [new Y.XmlElement('paragraph')])
    blockquote.delete(1, 1)

    const node = createNodeFromYElement(
      blockquote,
      listSchema,
      createEmptyMeta(),
      Y.snapshot(document),
      previous,
      computeYChange,
    )
    expect(node.childCount).toBe(1)
    expect(node.firstChild?.type.name).toBe('paragraph')
    expect(node.textContent).toBe('Surviving text')
  } finally {
    document.destroy()
  }
})

it('keeps each deletion author and the previous text formatting', () => {
  const document = new Y.Doc({ gc: false })
  try {
    const fragment = document.getXmlFragment('prosemirror')
    const element = new Y.XmlElement('paragraph')
    const text = new Y.XmlText()
    fragment.insert(0, [element])
    element.insert(0, [text])
    text.insert(0, 'Alice Bob')
    text.format(0, 6, { strong: {} })
    const previous = Y.snapshot(document)
    text.delete(0, 6)
    const aliceDeletions = Y.snapshot(document).ds
    text.format(0, 3, { em: {} })
    fragment.delete(0, 1)
    const current = Y.snapshot(document)
    const node = createNodeFromYElement(
      element,
      schema,
      createEmptyMeta(),
      current,
      previous,
      (type, id) => ({
        ...computeYChange(type),
        user: Y.isDeleted(aliceDeletions, id) ? 'Alice' : 'Bob',
      }),
    )
    expect(node.textContent).toBe('Alice Bob')
    expect(node.childCount).toBe(2)
    expect(node.child(0).text).toBe('Alice ')
    expect(node.child(0).marks.find(mark => mark.type.name === 'ychange')?.attrs).toMatchObject({
      type: 'removed',
      user: 'Alice',
    })
    expect(node.child(0).marks.some(mark => mark.type.name === 'strong')).toBe(true)
    expect(node.child(1).text).toBe('Bob')
    expect(node.child(1).marks.find(mark => mark.type.name === 'ychange')?.attrs).toMatchObject({
      type: 'removed',
      user: 'Bob',
    })
    expect(node.child(1).marks.some(mark => mark.type.name === 'em')).toBe(false)
  } finally {
    document.destroy()
  }
})
