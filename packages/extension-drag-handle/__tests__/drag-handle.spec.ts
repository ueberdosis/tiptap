import { Editor } from '@dibdab/core'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { DragHandle } from '../src/drag-handle.js'

describe('DragHandle', () => {
  let editor: Editor
  let dragHandleElement: HTMLElement

  beforeEach(() => {
    dragHandleElement = document.createElement('div')
    dragHandleElement.classList.add('drag-handle')

    editor = new Editor({
      element: document.body,
      extensions: [
        Document,
        Paragraph,
        Text,
        DragHandle.configure({
          render: () => dragHandleElement,
        }),
      ],
      content: '<p>Hello World</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  describe('data-dragging attribute', () => {
    it('should initialize data-dragging attribute to false', () => {
      expect(dragHandleElement.dataset.dragging).toBe('false')
    })

    it('should set data-dragging to true on dragstart', () => {
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      dragHandleElement.dispatchEvent(dragStartEvent)

      expect(dragHandleElement.dataset.dragging).toBe('true')
    })

    it('should set data-dragging to false on dragend', () => {
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })

      dragHandleElement.dispatchEvent(dragStartEvent)

      expect(dragHandleElement.dataset.dragging).toBe('true')

      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true,
        cancelable: true,
      })

      dragHandleElement.dispatchEvent(dragEndEvent)

      expect(dragHandleElement.dataset.dragging).toBe('false')
    })

    it('should maintain data-dragging state through multiple drag cycles', () => {
      const dataTransfer = new DataTransfer()

      for (let i = 0; i < 3; i += 1) {
        const dragStartEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        })

        dragHandleElement.dispatchEvent(dragStartEvent)
        expect(dragHandleElement.dataset.dragging).toBe('true')

        const dragEndEvent = new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
        })

        dragHandleElement.dispatchEvent(dragEndEvent)
        expect(dragHandleElement.dataset.dragging).toBe('false')
      }
    })
  })

  describe('element properties', () => {
    it('should have draggable set to true', () => {
      expect(dragHandleElement.draggable).toBe(true)
    })

    it('should have pointer events set to auto initially', () => {
      expect(dragHandleElement.style.pointerEvents).toBe('auto')
    })
  })
})
