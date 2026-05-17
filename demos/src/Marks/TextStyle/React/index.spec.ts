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

test.describe('/src/Marks/TextStyle/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Marks/TextStyle/React/')
  })

  test.describe('mergeNestedSpanStyles', () => {
    test('should merge styles of a span with one child span', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(4) > span')).toHaveCount(1)
      await expect(page.locator('.tiptap > p:nth-child(4) > span').first()).toHaveText('red serif')
      await expect(page.locator('.tiptap > p:nth-child(4) > span').first()).toHaveAttribute(
        'style',
        'color: #FF0000; font-family: serif',
      )
    })
    test('should merge styles of a span with one nested child span into the descendant span', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(5) > span')).toHaveCount(1)
      await expect(page.locator('.tiptap > p:nth-child(5) > span').first()).toHaveText('blue serif')
      await expect(page.locator('.tiptap > p:nth-child(5) > span').first()).toHaveAttribute(
        'style',
        'color: #0000FF; font-family: serif',
      )
    })
    test('should merge styles of a span with multiple child spans into all child spans', async ({ page }) => {
      await expect(page.locator('.tiptap > p:nth-child(6) > span')).toHaveCount(2)
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(1)').first()).toHaveText('green serif ')
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(1)').first()).toHaveAttribute(
        'style',
        'color: #00FF00; font-family: serif',
      )
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(2)').first()).toHaveText('red serif')
      await expect(page.locator('.tiptap > p:nth-child(6) > span:nth-child(2)').first()).toHaveAttribute(
        'style',
        'color: #FF0000; font-family: serif',
      )
    })
    test('should merge styles of descendant spans into each descendant span when the parent span has no style', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(7) > span')).toHaveCount(4)
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(1)').first()).toHaveText('blue')
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(1)').first()).toHaveAttribute(
        'style',
        'color: #0000FF',
      )
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(2)').first()).toHaveText('green ')
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(2)').first()).toHaveAttribute(
        'style',
        'color: #00FF00',
      )
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(3)').first()).toHaveText('green serif')
      await expect(page.locator('.tiptap > p:nth-child(7) > span:nth-child(3)').first()).toHaveAttribute(
        'style',
        'color: #00FF00; font-family: serif',
      )
    })
    test('should merge styles of a span with nested root text and descendant spans into each descendant span', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(8) > span')).toHaveCount(4)
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(1)').first()).toHaveText('blue ')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(1)').first()).toHaveAttribute(
        'style',
        'color: #0000FF',
      )
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(2)').first()).toHaveText('green ')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(2)').first()).toHaveAttribute(
        'style',
        'color: #00FF00',
      )
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(3)').first()).toHaveText('green serif ')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(3)').first()).toHaveAttribute(
        'style',
        'color: #00FF00; font-family: serif',
      )
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(4)').first()).toHaveText('blue serif')
      await expect(page.locator('.tiptap > p:nth-child(8) > span:nth-child(4)').first()).toHaveAttribute(
        'style',
        'color: #0000FF; font-family: serif',
      )
    })
    test('should merge styles of descendant spans into each descendant span when the parent span has other tags', async ({
      page,
    }) => {
      await expect(page.locator('.tiptap > p:nth-child(9) > span')).toHaveCount(4)
      expect(
        await page
          .locator('.tiptap > p:nth-child(9) > :nth-child(1)')
          .first()
          .evaluate((el, prop) => (el as any)[prop], 'tagName'),
      ).toBe('STRONG')
      await expect(page.locator('.tiptap > p:nth-child(9) > :nth-child(1)').first()).toHaveText('strong ')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)').first()).toHaveText('strong blue ')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)').first()).toHaveAttribute(
        'style',
        'color: #0000FF',
      )
      await expect(
        page.locator('.tiptap > p:nth-child(9) > span:nth-child(2)').locator('strong').first(),
      ).toBeAttached()
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)').first()).toHaveText(
        'strong blue serif ',
      )
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)').first()).toHaveAttribute(
        'style',
        'color: #0000FF; font-family: serif; font-size: 24px',
      )
      await expect(
        page.locator('.tiptap > p:nth-child(9) > span:nth-child(3)').locator('strong').first(),
      ).toBeAttached()
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)').first()).toHaveText('strong green ')
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)').first()).toHaveAttribute(
        'style',
        'color: #00FF00',
      )
      await expect(
        page.locator('.tiptap > p:nth-child(9) > span:nth-child(4)').locator('strong').first(),
      ).toBeAttached()
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)').first()).toHaveText(
        'strong green serif',
      )
      await expect(page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)').first()).toHaveAttribute(
        'style',
        'color: #00FF00; font-family: serif',
      )
      await expect(
        page.locator('.tiptap > p:nth-child(9) > span:nth-child(5)').locator('strong').first(),
      ).toBeAttached()
    })
  })
})
