import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it, vi } from 'vitest'

describe('dispatchTransaction', () => {
  it('should call dispatchTransaction from an extension', () => {
    const dispatchTransaction = vi.fn(({ transaction, next }) => next(transaction))
    const CustomExtension = Extension.create({
      name: 'custom',
      dispatchTransaction,
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomExtension],
    })

    editor.commands.insertContent('foo')

    expect(dispatchTransaction).toHaveBeenCalled()

    editor.destroy()
  })

  it('should call multiple dispatchTransaction hooks in priority order', () => {
    const order: string[] = []
    const Extension1 = Extension.create({
      name: 'extension1',
      priority: 10,
      dispatchTransaction({ transaction, next }) {
        order.push('extension1')
        next(transaction)
      },
    })
    const Extension2 = Extension.create({
      name: 'extension2',
      priority: 20,
      dispatchTransaction({ transaction, next }) {
        order.push('extension2')
        next(transaction)
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1, Extension2],
    })

    editor.commands.insertContent('foo')

    expect(order).toEqual(['extension2', 'extension1'])

    editor.destroy()
  })

  it('should block transaction if next is not called', () => {
    const Extension1 = Extension.create({
      name: 'extension1',
      dispatchTransaction() {
        // do nothing
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1],
    })

    editor.commands.insertContent('foo')

    expect(editor.getText()).toBe('')

    editor.destroy()
  })

  it('should allow user-provided dispatchTransaction as base', () => {
    const userDispatch = vi.fn(_tr => {
      // In a real scenario, the user would update the view state here.
      // For this test, we just want to see if it's called.
    })

    const Extension1 = Extension.create({
      name: 'extension1',
      dispatchTransaction({ transaction, next }) {
        next(transaction)
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1],
      editorProps: {
        dispatchTransaction: userDispatch,
      } as any,
    })

    editor.commands.insertContent('foo')

    expect(userDispatch).toHaveBeenCalled()

    editor.destroy()
  })

  it('should bypass extensions if enableExtensionDispatchTransaction is false', () => {
    const dispatchTransaction = vi.fn(({ transaction, next }) => next(transaction))
    const CustomExtension = Extension.create({
      name: 'custom',
      dispatchTransaction,
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomExtension],
      enableExtensionDispatchTransaction: false,
    })

    editor.commands.insertContent('foo')

    expect(dispatchTransaction).not.toHaveBeenCalled()

    editor.destroy()
  })
})
