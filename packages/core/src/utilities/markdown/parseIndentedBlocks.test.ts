import { describe, expect, it } from 'vite-plus/test'

import { parseIndentedBlocks } from './parseIndentedBlocks.js'

const config = {
  itemPattern: /^(\s*)([-+*])\s+\[([ xX])\]\s+(.*)$/,
  extractItemData: (match: RegExpMatchArray) => ({
    indentLevel: match[1].length,
    mainContent: match[4],
  }),
  createToken: (data: any) => ({ type: 'taskItem', raw: '', ...data }),
}

const lexer = {
  inlineTokens: () => [],
  blockTokens: () => [],
}

describe('parseIndentedBlocks', () => {
  it('keeps the trailing newline in raw when the source has one', () => {
    const result = parseIndentedBlocks('- [ ] first\n- [ ] second\n', config, lexer)

    expect(result?.raw).toBe('- [ ] first\n- [ ] second\n')
  })

  it('does not add a newline to raw at the end of the source', () => {
    const result = parseIndentedBlocks('- [ ] first\n- [ ] second', config, lexer)

    expect(result?.items).toHaveLength(2)
    expect(result?.raw).toBe('- [ ] first\n- [ ] second')
  })
})
