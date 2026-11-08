import { describe, expect, it } from 'vite-plus/test'

import { filterTableOfContents } from './filterTableOfContents.js'
import type { TableOfContentsHeading } from './types.js'

const createHeadings = (levels: number[]): TableOfContentsHeading[] =>
  levels.map((level, index) => ({
    id: `heading-${index}`,
    level,
    depth: 0,
    textContent: `Heading ${index}`,
    pos: index * 10,
  }))

describe('filterTableOfContents', () => {
  it('keeps every heading without options', () => {
    const result = filterTableOfContents(createHeadings([2, 3, 4]))

    expect(result.map(heading => heading.depth)).toEqual([1, 2, 3])
  })

  it('keeps only the given levels and counts depths again', () => {
    const result = filterTableOfContents(createHeadings([1, 2, 3, 2]), { levels: [2, 3] })

    expect(result.map(heading => [heading.level, heading.depth])).toEqual([
      [2, 1],
      [3, 2],
      [2, 1],
    ])
  })

  it('makes a flat list when only one level is kept', () => {
    const result = filterTableOfContents(createHeadings([2, 3, 2, 3]), { levels: [2] })

    expect(result.map(heading => heading.depth)).toEqual([1, 1])
  })

  it('drops headings deeper than maxDepth', () => {
    const result = filterTableOfContents(createHeadings([2, 3, 4, 3]), { maxDepth: 2 })

    expect(result.map(heading => heading.level)).toEqual([2, 3, 3])
  })

  it('counts maxDepth from the shallowest kept level', () => {
    const result = filterTableOfContents(createHeadings([3, 4, 5]), { maxDepth: 1 })

    expect(result.map(heading => heading.level)).toEqual([3])
  })

  it('does not change the headings it was given', () => {
    const headings = createHeadings([2, 3])

    filterTableOfContents(headings)

    expect(headings.map(heading => heading.depth)).toEqual([0, 0])
  })
})
