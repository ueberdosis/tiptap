import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { Extension } from './Extension.js'
import { PasteRule, pasteRulesPlugin } from './PasteRule.js'

describe('PasteRule plugin', () => {
  let editor: Editor
  let sourceEditor: Editor
  let targetEditor: Editor

  afterEach(() => {
    vi.useRealTimers()
    editor?.destroy()
    sourceEditor?.destroy()
    targetEditor?.destroy()
  })

  it('attaches global drag and drop listeners', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)

    editor = new Editor({
      element: editorEl,
      extensions: [Document, Paragraph, Text],
    })

    const rule = new PasteRule({
      find: /test/,
      handler: () => null,
    })

    const plugins = pasteRulesPlugin({ editor, rules: [rule] })
    expect(plugins.length).toBe(1)

    // The plugin view should not throw when created and destroyed
    const view = plugins[0].spec.view!(editor.view)

    // Simulate drop on window to ensure it doesn't throw
    const dropEvent = new Event('drop')
    window.dispatchEvent(dropEvent)

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    view.destroy!()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragstart', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('dragend', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('drop', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })

  it('deletes source content only once when dragging between editors with multiple paste rules', () => {
    vi.useFakeTimers()

    const sourceEl = document.createElement('div')
    const targetEl = document.createElement('div')
    document.body.appendChild(sourceEl)
    document.body.appendChild(targetEl)

    const rule1 = new PasteRule({ find: /foo/, handler: () => null })
    const rule2 = new PasteRule({ find: /bar/, handler: () => null })

    const pasteRuleExtension = Extension.create({
      name: 'testPasteRules',
      addPasteRules() {
        return [rule1, rule2]
      },
    })

    sourceEditor = new Editor({
      element: sourceEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p>Hello world</p>',
    })

    targetEditor = new Editor({
      element: targetEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p></p>',
    })

    sourceEditor.commands.setTextSelection({ from: 1, to: 7 })
    const transactionSpy = vi.fn()
    sourceEditor.on('transaction', transactionSpy)

    sourceEditor.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    targetEditor.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))

    vi.advanceTimersByTime(20)

    expect(transactionSpy).toHaveBeenCalledTimes(1)
    expect(sourceEditor.getText()).toBe('world')
  })

  it('clears drag source on global drop so subsequent drops do not delete source content', () => {
    vi.useFakeTimers()

    const sourceEl = document.createElement('div')
    const targetEl = document.createElement('div')
    document.body.appendChild(sourceEl)
    document.body.appendChild(targetEl)

    const rule = new PasteRule({ find: /foo/, handler: () => null })
    const pasteRuleExtension = Extension.create({
      name: 'testPasteRules',
      addPasteRules() {
        return [rule]
      },
    })

    sourceEditor = new Editor({
      element: sourceEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p>Hello world</p>',
    })

    targetEditor = new Editor({
      element: targetEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p></p>',
    })

    sourceEditor.commands.setTextSelection({ from: 1, to: 7 })

    sourceEditor.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    window.dispatchEvent(new Event('drop'))
    targetEditor.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))

    vi.advanceTimersByTime(20)

    expect(sourceEditor.getText()).toBe('Hello world')
  })

  it('cancels deferred deletion if a new drag starts before the timeout completes', () => {
    vi.useFakeTimers()

    const sourceEl = document.createElement('div')
    const targetEl = document.createElement('div')
    document.body.appendChild(sourceEl)
    document.body.appendChild(targetEl)

    const rule = new PasteRule({ find: /foo/, handler: () => null })
    const pasteRuleExtension = Extension.create({
      name: 'testPasteRules',
      addPasteRules() {
        return [rule]
      },
    })

    sourceEditor = new Editor({
      element: sourceEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p>Hello world</p>',
    })

    targetEditor = new Editor({
      element: targetEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p></p>',
    })

    sourceEditor.commands.setTextSelection({ from: 1, to: 7 })

    sourceEditor.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    targetEditor.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))

    // Poison pill: start another drag before the 10ms timeout fires
    sourceEditor.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))

    vi.advanceTimersByTime(20)

    expect(sourceEditor.getText()).toBe('Hello world')
  })

  it('does not throw or error if source editor is destroyed before deferred deletion fires', () => {
    vi.useFakeTimers()

    const sourceEl = document.createElement('div')
    const targetEl = document.createElement('div')
    document.body.appendChild(sourceEl)
    document.body.appendChild(targetEl)

    const rule = new PasteRule({ find: /foo/, handler: () => null })
    const pasteRuleExtension = Extension.create({
      name: 'testPasteRules',
      addPasteRules() {
        return [rule]
      },
    })

    sourceEditor = new Editor({
      element: sourceEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p>Hello world</p>',
    })

    targetEditor = new Editor({
      element: targetEl,
      extensions: [Document, Paragraph, Text, pasteRuleExtension],
      content: '<p></p>',
    })

    sourceEditor.commands.setTextSelection({ from: 1, to: 7 })

    sourceEditor.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    targetEditor.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))

    // Poison pill: destroy source editor before the 10ms timeout fires
    sourceEditor.destroy()

    expect(() => vi.advanceTimersByTime(20)).not.toThrow()
  })
})
