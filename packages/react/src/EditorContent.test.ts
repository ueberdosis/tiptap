import React from 'react'
import { describe, expect, it, vi } from 'vite-plus/test'

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

  it('keeps the position of a renderer that is set again', () => {
    const contentComponent = createContentComponent()

    contentComponent.setRenderer('first', createRenderer('first'))
    contentComponent.setRenderer('second', createRenderer('second'))

    const before = contentComponent.getSnapshot().first
    contentComponent.setRenderer('first', createRenderer('first'))
    const renderers = contentComponent.getSnapshot()

    expect(Object.keys(renderers)).toEqual(['first', 'second'])
    expect(renderers.first).not.toBe(before)
  })

  it('keeps the same snapshot when removing an unknown renderer', async () => {
    const contentComponent = createContentComponent()
    const subscriber = vi.fn()

    contentComponent.subscribe(subscriber)
    contentComponent.setRenderer('first', createRenderer('first'))
    await Promise.resolve()

    const snapshot = contentComponent.getSnapshot()
    contentComponent.removeRenderer('unknown')
    await Promise.resolve()

    expect(contentComponent.getSnapshot()).toBe(snapshot)
    expect(contentComponent.getServerSnapshot()).toBe(snapshot)
    expect(subscriber).toHaveBeenCalledTimes(1)
  })

  it('keeps the snapshot in sync over many additions and removals', () => {
    const contentComponent = createContentComponent()
    const ids = Array.from({ length: 1_000 }, (_, index) => `renderer-${index}`)

    ids.forEach(id => contentComponent.setRenderer(id, createRenderer(id)))
    expect(Object.keys(contentComponent.getSnapshot())).toEqual(ids)

    ids.slice(0, 500).forEach(id => contentComponent.removeRenderer(id))
    expect(Object.keys(contentComponent.getSnapshot())).toEqual(ids.slice(500))
  })
})
