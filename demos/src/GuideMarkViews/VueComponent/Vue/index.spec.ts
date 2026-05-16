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

test.describe('/src/GuideMarkViews/VueComponent/Vue/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/GuideMarkViews/VueComponent/Vue/')

    await setEditorContent(page, '<p>Example Text</p><vue-component>Mark View Text</vue-component>')

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should show the markview', async ({ page }) => {
    await expect(page.locator('.tiptap').locator('[data-test-id="mark-view"]')).toHaveCount(1)
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
