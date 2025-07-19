import { describe, expect, test } from 'vitest'

import { tokenize } from './utils.js'

describe('Markdown utils', () => {
  test('should tokenize markdown to correct token', () => {
    const markdown = '# Hello World\n\nThis is a paragraph.'
    const tokens = tokenize(markdown)

    expect(tokens).toBeDefined()
    expect(tokens).toHaveLength(6)

    expect(tokens[0].type).toBe('heading_open')
    expect(tokens[0].tag).toBe('h1')

    expect(tokens[1].type).toBe('inline')
    expect(tokens[1].content).toBe('Hello World')

    expect(tokens[2].type).toBe('heading_close')

    expect(tokens[3].type).toBe('paragraph_open')

    expect(tokens[4].type).toBe('inline')
    expect(tokens[4].content).toBe('This is a paragraph.')

    expect(tokens[5].type).toBe('paragraph_close')
  })

  test('should tokenize custom markdown', () => {
    const markdown = '## Test\n\nThis is a mention for [@Mark](32)'
    const tokens = tokenize(markdown)

    expect(tokens).toBeDefined()
    console.log(JSON.stringify(tokens))
  })
})
