import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { JSDOM } from 'jsdom'
import path from 'path'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

let dom
let document: Document

const getRootElement = () => {
  return document.querySelector('#editor') as Element
}

describe('Bold Extension', () => {
  beforeAll(async () => {
    dom = await JSDOM.fromFile(path.resolve(__dirname, '..', 'test.dom.html'), {
      contentType: 'text/html',
    })
    document = dom.window.document
  })

  describe('Initialization', () => {
    it('initializes without errors', () => {
      const editor = new Editor({
        element: getRootElement(),
        content: '<p>Example Text</p>',
        extensions: [Document, Paragraph, Text, Bold],
      })

      expect(editor).toBeTruthy()
    })

    it('allows extension access via editor', () => {
      const editor = new Editor({
        element: getRootElement(),
        content: '<p>Example Text</p>',
        extensions: [Document, Paragraph, Text, Bold],
      })

      const boldExtension = editor.extensionManager.extensions.find(
        extension => extension.name === 'bold',
      )

      expect(boldExtension).toBeTruthy()
    })
  })

  describe('Commands', () => {
    it('defines commands within the editor', () => {
      const editor = new Editor({
        element: getRootElement(),
        content: '<p>Example Text</p>',
        extensions: [Document, Paragraph, Text, Bold],
      })

      expect(editor.commands.setBold).toBeDefined()
      expect(editor.commands.unsetBold).toBeDefined()
    })

    it('allows command extensions to be called via editor commands', () => {
      const editor = new Editor({
        element: getRootElement(),
        content: '<p>Example Text</p>',
        extensions: [Document, Paragraph, Text, Bold],
      })

      editor.commands.setBold()

      expect(editor.getText()).toContain('Example Text')
    })
  })
})
