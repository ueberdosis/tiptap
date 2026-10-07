import { describe, expect, it } from 'vite-plus/test'

import { parsePlainTextOrderedListPaste } from './utils.js'

describe('plain-text paste detection', () => {
  it('detects single-line lowercase alpha paste', () => {
    const result = parsePlainTextOrderedListPaste('a. Item 1')

    expect(result).not.toBeNull()
    expect(result!.attrs?.type).toBe('a')
    expect(result!.attrs?.start).toBeUndefined()
    expect(result!.content).toHaveLength(1)
    expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
  })

  it('detects multi-line lowercase alpha paste', () => {
    const text = 'a. Item 1\nb. Item 2'
    const result = parsePlainTextOrderedListPaste(text)

    expect(result).not.toBeNull()
    expect(result!.attrs?.type).toBe('a')
    expect(result!.content).toHaveLength(2)
    expect(result!.content![0].content![0].content![0].text).toBe('Item 1')
    expect(result!.content![1].content![0].content![0].text).toBe('Item 2')
  })

  it('sets start when pasting alpha list beginning at b', () => {
    const result = parsePlainTextOrderedListPaste('b. Item 1\nc. Item 2')

    expect(result!.attrs?.type).toBe('a')
    expect(result!.attrs?.start).toBe(2)
  })

  it('sets start when pasting numeric list beginning at 3', () => {
    const result = parsePlainTextOrderedListPaste('3. Item 1\n4. Item 2')

    expect(result!.attrs?.type).toBeUndefined()
    expect(result!.attrs?.start).toBe(3)
  })

  it('sets type and start when pasting roman list beginning at II', () => {
    const result = parsePlainTextOrderedListPaste('II. Item 1\nIII. Item 2')

    expect(result!.attrs?.type).toBe('I')
    expect(result!.attrs?.start).toBe(2)
  })

  it('detects alpha paste with paren separator', () => {
    const result = parsePlainTextOrderedListPaste('a) Item 1\nb) Item 2')

    expect(result).not.toBeNull()
    expect(result!.content).toHaveLength(2)
  })

  it('detects roman numeral paste with dot separator', () => {
    const result = parsePlainTextOrderedListPaste('i. Item 1\nii. Item 2')

    expect(result).not.toBeNull()
    expect(result!.content).toHaveLength(2)
  })

  it('detects roman numeral paste with paren separator', () => {
    const result = parsePlainTextOrderedListPaste('I) Item 1\nII) Item 2')

    expect(result).not.toBeNull()
    expect(result!.content).toHaveLength(2)
  })

  it('detects numeric paste with dot separator', () => {
    const result = parsePlainTextOrderedListPaste('1. Item 1\n2. Item 2')

    expect(result).not.toBeNull()
    expect(result!.content).toHaveLength(2)
  })

  it('does not match plain text without list markers', () => {
    const result = parsePlainTextOrderedListPaste('Just some text\nAnd more text')

    expect(result).toBeNull()
  })

  it('does not match mixed content (some lines have markers, some do not)', () => {
    const result = parsePlainTextOrderedListPaste('a. Item 1\nThis is not a list item')

    expect(result).toBeNull()
  })

  it('does not match short patterns without content after marker', () => {
    const result = parsePlainTextOrderedListPaste('a. ')

    expect(result).toBeNull()
  })

  it('does not match three-letter alpha markers', () => {
    const result = parsePlainTextOrderedListPaste('abc. Something')

    expect(result).toBeNull()
  })

  it('does not match non-sequential markers', () => {
    const result = parsePlainTextOrderedListPaste('a. Item 1\nc. Item 3')

    expect(result).toBeNull()
  })
})
