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
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view"]')).toHaveCount(1)
  })

  test('should show the markview content in the markview', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view-content-wrapper"]')).toHaveCount(1)
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view-content-wrapper"]')).toContainText(
      'Mark View Text',
    )
  })

  test('should allow clicking the button', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="count-button"]')).toContainText(
      'This button has been clicked 0 times.',
    )
    await page.locator('.tiptap').locator('[data-test-id="count-button"]').first().click()
    // TODO(playwright-migration): .then() chain on locator
  })

  test('should update the attributes of the mark on button click', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view')).toHaveAttribute('data-count', '0')

    // click on the button
    await page.locator('.tiptap').locator('[data-test-id="update-attributes-button"]').first().click()
    // TODO(playwright-migration): .then() chain on locator
  })
})
