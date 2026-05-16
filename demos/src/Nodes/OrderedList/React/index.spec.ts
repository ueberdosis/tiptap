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

test.describe('/src/Nodes/OrderedList/React/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/src/Nodes/OrderedList/React/')
  })

  test.beforeEach(async ({ page }) => {
    await setEditorContent(page, '<p>Example Text</p>')
    await page.locator('.tiptap').first().click()
    await typeText(page, '{selectall}')
  })

  test('should parse ordered lists correctly', async ({ page }) => {
    await setEditorContent(page, '<ol><li><p>Example Text</p></li></ol>')
    expect(await getEditorHTML(page)).toBe('<ol><li><p>Example Text</p></li></ol>')
  })

  test('should parse ordered lists without paragraphs correctly', async ({ page }) => {
    await setEditorContent(page, '<ol><li>Example Text</li></ol>')
    expect(await getEditorHTML(page)).toBe('<ol><li><p>Example Text</p></li></ol>')
  })

  test('the button should make the selected line a ordered list item', async ({ page }) => {
    await expect(page.locator('.tiptap ol')).toHaveCount(0)

    await expect(page.locator('.tiptap ol li')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ol').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await expect(page.locator('.tiptap').locator('ol li').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('the button should toggle the ordered list', async ({ page }) => {
    await expect(page.locator('.tiptap ol')).toHaveCount(0)

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap').locator('ol').filter({ hasText: 'Example Text' }).first()).toBeAttached()

    await page.locator('button:nth-child(1)').first().click()

    await expect(page.locator('.tiptap ol')).toHaveCount(0)
  })

  test('should make the paragraph an ordered list keyboard shortcut is pressed', async ({ page }) => {
    await pressShortcut(page, { modKey: true, shiftKey: true, key: '7' })
    await expect(page.locator('.tiptap').locator('ol li').filter({ hasText: 'Example Text' }).first()).toBeAttached()
  })

  test('should leave the list with double enter', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '1. List Item 1{enter}{enter}Paragraph')

    expect(await page.locator('.tiptap').locator('li').count()).toBe(1)

    await expect(page.locator('.tiptap').locator('p').filter({ hasText: 'Paragraph' }).first()).toBeAttached()
  })

  test('should make a ordered list from a number', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '1. List Item 1{enter}List Item 2')

    await expect(
      page.locator('.tiptap').locator('li:nth-child(1)').filter({ hasText: 'List Item 1' }).first(),
    ).toBeAttached()

    await expect(
      page.locator('.tiptap').locator('li:nth-child(2)').filter({ hasText: 'List Item 2' }).first(),
    ).toBeAttached()
  })

  test('should make a ordered list from a number other than number one', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '2. List Item 1{enter}List Item 2')

    await expect(
      page.locator('.tiptap').locator('li:nth-child(1)').filter({ hasText: 'List Item 1' }).first(),
    ).toBeAttached()
    await expect(
      page.locator('.tiptap').locator('li:nth-child(2)').filter({ hasText: 'List Item 2' }).first(),
    ).toBeAttached()
  })

  test('should remove the ordered list after pressing backspace', async ({ page }) => {
    await waitForEditor(page, '.tiptap')
    await page.evaluate(__expr => {
      const editor = (document.querySelector('.tiptap') as any).editor
      editor.commands.clearContent()
    }, undefined)

    await page.locator('.tiptap').first().click()
    await typeText(page, '1. {backspace}Example')

    await expect(page.locator('.tiptap').locator('p').filter({ hasText: '1. Example' }).first()).toBeAttached()
  })
})
