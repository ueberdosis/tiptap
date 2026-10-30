import { assert, it } from 'vite-plus/test'
import * as Y from 'yjs'
import { getPositionContent } from '../../src/lib/utils/positions/migrations/getPositionContent.js'
import { schema } from '../utils/testSchema.js'

it('throws when the fragment text lags the prosemirror document', () => {
  const document = new Y.Doc()
  const fragment = document.getXmlFragment('prosemirror')
  const paragraph = new Y.XmlElement('paragraph')
  const text = new Y.XmlText()
  text.insert(0, 'AB')
  paragraph.insert(0, [text])
  fragment.insert(0, [paragraph])

  // Same shape as the fragment, but one character ahead — as in an appended
  // transaction that runs before the view flushed the preceding keystroke
  const prosemirror = schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text('ABC')]),
  ])

  assert.throws(() => getPositionContent(fragment, prosemirror), /synchronized editor text/)
  document.destroy()
})

it('accepts a fragment that is ahead of the prosemirror document', () => {
  const document = new Y.Doc()
  const fragment = document.getXmlFragment('prosemirror')
  const paragraph = new Y.XmlElement('paragraph')
  const text = new Y.XmlText()
  text.insert(0, 'ABC')
  paragraph.insert(0, [text])
  fragment.insert(0, [paragraph])

  const prosemirror = schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text('AB')]),
  ])

  assert.doesNotThrow(() => getPositionContent(fragment, prosemirror))
  document.destroy()
})
