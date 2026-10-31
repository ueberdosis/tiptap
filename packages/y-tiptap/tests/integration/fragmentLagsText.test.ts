import { assert, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { getPositionContent } from '../../src/lib/utils/positions/migrations/getPositionContent.js'
import { schema } from '../utils/testSchema.js'

const createFragment = (content: string) => {
  const document = new Y.Doc()
  const fragment = document.getXmlFragment('prosemirror')
  const paragraph = new Y.XmlElement('paragraph')
  const text = new Y.XmlText()
  text.insert(0, content)
  paragraph.insert(0, [text])
  fragment.insert(0, [paragraph])
  return { document, fragment }
}

const createDocument = (content: string) =>
  schema.node('doc', null, [schema.node('paragraph', null, [schema.text(content)])])

// Same shape as the fragment, but one character ahead — as in an appended
// transaction that runs before the view flushed the preceding keystroke
it('throws when the fragment text lags the prosemirror document', () => {
  const { document, fragment } = createFragment('AB')

  assert.throws(
    () => getPositionContent(fragment, createDocument('ABC')),
    /synchronized editor text/,
  )
  document.destroy()
})

// An appended transaction after a local deletion sees the fragment one
// deletion ahead; the stale identity must not survive the zip either
it('throws when the fragment text is ahead of the prosemirror document', () => {
  const { document, fragment } = createFragment('ABC')

  assert.throws(
    () => getPositionContent(fragment, createDocument('BC')),
    /synchronized editor text/,
  )
  document.destroy()
})

it('accepts synchronized text', () => {
  const { document, fragment } = createFragment('ABC')

  assert.doesNotThrow(() => getPositionContent(fragment, createDocument('ABC')))
  document.destroy()
})

// A deletion under an empty prosemirror node never reaches the text check
// above (there is no content to zip), so it must be caught where the empty
// placeholders are collected
it('throws when an empty prosemirror node holds nonempty fragment text', () => {
  const { document, fragment } = createFragment('AB')
  const emptyDoc = schema.node('doc', null, [schema.node('paragraph')])

  assert.throws(() => getPositionContent(fragment, emptyDoc), /synchronized editor text/)
  document.destroy()
})

it('records an empty fragment text as an empty placeholder', () => {
  const { document, fragment } = createFragment('')
  const emptyDoc = schema.node('doc', null, [schema.node('paragraph')])

  const { emptyTexts } = getPositionContent(fragment, emptyDoc)
  assert.equal(emptyTexts.length, 1)
  document.destroy()
})
