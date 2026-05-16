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

test.describe('/src/Nodes/BulletList/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/BulletList/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse unordered lists correctly', async ({ page }) => {
    await setEditorContent(page, '<ul><li><p>Example Text</p></li></ul>')
    expect(await getEditorHTML(page)).toBe('<ul><li><p>Example Text</p></li></ul>')
  })

  test('should parse unordered lists without paragraphs correctly', async ({ page }) => {
    await setEditorContent(page, '<ul><li>Example Text</li></ul>')
    expect(await getEditorHTML(page)).toBe('<ul><li><p>Example Text</p></li></ul>')
  })

  test('the button should make the selected line a bullet list item', async ({ page }) => {
    await expect(page.locator('.tiptap ul')).toHaveCount(0)

    await expect(page.locator('.tiptap ul li')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ul')).toContainText('Example Text')

    await expect(page.locator('.tiptap').locator('ul li')).toContainText('Example Text')
  })

  test('the button should toggle the bullet list', async ({ page }) => {
    await expect(page.locator('.tiptap ul')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ul')).toContainText('Example Text')

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap ul')).toHaveCount(0)
  })

  test('should leave the list with double enter', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '- List Item 1{enter}{enter}Paragraph')

    // TODO(playwright-migration): unhandled .its(...) on page.locator('.tiptap').locator('li')
    expect(await page.locator('.tiptap').locator('li').count()).toBe(1)

    await expect(page.locator('.tiptap').locator('p')).toContainText('Paragraph')
  })

  test('should make the paragraph a bullet list keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: '8' })
    await expect(page.locator('.tiptap').locator('ul li')).toContainText('Example Text')
  })

  test('should make a bullet list from an asterisk', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '* List Item 1{enter}List Item 2')

    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toContainText('List Item 1')

    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toContainText('List Item 2')
  })

  test('should make a bullet list from a dash', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '- List Item 1{enter}List Item 2')

    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toContainText('List Item 1')

    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toContainText('List Item 2')
  })

  test('should make a bullet list from a plus', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '+ List Item 1{enter}List Item 2')

    await expect(page.locator('.tiptap').locator('li:nth-child(1)')).toContainText('List Item 1')

    await expect(page.locator('.tiptap').locator('li:nth-child(2)')).toContainText('List Item 2')
  })

  test('should remove the bullet list after pressing backspace', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '* {backspace}Example')

    await expect(page.locator('.tiptap').locator('p')).toContainText('* Example')
  })
})
