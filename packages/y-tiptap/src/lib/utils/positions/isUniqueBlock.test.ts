import { assert, it } from 'vite-plus/test'
import { Schema } from 'prosemirror-model'
import { schema } from '../../../../tests/utils/testSchema.js'
import { isUniqueBlock } from './isUniqueBlock.js'

const idSchema = new Schema({
  nodes: schema.spec.nodes.update('paragraph', {
    ...schema.spec.nodes.get('paragraph'),
    attrs: { id: { default: null } },
  }),
  marks: schema.spec.marks,
})

it('is true for a paragraph whose id no other block has', () => {
  const doc = idSchema.node('doc', undefined, [
    idSchema.node('paragraph', { id: 'p1' }, idSchema.text('One')),
    idSchema.node('paragraph', { id: 'p2' }, idSchema.text('Two')),
  ])
  assert.isTrue(isUniqueBlock(doc, doc.child(0)))
})

it('is false for blocks that share their attrs, like two headings of one level', () => {
  const doc = idSchema.node('doc', undefined, [
    idSchema.node('heading', { level: 2 }, idSchema.text('Intro')),
    idSchema.node('heading', { level: 2 }, idSchema.text('Method')),
  ])
  assert.isFalse(isUniqueBlock(doc, doc.child(0)))
})

it('counts blocks nested in other nodes', () => {
  const doc = idSchema.node('doc', undefined, [
    idSchema.node('paragraph', { id: 'p1' }, idSchema.text('Top')),
    idSchema.node('blockquote', undefined, [
      idSchema.node('paragraph', { id: 'p1' }, idSchema.text('Quoted copy')),
    ]),
  ])
  assert.isFalse(isUniqueBlock(doc, doc.child(0)))
})
