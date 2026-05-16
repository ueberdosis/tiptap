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

test.describe('/src/Nodes/Blockquote/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/Blockquote/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse blockquote tags correctly', async ({ page }) => {
    await setEditorContent(page, '<blockquote><p>Example Text</p></blockquote>')
    expect(await getEditorHTML(page)).toBe('<blockquote><p>Example Text</p></blockquote>')
  })

  test('should parse blockquote tags without paragraphs correctly', async ({ page }) => {
    await setEditorContent(page, '<blockquote>Example Text</blockquote>')
    expect(await getEditorHTML(page)).toBe('<blockquote><p>Example Text</p></blockquote>')
  })

  test('the button should make the selected line a blockquote', async ({ page }) => {
    await expect(page.locator('.tiptap blockquote')).toHaveCount(0)

    await page.locator('button').first().click()

    await expect(
      page.locator('.tiptap').locator('blockquote').filter({ hasText: 'Example Text' }).first(),
    ).toBeAttached()
  })

  test('the button should wrap all nodes in one blockquote', async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p><p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap').locator('blockquote')).toHaveCount(1)
  })

  test('the button should toggle the blockquote', async ({ page }) => {
    await expect(page.locator('.tiptap blockquote')).toHaveCount(0)

    await page.locator('button').first().click()

    await expect(
      page.locator('.tiptap').locator('blockquote').filter({ hasText: 'Example Text' }).first(),
    ).toBeAttached()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')

    await page.locator('button').first().click()

    await expect(page.locator('.tiptap blockquote')).toHaveCount(0)
  })

  test('should make the selected line a blockquote when the keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { shiftKey: true, modKey: true, key: 'b' })
    await expect(
      page.locator('.tiptap').locator('blockquote').filter({ hasText: 'Example Text' }).first(),
    ).toBeAttached()
  })

  test('should toggle the blockquote when the keyboard shortcut is pressed', async ({ page }) => {
    await expect(page.locator('.tiptap blockquote')).toHaveCount(0)

    await pressShortcut(page, { shiftKey: true, modKey: true, key: 'b' })
    await expect(
      page.locator('.tiptap').locator('blockquote').filter({ hasText: 'Example Text' }).first(),
    ).toBeAttached()

    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
    await pressShortcut(page, { shiftKey: true, modKey: true, key: 'b' })

    await expect(page.locator('.tiptap blockquote')).toHaveCount(0)
  })

  test('should make a blockquote from markdown shortcuts', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '> Quote')
    await expect(page.locator('.tiptap').locator('blockquote').filter({ hasText: 'Quote' }).first()).toBeAttached()
  })
})
