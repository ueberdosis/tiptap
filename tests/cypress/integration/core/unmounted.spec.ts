/// <reference types="cypress" />

import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('unmounted', () => {
  it('should not throw an error when the editor is unmounted', () => {
    expect(() => {
      const editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      expect(!!editor).to.eq(true)
    }).to.not.throw()
  })

  it('should have a view property that is not null', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    expect(!!editor.view).to.eq(true)
  })

  it('should emit a mount event when the editor is mounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('mount', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.mount(document.createElement('div'))
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
    editor.unmount()
  })

  it('should inject CSS when the editor is mounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('mount', () => {
      called = true
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).to.have.length(1)
    })

    expect(document.head.querySelectorAll('style[data-tiptap-style]')).to.have.length(0)
    editor.mount(document.createElement('div'))
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
    editor.unmount()
  })

  it('should emit an unmount event when the editor is unmounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.mount(document.createElement('div'))

    let called = false
    editor.on('unmount', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.unmount()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
  })

  it('should only remove injected CSS when the editor is unmounted if no other editors exist', async () => {
    const elementA = document.createElement('div')
    document.body.appendChild(elementA)

    const elementB = document.createElement('div')
    document.body.appendChild(elementB)

    const editorA = new Editor({
      element: elementA,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    const editorB = new Editor({
      element: elementB,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    let called = false
    editorA.on('unmount', () => {
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).to.have.length(1)
      editorB.unmount()
    })
    editorB.on('unmount', () => {
      called = true
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).to.have.length(0)
    })

    editorA.unmount()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)

    elementA.remove()
    elementB.remove()
  })

  it('should emit a destroy event when the editor is destroyed', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    let called = false
    editor.on('destroy', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.destroy()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
    expect(editor.isDestroyed).to.eq(true)
  })

  it('should emit an update event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('update', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
  })

  it('should emit a transaction event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('transaction', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
  })

  it('should emit a selectionUpdate event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('selectionUpdate', () => {
      called = true
      expect(called).to.eq(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).to.eq(true)
  })

  it('should be able to make changes to the editor', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.chain().setContent('<p>Test</p>').run()

    expect(editor.state.doc.toJSON()).to.deep.eq({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
    })
  })

  it('should be able to make multiple changes to the editor', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    editor.chain().setContent('<p>Test</p>').run()
    editor.chain().setContent('<p>Test 2</p>').run()

    expect(editor.state.doc.toJSON()).to.deep.eq({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test 2' }] }],
    })
  })

  it('should be able to read state from the editor view', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.chain().setContent('<p>Test</p>').run()
    expect(editor.view.state.doc.toJSON()).to.deep.eq({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
    })
  })

  it('should have some commonly accessed properties that are not null', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    expect(editor.view.editable).to.eq(true)
    expect(editor.view.composing).to.eq(false)
    expect(editor.view.dragging).to.eq(null)
    expect(editor.view.isDestroyed).to.eq(false)
  })
})
