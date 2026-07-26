/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// The package boundary must stay a client module so it can be imported from
// React Server Components without evaluating the class components inside.
const entries = ['./index.ts', './menus/index.ts']

describe('use client boundary', () => {
  it.each(entries)('%s starts with the "use client" directive', entry => {
    const path = fileURLToPath(new URL(entry, import.meta.url))

    // The directive must be the very first statement (only a BOM may precede
    // it), otherwise some RSC tooling ignores it. Do not trim leading blanks.
    const firstLine = readFileSync(path, 'utf8')
      .replace(/^\uFEFF/, '')
      .split('\n')[0]
      .trimEnd()

    expect(firstLine).toMatch(/^(['"])use client\1;?$/)
  })
})
