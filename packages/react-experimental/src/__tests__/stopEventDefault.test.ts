import { Node as TiptapNode } from '@tiptap/core'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReactRendererExtension } from '../extension.js'
import { NodeViewContent } from '../NodeViewContent.js'
import { NodeViewWrapper } from '../NodeViewWrapper.js'
import { ReactNodeViewRenderer } from '../ReactNodeViewRenderer.js'
import { mountEditorContent, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

const FormComponent = () =>
  createElement(
    NodeViewWrapper,
    { className: 'form-view' },
    createElement('input', { className: 'form-input', contentEditable: false }),
    createElement('span', { className: 'form-label', contentEditable: false }, 'label'),
    createElement(NodeViewContent, { className: 'form-content' }),
  )

const mountFormView = (options?: Parameters<typeof ReactNodeViewRenderer>[1]) =>
  mountEditorContent({
    content: '<test-form>inner</test-form>',
    extensions: [
      TiptapNode.create({ name: 'doc', topNode: true, content: 'block+' }),
      TiptapNode.create({
        name: 'formView',
        group: 'block',
        content: 'text*',
        draggable: true,
        parseHTML: () => [{ tag: 'test-form' }],
        renderHTML: () => ['test-form', 0],
        addNodeView: () => ReactNodeViewRenderer(FormComponent, options),
      }),
      TiptapNode.create({
        name: 'paragraph',
        group: 'block',
        content: 'inline*',
        parseHTML: () => [{ tag: 'p' }],
        renderHTML: () => ['p', 0],
      }),
      TiptapNode.create({ name: 'text', group: 'inline' }),
      ReactRendererExtension,
    ],
  })

const eventAt = (type: string, target: EventTarget) => {
  const event = new Event(type, { bubbles: true, cancelable: true })

  Object.defineProperty(event, 'target', { value: target })
  return event
}

/** The mounted form view's elements and desc. */
const queryFormView = (dom: HTMLElement) => {
  const wrapper = dom.querySelector('.form-view') as HTMLElement

  return {
    wrapper,
    input: dom.querySelector('.form-input') as HTMLInputElement,
    label: dom.querySelector('.form-label') as HTMLElement,
    content: dom.querySelector('.form-content') as HTMLElement,
    desc: wrapper.pmViewDesc,
  }
}

describe('default stopEvent', () => {
  it('stops events from form controls inside the node view', async () => {
    const { dom } = await mountFormView()
    const { input, desc } = queryFormView(dom)

    expect(desc?.stopEvent(eventAt('mousedown', input))).toBe(true)
    expect(desc?.stopEvent(eventAt('keydown', input))).toBe(true)
    expect(desc?.stopEvent(eventAt('beforeinput', input))).toBe(true)
  })

  it('lets events from inside contentDOM through to ProseMirror', async () => {
    const { dom } = await mountFormView()
    const { content, desc } = queryFormView(dom)

    expect(desc?.stopEvent(eventAt('keydown', content.firstChild as Text))).toBe(false)
  })

  it('lets drag, drop, and clipboard events through', async () => {
    const { dom } = await mountFormView()
    const { input, label, desc } = queryFormView(dom)

    expect(desc?.stopEvent(eventAt('drop', input))).toBe(false)
    expect(desc?.stopEvent(eventAt('dragover', input))).toBe(false)
    expect(desc?.stopEvent(eventAt('copy', label))).toBe(false)
    expect(desc?.stopEvent(eventAt('paste', label))).toBe(false)
    expect(desc?.stopEvent(eventAt('cut', label))).toBe(false)
  })

  it('marks dragging on drag-handle mousedown and lets the drag through', async () => {
    const DragHandleComponent = () =>
      createElement(
        NodeViewWrapper,
        { className: 'drag-view' },
        createElement(
          'span',
          { 'data-drag-handle': '', className: 'handle', contentEditable: false },
          '::',
        ),
        createElement(NodeViewContent, null),
      )
    const { dom } = await mountEditorContent({
      content: '<test-form>x</test-form>',
      extensions: [
        TiptapNode.create({ name: 'doc', topNode: true, content: 'block+' }),
        TiptapNode.create({
          name: 'formView',
          group: 'block',
          content: 'text*',
          draggable: true,
          parseHTML: () => [{ tag: 'test-form' }],
          renderHTML: () => ['test-form', 0],
          addNodeView: () => ReactNodeViewRenderer(DragHandleComponent),
        }),
        TiptapNode.create({ name: 'text', group: 'inline' }),
        ReactRendererExtension,
      ],
    })
    const wrapper = dom.querySelector('.drag-view') as HTMLElement
    const handle = dom.querySelector('.handle') as HTMLElement
    const desc = wrapper.pmViewDesc

    // no mousedown yet: the drag is stopped
    expect(desc?.stopEvent(eventAt('dragstart', handle))).toBe(true)

    // mousedown records dragging and stays with ProseMirror (node selection)
    expect(desc?.stopEvent(eventAt('mousedown', handle))).toBe(false)
    expect(desc?.stopEvent(eventAt('dragstart', handle))).toBe(false)

    // mouseup resets the bookkeeping
    document.dispatchEvent(new Event('mouseup'))
    expect(desc?.stopEvent(eventAt('dragstart', handle))).toBe(true)
  })

  it('is fully overridden by a user-provided stopEvent option', async () => {
    const stopEvent = vi.fn(() => false)
    const { dom } = await mountFormView({ stopEvent })
    const { input, desc } = queryFormView(dom)

    expect(desc?.stopEvent(eventAt('mousedown', input))).toBe(false)
    expect(stopEvent).toHaveBeenCalled()
  })

  it('keeps returning false for plain schema nodes', async () => {
    const { editor, dom } = await mountFormView()

    await act(async () => {
      editor.commands.insertContentAt(editor.state.doc.content.size, '<p>plain</p>')
    })
    const paragraph = dom.querySelector('p') as HTMLElement

    expect(paragraph.pmViewDesc?.stopEvent(eventAt('mousedown', paragraph))).toBe(false)
  })

  it('typing into an input no longer reaches the document', async () => {
    const { editor, dom } = await mountFormView()
    const { input } = queryFormView(dom)
    const before = editor.state.doc.toJSON()

    await act(async () => {
      input.dispatchEvent(
        new InputEvent('beforeinput', { inputType: 'insertText', data: 'x', bubbles: true }),
      )
    })

    expect(editor.state.doc.toJSON()).toEqual(before)
  })
})
