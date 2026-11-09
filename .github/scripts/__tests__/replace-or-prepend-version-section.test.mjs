import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { replaceOrPrependVersionSection } from '../../../scripts/replace-or-prepend-version-section.js'

describe('replaceOrPrependVersionSection', () => {
  it('replaces the section with the same heading', () => {
    const body = '## v3.1.0\n\n- Old.\n\n## v3.0.0\n\n- Older.\n'

    assert.equal(
      replaceOrPrependVersionSection(body, '## v3.1.0\n\n- New.\n', 'v3.1.0'),
      '## v3.1.0\n\n- New.\n\n## v3.0.0\n\n- Older.\n',
    )
  })

  it('keeps the pre-release section when releasing the stable version', () => {
    const body = '## v3.1.0-next.1\n\n- Next.\n'

    assert.equal(
      replaceOrPrependVersionSection(body, '## v3.1.0\n\n- Stable.\n', 'v3.1.0'),
      '## v3.1.0\n\n- Stable.\n\n## v3.1.0-next.1\n\n- Next.\n',
    )
  })
})
