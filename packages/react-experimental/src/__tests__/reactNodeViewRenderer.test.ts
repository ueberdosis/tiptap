import { Node as TiptapNode } from '@tiptap/core'
import { act, createElement, useEffect, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReactRendererExtension } from '../extension.js'
import { NodeViewContent } from '../NodeViewContent.js'
import { NodeViewWrapper } from '../NodeViewWrapper.js'
import { nodeView, ReactNodeViewRenderer } from '../ReactNodeViewRenderer.js'
import type { ReactNodeViewProps } from '../types.js'
import {
  Counter,
  CounterExtension,
  mountEditorContent,
  renderTiptapEditor,
  tiptapTestNodes,
  unmountTrackedRoots,
} from './helpers.js'

afterEach(unmountTrackedRoots)

/** Components written exactly as for `@tiptap/react`'s ReactNodeViewRenderer. */
const ParagraphComponent = (props: ReactNodeViewProps) =>
  createElement(
    NodeViewWrapper,
    { className: 'custom-paragraph', 'data-name': props.node.type.name },
    createElement('label', { contentEditable: false }, 'label'),
    createElement(NodeViewContent, { className: 'custom-content' }),
  )

const CounterComponent = (props: ReactNodeViewProps) =>
  createElement(
    NodeViewWrapper,
    { className: 'custom-counter' },
    createElement(
      'button',
      {
        contentEditable: false,
        onClick: () => props.updateAttributes({ count: (props.node.attrs.count as number) + 1 }),
      },
      `count-${props.node.attrs.count}`,
    ),
  )

/** A counter extension registering its node view the legacy way. */
const nodeViewCounter = (options?: Parameters<typeof ReactNodeViewRenderer>[1]) =>
  CounterExtension.extend({
    addNodeView: () => ReactNodeViewRenderer(CounterComponent, options),
  })

const InlineComponent = () =>
  createElement(
    NodeViewWrapper,
    { className: 'custom-inline' },
    createElement(NodeViewContent, { className: 'custom-inline-content' }),
  )

/** Mounts a doc with an inline node view sitting inside a paragraph. */
const mountWithInlineView = (options?: Parameters<typeof ReactNodeViewRenderer>[1]) =>
  mountEditorContent({
    content: '<p>a<test-inline>x</test-inline>b</p>',
    extensions: [
      ...tiptapTestNodes,
      TiptapNode.create({
        name: 'inlineView',
        group: 'inline',
        inline: true,
        content: 'text*',
        parseHTML: () => [{ tag: 'test-inline' }],
        renderHTML: () => ['test-inline', 0],
        addNodeView: () => ReactNodeViewRenderer(InlineComponent, options),
      }),
      ReactRendererExtension,
    ],
  })

/** Mounts an editor whose paragraph extension registers the node view itself. */
const mountWithParagraphView = (
  content: string,
  options?: Parameters<typeof ReactNodeViewRenderer>[1],
) =>
  mountEditorContent({
    content,
    extensions: [
      TiptapNode.create({ name: 'doc', topNode: true, content: 'block+' }),
      TiptapNode.create({
        name: 'paragraph',
        group: 'block',
        content: 'inline*',
        parseHTML: () => [{ tag: 'p' }],
        renderHTML: () => ['p', 0],
        addNodeView: () => ReactNodeViewRenderer(ParagraphComponent, options),
      }),
      TiptapNode.create({ name: 'text', group: 'inline' }),
      ReactRendererExtension,
    ],
  })

describe('ReactNodeViewRenderer', () => {
  it('renders a component registered through addNodeView, wrapper and content wired', async () => {
    const { editor, view, dom } = await mountWithParagraphView('<p>hello</p>')

    const wrapper = dom.querySelector('.custom-paragraph') as HTMLElement
    const content = dom.querySelector('.custom-content') as HTMLElement

    expect(wrapper).toBeTruthy()
    expect(wrapper.getAttribute('data-node-view-wrapper')).toBe('')
    expect(wrapper.getAttribute('data-name')).toBe('paragraph')
    expect(content.getAttribute('data-node-view-content')).toBe('')

    // The wrapper IS the node's DOM — no extra host elements around it
    expect(view.nodeDOM(0)).toBe(wrapper)
    expect(wrapper.parentElement).toBe(dom)

    // NodeViewContent received the document content and maps positions
    expect(content.textContent).toBe('hello')
    expect(view.posAtDOM(content.firstChild as Text, 2)).toBe(3)

    // Editing lands inside the content element
    await act(async () => {
      editor.commands.insertContentAt(6, '!')
    })
    expect(content.textContent).toBe('hello!')
  })

  it('supports atom components with updateAttributes', async () => {
    const { view, dom } = await renderTiptapEditor('<test-counter count="4"></test-counter>', [
      nodeViewCounter(),
    ])

    const button = dom.querySelector('.custom-counter button') as HTMLButtonElement

    expect(button.textContent).toBe('count-4')

    await act(async () => {
      button.click()
    })
    expect(button.textContent).toBe('count-5')
    expect(view.nodeDOM(0)).toBe(dom.querySelector('.custom-counter'))
  })

  it('does not remount extension-registered views on unrelated edits', async () => {
    const { editor, dom } = await renderTiptapEditor(
      '<p>first</p><test-counter count="0"></test-counter>',
      [nodeViewCounter()],
    )

    const host = dom.querySelector('.custom-counter') as HTMLElement

    await act(async () => {
      editor.commands.insertContentAt(1, 'X')
    })

    expect(dom.querySelector('.custom-counter')).toBe(host)
    expect(editor.state.doc.textContent).toBe('Xfirst')
  })

  it('lets the nodeViews prop override the extension registration', async () => {
    const { dom } = await renderTiptapEditor(
      '<test-counter count="1"></test-counter>',
      [nodeViewCounter()],
      { counter: Counter },
    )

    // The native-contract component from the prop won
    expect(dom.querySelector('.counter button')?.textContent).toBe('count-1')
    expect(dom.querySelector('.custom-counter')).toBeNull()
  })

  it('applies as, className, and attrs options to the wrapper element', async () => {
    const { dom } = await mountWithParagraphView('<p>styled</p>', {
      as: 'section',
      className: 'from-options',
      attrs: ({ node }) => ({ 'data-length': String(node.content.size) }),
    })

    const wrapper = dom.querySelector('[data-node-view-wrapper]') as HTMLElement

    expect(wrapper.tagName).toBe('SECTION')
    expect(wrapper.classList.contains('from-options')).toBe(true)
    expect(wrapper.classList.contains('custom-paragraph')).toBe(true)
    expect(wrapper.getAttribute('data-length')).toBe('6')
  })

  it('defaults block node views to div wrapper and content elements', async () => {
    const { dom } = await mountWithParagraphView('<p>block</p>')

    expect((dom.querySelector('[data-node-view-wrapper]') as HTMLElement).tagName).toBe('DIV')
    expect((dom.querySelector('[data-node-view-content]') as HTMLElement).tagName).toBe('DIV')
  })

  it('defaults inline node views to span wrapper and content elements', async () => {
    const { dom } = await mountWithInlineView()

    const wrapper = dom.querySelector('.custom-inline') as HTMLElement
    const content = dom.querySelector('.custom-inline-content') as HTMLElement

    expect(wrapper.tagName).toBe('SPAN')
    expect(content.tagName).toBe('SPAN')
    expect(wrapper.parentElement?.tagName).toBe('P')
    expect(content.textContent).toBe('x')
  })

  it('lets as and contentDOMElementTag options override the inline defaults', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { dom } = await mountWithInlineView({ as: 'em', contentDOMElementTag: 'strong' })

    expect((dom.querySelector('.custom-inline') as HTMLElement).tagName).toBe('EM')
    expect((dom.querySelector('.custom-inline-content') as HTMLElement).tagName).toBe('STRONG')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('wires the stopEvent option onto the node view desc', async () => {
    const stopEvent = vi.fn(() => true)
    const { dom } = await renderTiptapEditor('<test-counter count="0"></test-counter>', [
      nodeViewCounter({ stopEvent }),
    ])

    const wrapper = dom.querySelector('.custom-counter') as HTMLElement
    const desc = wrapper.pmViewDesc

    expect(desc?.stopEvent(new Event('mousedown'))).toBe(true)
    expect(stopEvent).toHaveBeenCalledWith({ event: expect.any(Event) })
  })

  describe('the update option', () => {
    let mounts = 0
    const MountTracker = (props: ReactNodeViewProps) => {
      const [localState] = useState(() => `mounted-at-${props.node.attrs.count}`)

      useEffect(() => {
        mounts += 1
      }, [])
      return createElement(
        NodeViewWrapper,
        { className: 'tracker' },
        `${props.node.attrs.count}:${localState}`,
      )
    }
    const mountTracker = (options?: Parameters<typeof ReactNodeViewRenderer>[1]) => {
      mounts = 0
      return renderTiptapEditor('<test-counter count="1"></test-counter>', [
        CounterExtension.extend({
          addNodeView: () => ReactNodeViewRenderer(MountTracker, options),
        }),
      ])
    }
    const bumpCount = (editor: { commands: { command: (fn: any) => boolean } }) =>
      act(async () => {
        editor.commands.command(({ tr }: any) => {
          tr.setNodeAttribute(0, 'count', 2)
          return true
        })
      })

    it('is not called on mount and receives old and new values on change', async () => {
      type UpdateOption = NonNullable<
        NonNullable<Parameters<typeof ReactNodeViewRenderer>[1]>['update']
      >
      const update = vi.fn<UpdateOption>(() => true)
      const { editor } = await mountTracker({ update })

      expect(update).not.toHaveBeenCalled()

      await bumpCount(editor)

      expect(update).toHaveBeenCalledTimes(1)
      const args = update.mock.calls[0][0]

      expect(args.oldNode.attrs.count).toBe(1)
      expect(args.newNode.attrs.count).toBe(2)
      expect(typeof args.updateProps).toBe('function')
    })

    it('keeps the component mounted with new props when returning true', async () => {
      const { editor, dom } = await mountTracker({ update: () => true })

      await bumpCount(editor)

      expect(dom.querySelector('.tracker')?.textContent).toBe('2:mounted-at-1')
      expect(mounts).toBe(1)
    })

    it('remounts the component when returning false', async () => {
      const { editor, dom } = await mountTracker({ update: () => false })

      await bumpCount(editor)

      // fresh local state proves the remount
      expect(dom.querySelector('.tracker')?.textContent).toBe('2:mounted-at-2')
      expect(mounts).toBe(2)
    })

    it('no longer warns when the option is provided', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await mountTracker({ update: () => true })

      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  it('renders a native-contract component registered through addNodeView via nodeView()', async () => {
    const nativeExtension = CounterExtension.extend({
      addNodeView: () => nodeView(Counter),
    })
    const { view, dom } = await renderTiptapEditor('<test-counter count="7"></test-counter>', [
      nativeExtension,
    ])

    const host = dom.querySelector('.counter') as HTMLElement

    // The component rendered as-is: its own root element is the node's DOM
    expect(host.querySelector('button')?.textContent).toBe('count-7')
    expect(view.nodeDOM(0)).toBe(host)

    await act(async () => {
      ;(host.querySelector('button') as HTMLButtonElement).click()
    })
    expect(host.querySelector('button')?.textContent).toBe('count-8')
  })

  it('warns and falls back to toDOM for imperative addNodeView results', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const imperativeExtension = CounterExtension.extend({
      name: 'imperativeCounter',
      parseHTML: () => [{ tag: 'imperative-counter' }],
      renderHTML: () => ['imperative-counter', {}],
      addNodeView:
        () =>
        ({ node }) => {
          const dom = document.createElement('div')

          dom.textContent = `imperative-${node.attrs.count}`
          return { dom }
        },
    })

    const { dom } = await renderTiptapEditor(
      '<imperative-counter count="2"></imperative-counter>',
      [imperativeExtension],
    )

    // Fell back to renderHTML output, with a warning
    expect(dom.querySelector('imperative-counter')).toBeTruthy()
    expect(warn.mock.calls.some(call => String(call[0]).includes('imperativeCounter'))).toBe(true)
    warn.mockRestore()
  })
})
