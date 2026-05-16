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

test.describe('/src/Nodes/ListItem/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/ListItem/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<ul><li>Example Text</li></ul>')
  })

  test('should add a new list item on Enter', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}2nd Item')

    await expect(
      page.locator('.tiptap').locator('li:nth-child(1)').filter({ hasText: 'Example Text' }).first(),
    ).toBeAttached()

    await expect(
      page.locator('.tiptap').locator('li:nth-child(2)').filter({ hasText: '2nd Item' }).first(),
    ).toBeAttached()
  })

  test('should sink the list item on Tab', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await pressShortcut(page, { key: 'Tab' })

    await page.locator('.tiptap').first().click()
    await typeText(page, '2nd Level')

    await expect(
      page.locator('.tiptap').locator('li:nth-child(1) li').filter({ hasText: '2nd Level' }).first(),
    ).toBeAttached()
  })

  test('should lift the list item on Shift+Tab', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '{enter}')
    await pressShortcut(page, { key: 'Tab' })
    await pressShortcut(page, { shiftKey: true, key: 'Tab' })

    await page.locator('.tiptap').first().click()
    await typeText(page, '1st Level')

    await expect(
      page.locator('.tiptap').locator('li:nth-child(2)').filter({ hasText: '1st Level' }).first(),
    ).toBeAttached()
  })
})
