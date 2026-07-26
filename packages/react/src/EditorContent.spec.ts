import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { createContentComponent } from './EditorContent.js'
import type { ReactRenderer } from './ReactRenderer.js'

const createRenderer = (id: string) =>
  ({
    reactElement: React.createElement('span', null, id),
    element: document.createElement('div'),
  }) as ReactRenderer

describe('createContentComponent', () => {
  it('batches synchronous renderer change notifications', async () => {
    const contentComponent = createContentComponent()
    const subscriber = vi.fn()

    contentComponent.subscribe(subscriber)

    contentComponent.setRenderer('first', createRenderer('first'))
    contentComponent.setRenderer('second', createRenderer('second'))

    expect(Object.keys(contentComponent.getSnapshot())).toEqual(['first', 'second'])
    expect(subscriber).not.toHaveBeenCalled()

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(1)

    contentComponent.removeRenderer('first')
    contentComponent.removeRenderer('second')

    expect(Object.keys(contentComponent.getSnapshot())).toEqual([])

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(2)
  })
})
