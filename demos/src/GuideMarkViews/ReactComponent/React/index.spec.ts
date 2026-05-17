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

test.describe('/src/GuideMarkViews/ReactComponent/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideMarkViews/ReactComponent/React/')

    await setEditorContent(page, '<p>Example Text</p><react-component>Mark View Text</react-component>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should show the markview', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view"]').first()).toBeAttached()
  })

  test('should show the markview content in the markview', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view-content-wrapper"]').first()).toBeAttached()
    await expect(
      page
        .locator('.tiptap')
        .locator('[data-test-id="mark-view-content-wrapper"]')
        .filter({ hasText: 'Mark View Text' })
        .first(),
    ).toBeAttached()
  })

  test('should allow clicking the button', async ({ page }) => {
    await expect(
      page
        .locator('.tiptap')
        .locator('[data-test-id="count-button"]')
        .filter({ hasText: 'This button has been clicked 0 times.' })
        .first(),
    ).toBeAttached()
    await page.locator('.tiptap').locator('[data-test-id="count-button"]').first().click()

    await expect(
      page
        .locator('.tiptap')
        .locator('[data-test-id="count-button"]')
        .filter({ hasText: 'This button has been clicked 1 times.' })
        .first(),
    ).toBeAttached()
  })

  test('should update the attributes of the mark on button click', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view').first()).toHaveAttribute('data-count', '0')

    // click on the button
    await page.locator('.tiptap').locator('[data-test-id="update-attributes-button"]').first().click()
    // Playwright `expect` retries until the assertion settles, so the
    // original `requestAnimationFrame` paint-deadline wrapper is no
    // longer needed.
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view"]').first()).toHaveAttribute(
      'data-count',
      '1',
    )
  })
})
