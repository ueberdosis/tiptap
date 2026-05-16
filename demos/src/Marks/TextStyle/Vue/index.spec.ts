import {
  editorEval,
  expect,
  getEditorHTML,
  getEditorJSON,
  getEditorText,
  pasteIntoEditor,
  pressShortcut,
  setEditorContent,
  test,
  typeInEditor,
  typeText,
  waitForEditor,
  withEditor,
} from '../../../../../tests/e2e/support/index.js'

test.describe('/src/Marks/TextStyle/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/TextStyle/Vue/')
  })

  test.describe('mergeNestedSpanStyles', () => {
    test('should merge styles of a span with one child span', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(4) > span')).toHaveCount(1)
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(4) > span')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(4) > span')
    })
    test('should merge styles of a span with one nested child span into the descendant span', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(5) > span')).toHaveCount(1)
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(5) > span')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(5) > span')
    })
    test('should merge styles of a span with multiple child spans into all child spans', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(6) > span')).toHaveCount(2)
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(1)')).toHaveText('green serif ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(6) > span:nth-child(1)')
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(2)')).toHaveText('red serif')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(6) > span:nth-child(2)')
    })
    test('should merge styles of descendant spans into each descendant span when the parent span has no style', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(7) > span')).toHaveCount(4)
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(1)')).toHaveText('blue')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(7) > span:nth-child(1)')
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(2)')).toHaveText('green ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(7) > span:nth-child(2)')
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(3)')).toHaveText('green serif')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(7) > span:nth-child(3)')
    })
    test('should merge styles of a span with nested root text and descendant spans into each descendant span', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(8) > span')).toHaveCount(4)
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(1)')).toHaveText('blue ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(8) > span:nth-child(1)')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(2)')).toHaveText('green ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(8) > span:nth-child(2)')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(3)')).toHaveText('green serif ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(8) > span:nth-child(3)')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(4)')).toHaveText('blue serif')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(8) > span:nth-child(4)')
    })
    test('should merge styles of descendant spans into each descendant span when the parent span has other tags', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(9) > span')).toHaveCount(4)
      // TODO(playwright-migration): unhandled should('have.prop', ...) on page.locator('.tiptap > p:nth-child(9) > :nth-child(1)')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(9) > :nth-child(1)')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)')).toHaveText('strong blue ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)').locator('strong')).toHaveCount(1)
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)')).toHaveText('strong blue serif ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)').locator('strong')).toHaveCount(1)
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)')).toHaveText('strong green ')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)').locator('strong')).toHaveCount(1)
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)')).toHaveText('strong green serif')
      // TODO(playwright-migration): unhandled .and(...) on page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)').locator('strong')).toHaveCount(1)
    })
  })
})
