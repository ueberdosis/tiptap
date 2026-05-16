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

test.describe('/src/Examples/MarkdownShortcuts/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Examples/MarkdownShortcuts/React/')
  })

  test.beforeEach(async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)
  })

  test('should make a h1', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '# Headline')
    await expect(page.locator('.tiptap').locator('h1').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h2', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '## Headline')
    await expect(page.locator('.tiptap').locator('h2').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h3', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '### Headline')
    await expect(page.locator('.tiptap').locator('h3').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h4', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '#### Headline')
    await expect(page.locator('.tiptap').locator('h4').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h5', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '##### Headline')
    await expect(page.locator('.tiptap').locator('h5').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should make a h6', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '###### Headline')
    await expect(page.locator('.tiptap').locator('h6').filter({ hasText: 'Headline' }).first()).toBeAttached()
  })

  test('should create inline code', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '`$foobar`')
    await expect(page.locator('.tiptap').locator('code').filter({ hasText: '$foobar' }).first()).toBeAttached()
  })

  test('should create a code block without language', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '``` {enter}const foo = bar{enter}```')
    await expect(page.locator('.tiptap').locator('pre').filter({ hasText: 'const foo = bar' }).first()).toBeAttached()
  })

  test('should create a bullet list from asteriks', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '* foobar')
    await expect(page.locator('.tiptap').locator('ul').filter({ hasText: 'foobar' }).first()).toBeAttached()
  })

  test('should create a bullet list from dashes', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '- foobar')
    await expect(page.locator('.tiptap').locator('ul').filter({ hasText: 'foobar' }).first()).toBeAttached()
  })

  test('should create a bullet list from pluses', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '+ foobar')
    await expect(page.locator('.tiptap').locator('ul').filter({ hasText: 'foobar' }).first()).toBeAttached()
  })

  test('should create a ordered list', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '1. foobar')
    await expect(page.locator('.tiptap').locator('ol').filter({ hasText: 'foobar' }).first()).toBeAttached()
  })

  test('should create a blockquote', async ({ page }) => {
    await page.locator('.tiptap').first().click()
    await typeText(page, '> foobar')
    await expect(page.locator('.tiptap').locator('blockquote').filter({ hasText: 'foobar' }).first()).toBeAttached()
  })
})
