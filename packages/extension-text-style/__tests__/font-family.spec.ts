import { FontFamily } from '@tiptap/extension-text-style'
import { describe, expect, it } from 'vitest'

const ext: any = (FontFamily as any).configure()
const globalAttrs = ext.config.addGlobalAttributes && ext.config.addGlobalAttributes.call(ext)[0]
const { parseHTML } = globalAttrs.attributes.fontFamily

describe('fontFamily parseHTML', () => {
  it('preserves unquoted multi-word values without canonicalizing to quoted form', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: Comic Sans MS, Comic Sans')

    const parsed = parseHTML(el)

    expect(parsed).toBe('Comic Sans MS, Comic Sans')
  })

  it('preserves single-quoted values without converting to double quotes', () => {
    const el = document.createElement('span')
    el.setAttribute('style', "font-family: 'Exo 2'")

    const parsed = parseHTML(el)

    expect(parsed).toBe("'Exo 2'")
  })

  it('preserves double-quoted values as-is', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: "Open Sans"')

    const parsed = parseHTML(el)

    expect(parsed).toBe('"Open Sans"')
  })

  it('parses simple single-word values', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: Inter')

    const parsed = parseHTML(el)

    expect(parsed).toBe('Inter')
  })

  it('parses generic keyword values', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: serif')

    const parsed = parseHTML(el)

    expect(parsed).toBe('serif')
  })

  it('preserves CSS variable values', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: var(--title-font-family)')

    const parsed = parseHTML(el)

    expect(parsed).toBe('var(--title-font-family)')
  })

  it('returns the last declaration when font-family is declared multiple times', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-family: Inter; font-family: Arial')

    const parsed = parseHTML(el)

    expect(parsed).toBe('Arial')
  })

  it('ignores other style declarations and only returns font-family', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: red; font-family: Inter; font-size: 16px')

    const parsed = parseHTML(el)

    expect(parsed).toBe('Inter')
  })

  it('is case-insensitive on the property name', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'FONT-FAMILY: Inter')

    const parsed = parseHTML(el)

    expect(parsed).toBe('Inter')
  })
})
