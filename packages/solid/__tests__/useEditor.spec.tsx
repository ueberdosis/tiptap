import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'

import { EditorContent, useEditor } from '../src/index.js'

describe('useEditor', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    mountedElements.length = 0
  })

  it('should destroy the editor on cleanup', () => {
    const target = document.createElement('div')

    document.body.appendChild(target)
    mountedElements.push(target)

    let editorInstance: ReturnType<typeof useEditor> | undefined

    const dispose = render(() => {
      const editor = useEditor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello World</p>',
      })

      editorInstance = editor

      return <EditorContent editor={editor()} />
    }, target)

    const instance = editorInstance!()

    expect(target.querySelector('.ProseMirror')).toBeTruthy()

    dispose()

    expect(instance.isDestroyed).toBe(true)
  })
})
