import { Schema } from '@tiptap/pm/model'
import { describe, expect, it } from 'vitest'

import { appendNestedList } from '../src/commands/utils/appendNestedList.js'

describe('appendNestedList', () => {
  it('preserves source list attributes', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'list+' },
        text: {},
        paragraph: { content: 'text*' },
        list: { content: 'item+', attrs: { start: { default: 1 }, type: { default: null } } },
        item: { content: 'paragraph list*' },
      },
    })
    const sourceList = schema.node('list', { start: 3, type: 'A' }, [
      schema.node('item', null, [schema.node('paragraph', null, schema.text('Child'))]),
    ])
    const state = {
      items: [],
      pendingContent: [schema.node('paragraph', null, schema.text('Parent'))],
    }

    expect(
      appendNestedList(
        sourceList,
        state,
        { listType: schema.nodes.list, itemType: schema.nodes.item, isListNode: () => true },
        list => [list.child(0)],
      ),
    ).toBe(true)
    expect(state.pendingContent[1].attrs).toEqual({ start: 3, type: 'A' })
  })
})
