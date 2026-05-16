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

test.describe('/src/Examples/Community/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/Community/React/')
  })

  test('should count the characters correctly', async ({ page }) => {
    // check if count text is "44 / 280 characters"
    await expect(page.locator('.character-count').filter({ hasText: '44 / 280 characters' }).first()).toBeAttached()

    // type in .tiptap
    await page.locator('.tiptap').first().click()
    await typeText(page, ' Hello World')
    await expect(page.locator('.character-count').filter({ hasText: '56 / 280 characters' }).first()).toBeAttached()

    // remove content from .tiptap and enter text
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}Hello World')
    await expect(page.locator('.character-count').filter({ hasText: '11 / 280 characters' }).first()).toBeAttached()
  })

  test('should mention a user', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}{backspace}@')

    // check if the mention autocomplete is visible
    await expect(page.locator('.dropdown-menu').first()).toBeVisible()

    // select the first user
    // TODO(playwright-migration): .then() chain on locator
  })
})
