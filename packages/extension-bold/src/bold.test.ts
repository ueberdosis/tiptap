import {
  starInputRegex,
  starPasteRegex,
  underscoreInputRegex,
  underscorePasteRegex,
} from './bold.js'
import { describe, expect, it } from 'vite-plus/test'

describe('bold regex test', () => {
  it('star input regex matches', () => {
    expect('**Test**').toMatch(starInputRegex)
  })

  it('star paste regex matches', () => {
    expect('**Test**').toMatch(starPasteRegex)
  })

  it('underscore input regex matches', () => {
    expect('__Test__').toMatch(underscoreInputRegex)
  })

  it('underscore paste regex matches', () => {
    expect('__Test__').toMatch(underscorePasteRegex)
  })
})
