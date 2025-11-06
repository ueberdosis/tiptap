import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('Basic test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('can import Editor from @tiptap/core', () => {
    expect(Editor).toBeDefined()
  })
})
