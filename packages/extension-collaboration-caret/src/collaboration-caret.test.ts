import { describe, expect, test } from 'vite-plus/test'

import { CollaborationCaret } from './collaboration-caret.js'

const maliciousColor =
  'red; position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; background:black'

describe('default collaboration caret renderers', () => {
  test('does not apply extra declarations from a user color', () => {
    const cursor = CollaborationCaret.options.render({ name: 'Bob', color: maliciousColor })
    const label = cursor.querySelector<HTMLElement>('.collaboration-carets__label')

    expect(cursor.style.borderColor).toBe('transparent')
    expect(cursor.style.position).toBe('')
    expect(cursor.style.width).toBe('')
    expect(label?.style.backgroundColor).toBe('transparent')
  })

  test('does not add extra declarations to a selection', () => {
    const attributes = CollaborationCaret.options.selectionRender({
      name: 'Bob',
      color: maliciousColor,
    })

    expect(attributes.style).toBeUndefined()
  })

  test('applies a six-digit hex color to a selection', () => {
    const attributes = CollaborationCaret.options.selectionRender({
      name: 'Bob',
      color: '#ff0000',
    })

    expect(attributes.style).toBe('background-color: #ff000070')
  })
})
