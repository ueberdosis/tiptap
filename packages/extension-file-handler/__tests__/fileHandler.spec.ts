import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { FileHandler } from '@tiptap/extension-file-handler'
import { afterEach, describe, expect, it, vi } from 'vitest'

const createMockEvent = (files: File[], htmlContent?: string) => {
  return {
    clipboardData: {
      files,
      getData(type: string) {
        if (type === 'text/html') {
          return htmlContent || ''
        }
        return ''
      },
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as ClipboardEvent
}

const getFile = (name = 'test.png', type = 'image/png') => {
  return new File(['dummy content'], name, { type })
}

describe('extension-file-handler', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const getHandlePaste = () => {
    // Find the file handler plugin's handlePaste prop by its key name
    const plugins = editor!.view.state.plugins

    for (const plugin of plugins) {
      if (plugin.key.includes('fileHandler') && plugin.props.handlePaste) {
        return plugin.props.handlePaste
      }
    }

    return null
  }

  afterEach(() => {
    editor?.destroy()
    getEditorEl()?.remove()
    editor = null
  })

  describe('current behavior (regression)', () => {
    it('returns false when no onPaste callback is provided', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [Document, Text, Paragraph, FileHandler],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()])

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(false)
    })

    it('returns false when clipboard has no files', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([])

      // Override clipboardData to return empty files
      Object.defineProperty(event, 'clipboardData', {
        value: {
          files: [],
          getData: () => '',
        },
      })

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(false)
      expect(onPasteSpy).not.toHaveBeenCalled()
    })

    it('returns false when all files are filtered out by allowedMimeTypes', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
            allowedMimeTypes: ['application/pdf'],
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile('image.png', 'image/png')])

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(false)
      expect(onPasteSpy).not.toHaveBeenCalled()
    })

    it('calls onPaste and returns true when files are pasted without HTML', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()])

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(true)
      expect(onPasteSpy).toHaveBeenCalledOnce()
      expect(onPasteSpy).toHaveBeenCalledWith(editor, expect.any(Array), '')
    })

    it('calls onPaste and returns false when files are pasted with HTML', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()], '<img src="test.png">')

      const result = handlePaste!(editor!.view, event, {} as any)

      // When HTML is present and consumePasteEvent is false, returns false
      expect(result).toBe(false)
      expect(onPasteSpy).toHaveBeenCalledOnce()
    })

    it('receives htmlContent in onPaste callback when HTML is present', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const htmlContent = '<img src="test.png">'
      const event = createMockEvent([getFile()], htmlContent)

      handlePaste!(editor!.view, event, {} as any)

      expect(onPasteSpy).toHaveBeenCalledWith(editor, expect.any(Array), htmlContent)
    })
  })

  describe('consumePasteEvent option', () => {
    it('defaults to false (backward compatible)', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()], '<img src="test.png">')

      const result = handlePaste!(editor!.view, event, {} as any)

      // Default: onPaste is called but event is not consumed (returns false)
      expect(result).toBe(false)
      expect(onPasteSpy).toHaveBeenCalledOnce()
    })

    it('returns true when files are pasted with HTML and consumePasteEvent is true', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()], '<img src="test.png">')

      const result = handlePaste!(editor!.view, event, {} as any)

      // With consumePasteEvent: true, returns true even with HTML
      expect(result).toBe(true)
      expect(onPasteSpy).toHaveBeenCalledOnce()
    })

    it('returns true when files are pasted without HTML and consumePasteEvent is true', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()])

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(true)
      expect(onPasteSpy).toHaveBeenCalledOnce()
    })

    it('still receives htmlContent in onPaste callback when consumePasteEvent is true', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const htmlContent = '<img src="test.png">'
      const event = createMockEvent([getFile()], htmlContent)

      handlePaste!(editor!.view, event, {} as any)

      expect(onPasteSpy).toHaveBeenCalledWith(editor, expect.any(Array), htmlContent)
    })

    it('receives correct files array in onPaste callback when consumePasteEvent is true', () => {
      let receivedFiles: File[] = []

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: (_editor, files) => {
              receivedFiles = files
            },
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const file1 = getFile('image1.png', 'image/png')
      const file2 = getFile('image2.png', 'image/png')
      const event = createMockEvent([file1, file2], '<img src="test.png">')

      handlePaste!(editor!.view, event, {} as any)

      // Check files array has correct length and types
      expect(receivedFiles).toHaveLength(2)
      expect(receivedFiles[0].type).toBe('image/png')
      expect(receivedFiles[1].type).toBe('image/png')
    })

    it('calls preventDefault and stopPropagation when files are present', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: vi.fn(),
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile()])

      handlePaste!(editor!.view, event, {} as any)

      expect(event.preventDefault).toHaveBeenCalledOnce()
      expect(event.stopPropagation).toHaveBeenCalledOnce()
    })

    it('does not call onPaste when files are filtered out by allowedMimeTypes', () => {
      const onPasteSpy = vi.fn()

      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          FileHandler.configure({
            onPaste: onPasteSpy,
            allowedMimeTypes: ['application/pdf'],
            consumePasteEvent: true,
          }),
        ],
        content: '<p>test</p>',
      })

      const handlePaste = getHandlePaste()
      const event = createMockEvent([getFile('image.png', 'image/png')])

      const result = handlePaste!(editor!.view, event, {} as any)

      expect(result).toBe(false)
      expect(onPasteSpy).not.toHaveBeenCalled()
    })
  })
})
