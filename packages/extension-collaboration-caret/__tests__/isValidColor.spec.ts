import { describe, expect, test } from 'vite-plus/test'
import { CollaborationCaret } from '../src/collaboration-caret.js'
import { isValidColor } from '../src/lib/isValidColor.js'

const maliciousColor =
  'red; position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; background:black'

describe('isValidColor', () => {
  // we only expect 6-digit hex values because thats
  // what y-tiptap is exposing to the client
  test.each(['#ffffff', '#1a2b3c', '#ABCDEF'])('returns true for a six-digit hex color', color => {
    expect(isValidColor(color)).toBe(true)
  })

  test.each([
    null,
    undefined,
    '#fff',
    '#ffff',
    '#ffffffff',
    'red',
    'rgb(255, 0, 0)',
    maliciousColor,
    'red; background-image: url(https://example.com)',
    'red } body { display: none',
  ])('returns false for an unsupported color', color => {
    expect(isValidColor(color)).toBe(false)
  })
})

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
