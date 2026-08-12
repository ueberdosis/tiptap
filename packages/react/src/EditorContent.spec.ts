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
    const snapshotKeys = () => contentComponent.getSnapshot().map(portal => portal.key)

    contentComponent.subscribe(subscriber)

    contentComponent.setRenderer('first', createRenderer('first'))
    contentComponent.setRenderer('second', createRenderer('second'))

    expect(snapshotKeys()).toEqual(['first', 'second'])
    expect(subscriber).not.toHaveBeenCalled()

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(1)

    contentComponent.removeRenderer('first')
    contentComponent.removeRenderer('second')

    expect(snapshotKeys()).toEqual([])

    await Promise.resolve()

    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  it('keeps the snapshot stable until a renderer changes', async () => {
    const contentComponent = createContentComponent()

    contentComponent.setRenderer('first', createRenderer('first'))

    const snapshot = contentComponent.getSnapshot()

    expect(contentComponent.getSnapshot()).toBe(snapshot)

    contentComponent.setRenderer('first', createRenderer('first updated'))

    expect(contentComponent.getSnapshot()).not.toBe(snapshot)
    expect(contentComponent.getSnapshot().map(portal => portal.key)).toEqual(['first'])
  })

  it('does not notify when removing an unknown renderer', async () => {
    const contentComponent = createContentComponent()
    const subscriber = vi.fn()

    contentComponent.subscribe(subscriber)
    contentComponent.removeRenderer('missing')

    await Promise.resolve()

    expect(subscriber).not.toHaveBeenCalled()
  })
})
