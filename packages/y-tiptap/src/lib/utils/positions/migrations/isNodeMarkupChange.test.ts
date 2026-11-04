import { Schema } from 'prosemirror-model'
import { Transform } from 'prosemirror-transform'
import { describe, expect, it, vi } from 'vite-plus/test'

import { isNodeMarkupChange } from './isNodeMarkupChange.js'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    heading: { group: 'block', content: 'text*', attrs: { level: { default: 1 } } },
    text: {},
  },
})

describe('isNodeMarkupChange', () => {
  it('serializes a step only once across repeated calls', () => {
    const before = schema.node('doc', null, [
      schema.node('heading', { level: 1 }, [schema.text('Title')]),
    ])
    const tr = new Transform(before).setNodeMarkup(0, undefined, { level: 2 })
    const step = tr.steps[0]
    const after = tr.doc
    const toJSON = vi.spyOn(step, 'toJSON')

    // mapPositionMigration calls this once per tracked position for the same step
    const results = [0, 1, 6, 0, 6].map(position =>
      isNodeMarkupChange(step, before, after, position),
    )

    expect(results).toEqual([true, false, true, true, true])
    expect(toJSON).toHaveBeenCalledTimes(1)
  })
})
