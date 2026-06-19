import { Node, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Component } from 'solid-js'
import { render } from 'solid-js/web'

import { Editor } from '../src/Editor.js'
import { EditorContent } from '../src/EditorContent.jsx'
import { NodeViewContent } from '../src/NodeViewContent.jsx'
import { NodeViewWrapper } from '../src/NodeViewWrapper.jsx'
import { SolidNodeViewRenderer } from '../src/SolidNodeViewRenderer.jsx'

const ComponentWithoutContent: Component = () => (
  <NodeViewWrapper class="no-content">
    <div class="custom-content">Custom UI</div>
  </NodeViewWrapper>
)

const ComponentWithContent: Component = () => (
  <NodeViewWrapper class="with-content">
    <NodeViewContent class="content-editable" />
  </NodeViewWrapper>
)

const LeafComponent: Component = () => (
  <NodeViewWrapper class="leaf">
    <div class="leaf-content">Leaf</div>
  </NodeViewWrapper>
)

function createBlockNode(component: Component) {
  return Node.create({
    name: 'customBlock',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'custom-block' }],
    renderHTML: ({ HTMLAttributes }) => ['custom-block', mergeAttributes(HTMLAttributes), 0],
    addNodeView: () => SolidNodeViewRenderer(component),
  })
}

function createLeafNode(component: Component) {
  return Node.create({
    name: 'customLeaf',
    group: 'block',
    atom: true,
    parseHTML: () => [{ tag: 'custom-leaf' }],
    renderHTML: ({ HTMLAttributes }) => ['custom-leaf', mergeAttributes(HTMLAttributes)],
    addNodeView: () => SolidNodeViewRenderer(component),
  })
}

describe('SolidNodeViewRenderer contentDOM', () => {
  let editor: Editor | null = null
  let el: HTMLElement | null = null

  function withEditor(content: string, component: Component, leaf = false) {
    editor = new Editor({
      element: el!,
      extensions: [
        Document,
        Paragraph,
        Text,
        leaf ? createLeafNode(component) : createBlockNode(component),
      ],
      content,
    })

    return new Promise(resolve => setTimeout(resolve, 10))
  }

  beforeEach(() => {
    el = document.createElement('div')
    document.body.appendChild(el)
  })

  afterEach(() => {
    editor?.destroy()
    editor = null
    el?.parentNode?.removeChild(el)
    el = null
  })

  it('does not thrash the DOM when NodeViewContent is absent', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithoutContent)

    expect(el!.querySelector('[data-node-view-wrapper]')).toBeTruthy()
    expect(el!.querySelector('[data-node-view-content]')).toBeFalsy()

    const wrapperDesc = (
      el!.querySelector('[data-node-view-wrapper]') as HTMLElement & {
        pmViewDesc?: { spec?: { contentDOM?: HTMLElement } }
      }
    )?.pmViewDesc

    expect(wrapperDesc?.spec?.contentDOM).toBeTruthy()
  })

  it('returns null for leaf nodes', async () => {
    await withEditor('<custom-leaf />', LeafComponent, true)
    expect(el!.querySelector('[data-node-view-content]')).toBeFalsy()
  })

  it('works with NodeViewContent in the component', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithContent)

    const content = el!.querySelector('[data-node-view-content-solid]')

    expect(content).toBeTruthy()
    expect(content!.textContent).toContain('Hello World')
  })

  it('keeps paragraph content inside the node view with EditorContent', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    el = container

    editor = new Editor({
      extensions: [Document, Paragraph, Text, createBlockNode(ComponentWithContent)],
      content: '<p>Before</p><custom-block>Inside the node view</custom-block><p>After</p>',
    })

    render(() => <EditorContent editor={editor} />, container)

    await new Promise(resolve => queueMicrotask(resolve))

    const contentDom = container.querySelector('[data-node-view-content-solid]')

    expect(contentDom?.textContent).toContain('Inside the node view')

    const proseMirror = container.querySelector('.ProseMirror')
    const outsideParagraphs = proseMirror?.querySelectorAll(':scope > p')

    expect(outsideParagraphs?.length).toBe(2)
  })

  it('does not throw on destroy', async () => {
    await withEditor('<custom-block>Hello World</custom-block>', ComponentWithoutContent)
    expect(() => editor!.destroy()).not.toThrow()
  })
})
